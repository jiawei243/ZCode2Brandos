# ADR-0001: 专利领域能力全部经扩展点与插件承载，不改 Agent 内核

- 状态：已接受（2026-09-21）
- 关联：`MODIFIED-FILES.md`、`CONTEXT.md`（插件商店）、专利产品规划 §5.1

## 背景

要在 WBrand 上构建专利行业产品（撰写/检索/质量门/角色分工/领域包）。侵入度决策树要求先穷尽配置化、扩展点、包装层，才能改内核。

## 决策

专利套件（patent-suite）全部落在已有扩展点上，打成插件经插件商店分发：

| 能力                    | 扩展点（已核实存在）                                                                                     |
| ----------------------- | -------------------------------------------------------------------------------------------------------- |
| 撰写/解析/答复/导出技能 | `.wbrand/skills`（`packages/services/src/skills/skillsService.ts`，`.agents/skills` 兼容回退）           |
| 保密拦截/术语一致/归档  | workspace hooks 七个生命周期（`packages/shared/src/workspace-hook-config.ts`，含按工作区身份的信任模型） |
| 撰写规范                | 案件 workspace `AGENTS.md` + 领域包                                                                      |
| 角色分工                | subagents 服务域（`packages/services/src/subagents`）                                                    |
| 分发与更新              | 插件商店官方市场（builtin/CDN）或私有市场                                                                |

## 理由（决策树 1–3 可行）

1. **配置/内容可解决**：撰写规范、领域包、术语表均为文本资产。
2. **扩展点可解决**：生命周期拦截有 hooks；角色分工有 subagents；技能分发有插件商店。
3. **包装层可解决**：文档导出等重逻辑可做成 skill 内脚本或独立服务。
4. 因此**不需要改内核**——改 `apps/wbrand-cli/packages/core` 无正当理由。

## 后果

- 套件可独立于基座迭代、独立定价售卖；上游补丁可继续 cherry-pick。
- 领域包叠加（软件/机械/电路/化学医药）沿用 BrandOSv1 三层加载机制，触发源从 `CLIENT.md` 的 industry 字段改为案件元数据。
- 代价：hooks/skills 的能力边界受限于现有生命周期事件；若未来需要新钩子，属内核改动，须重新过决策树并登记。
