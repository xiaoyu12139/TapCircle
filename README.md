# Pulse Tap 休闲小游戏设计方案

## 概述
- 类型：节奏命中 + 反应速度的休闲 2D 游戏，单指操作
- 目标：3 秒懂规则，30–90 秒一局，可碎片化游玩
- 平台：微信小游戏 / Cocos Creator 3.x
- 包体：主包 ≤ 4MB，资源精简，可远程或分包

## 玩法规则
- 屏幕内生成 1–3 个活动圈，半径持续缩小至命中窗口
- 圈进入命中窗口时点击，越准分越高；连击提升倍率
- 所有在场目标到期前全部命中触发清屏奖励
- 圆心位置随机，保持最小间距与安全边距，避免遮挡 HUD

## 操作与判定
- 操作：单指点击
- 命中窗口：时间偏差阈值随难度收紧
  - Perfect：±60ms → ±25ms
  - Good：±120ms → ±60ms
- 评分：Perfect=100×倍率；Good=60×倍率；Miss=0
- 连击倍率：1 + floor(连击/5) × 0.2；Miss 降级一档而非清零
- 输入延迟校准：开局前 3 次点击估算 bias 自动修正

## 难度与节奏
- 并发数量：0–20s 为 1 个；20–45s 为 2 个；45s+ 短时 3 个
- 生成间隔：spawnInterval 线性缩短（900→700→550ms）
- 缩小速度：speed = s0 × (1 + k × floor(存活时间/10s))，推荐 s0=1.0、k=0.15
- 回退策略：每次 Miss 回退一档速度与窗口，保障可继续

## 随机与并发
- 圆心随机：玩法区域内均匀或偏中心随机；避开屏幕边缘与 HUD
- 最小间距：minDist=180→140→110（随难度缩小）
- 安全边距：margin = radius + uiMargin，避免出屏
- 并发错峰：同屏窗口中心至少相隔 240ms，避免同瞬间双命中提示
- 目标选择：高亮优先判定；兜底可使用“误差最近”策略

## 重叠策略
- 默认不重叠，保证可读性与命中清晰度
- 中后期可受控重叠：圆心间距 ≥ 0.6 × (r1 + r2)，并确保窗口错峰 ≥ 200–300ms
- 同心嵌套允许但半径差 ≥ 30px，错峰 ≥ 250ms；重叠期间并发总数 ≤ 2

## 反馈与表现
- 高亮圈：亮色描边、外发光、脉冲动画，置顶 Z 序
- 非高亮圈：半透明、细描边；不同色相区分目标
- 飘字与音效：+100/+60、连击提示；Perfect/Good/Miss 分级音效
- 震动：Perfect 轻震，Miss 低频震动；设置可关闭

## UI 与流程
- 开始页：Logo、开始、最高分、设置
- HUD：分数、连击、时间条/进度、暂停
- 结算页：分数、最高分、最佳命中、再来一局、激励视频继续一次
- 设置：音量、色盲友好、震动开关

## 参数配置示例
```json
{
  "maxConcurrentRings": 2,
  "spawnIntervalMs": [900, 700, 550],
  "minOffsetBetweenWindowsMs": 240,
  "thresholds": {
    "perfect": [60, 50, 40, 30, 25],
    "good": [120, 100, 80, 70, 60]
  },
  "combo": {
    "step": 5,
    "stepBonus": 0.2,
    "downgradeOnMiss": 1
  },
  "random": {
    "areaMarginPx": 24,
    "minDistPx": [180, 140, 110],
    "biasCenterWeight": 0.6
  },
  "ring": {
    "baseRadiusPx": 120,
    "strokePx": 6,
    "yOrigin": "center"
  },
  "scoring": {
    "perfect": 100,
    "good": 60,
    "clearAllBonus": 200
  },
  "overlap": {
    "enabled": true,
    "minCenterRatio": 0.6,
    "minWindowOffsetMs": 250,
    "maxConcurrentWhenOverlap": 2,
    "minNestedRadiusGapPx": 30
  },
  "audio": {
    "enableHaptics": true,
    "volumes": { "ui": 0.7, "hit": 0.9 }
  }
}
```

## 技术架构（Cocos Creator 3.x）
- 场景与节点：Canvas、GameController、RingLayer、VFXLayer、AudioManager
- 组件：
  - RingSpawner：并发调度、随机采样、错峰与最小间距约束
  - Ring：生命周期（缩放、窗口开启/关闭、高亮态）
  - ScoreManager：判定、加分、连击、清屏奖励
  - DifficultyManager：时间台阶的速度与阈值调整
  - InputManager：点击时间戳与 bias 修正
  - HUD：分数、连击、时间/进度、暂停
  - VFXManager：Perfect/Good/Miss 的特效与飘字
- 对象池：复用 Ring、飘字、粒子，降低 GC；目标 60 FPS

## 事件与接口
- Ring.onWindowOpen(timestamp, id)
- Ring.onWindowClose(timestamp, id)
- GameController.onTap(timestamp)
- ScoreManager.onHit(type, errorMs)
- RingSpawner.onSpawn(count)
- DifficultyManager.onStepUp(stepIndex)

## 构建与平台
- 微信小游戏：合法域名、分包与远程资源策略；开发者工具导入
- 包体控制：矢量 UI、音频压缩、关键音效预加载

## 数据采集与迭代
- 指标：平均局时、连击分布、命中偏差直方图、并发冲突点击次数、Miss 位置、清屏奖励触发率、继续一次使用率
- A/B：单变量实验（例如 Perfect 阈值或 minOffsetBetweenWindowsMs），观察留存与分数健康度

## 版本规划
- v0.1：单圆 + 完整反馈 + 难度台阶
- v0.2：并发双圆 + 错峰 + 清屏奖励
- v0.3：随机圆心 + 最小间距 + 受控重叠
- v0.4：日常挑战与皮肤；变现位接入
- v1.0：数据驱动调参与打磨

