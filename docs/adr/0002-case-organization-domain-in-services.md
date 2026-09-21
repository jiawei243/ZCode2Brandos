# ADR-0002: 案件与组织域落在 packages/services 新域，案件绑定 workspace

- 状态：已接受（2026-09-21）
- 关联：`ARCHITECTURE.md` §7、专利产品规划 §5.2

## 背景

专利产品的核心导航实体是案件（case），需要机构 → 团队 → 案件层级与多账号协作。WBrand 已有 `packages/server`（Hono HTTP+WS、AuthToken）、远程 workspace 与 `workspaceIdentity` 身份体系，服务化不必从零开始。

## 决策

- 在 `packages/services` 新增 case 域与 organization 域，参照 storage 受治理模块的 domain/app/adapters 三层组织代码。
- **案件绑定 workspace**：`workspaceIdentity = caseId`，`workspacePath` = 案件资料目录。身份 key 规则（`workspaceIdentity?.trim() || workspacePath`）不变，远程链路继续贯穿 `workspaceIdentity` + `remoteSessionId`。
- 需要到达 UI 的新状态走 `packages/shared/src/wbrand-protocol` 新增 rows，严格类型 + 运行时校验；org/user 鉴权在 `packages/server` 的 AuthToken 之上加组织/账号/会话层，凭据管理复用 `services/credential`、`oauth`。

## 理由（决策树 1–3 不可行的部分）

- 配置化/扩展点无法解决：多租户导航、组织账号、案件状态是业务状态，必须有其所有者。
- 选择"services 新域"而非改内核：`ARCHITECTURE.md` 已确立 Main 不承载业务状态、session 域以 `contract.ts` 为唯一入口的治理模式，新域沿此模式即可，不触碰 `apps/wbrand-cli/packages/core`。

## 放弃的备选

- **把案件塞进现有 session 域**：混域，破坏 conversation 唯一所有权。
- **改 desktop Main 增加案件概念**：违反"Main 只做窗口/原生/转发"的既定边界。

## 后果

- 协议新增 rows 是唯一被允许的协议触点，需同步运行时校验与两套链路语义（desktop-continuous / web-remote-replayable）的验证。
- P0 阶段可不实现该域（用案件目录约定过渡），P1 落地。
