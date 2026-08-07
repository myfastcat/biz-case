# context7.com
Tag: RAG, MCP, Documentation

## What
AI 代码助手的“实时官方文档外挂”把最新的，精准的文档放到context

## Why
### Issue
- 不高效 While web search tool can retrieve documentation, it is not always efficient: results can be outdated, unsafe, or bloated with irrelevant page content — adding unnecessary tokens to the agent's context and increasing cost.
### Value
- 数据源头层（“新”与“私有”）—— 决定了AI能吃透“什么内容”
	- 新 Zero Hallucinations. Context7 supplies fresh, version-accurate docs at query time, so agents generate code from correct sources — not stale or deprecated APIs that web search might surface.
	- 私有 Governed Context. Add private repos, wikis, and PDFs as sources. Control what the agent sees, monitor usage, and enforce standards.
- 安全防御层（“避免注入”）—— 确保数据流转的“安全性”
	- 避免注入 Safe by Default. Web search exposes agents to the open internet, where malicious or prompt-injected content can influence code generation. Context7's injection detection and trust scoring keep unsafe content out.
- 性能优化层（“精”）—— 决定了数据交付的“性价比”
	- 精 Fewer Tokens, Faster Responses. Context7 returns focused documentation slices instead of large page-level artifacts, cutting token waste, cost, and latency.
	- Context7 vs. web search — 34% cheaper, 37% fewer tokens
-	终极价值层（“效率”）—— 这一切的终极目标
	- 效率 Developer Productivity. The agent fetches the right docs automatically — fewer Slack threads, wikis, and browser tabs, more shipping.

## How
### Design
#### Stack
- 托管型 RAG + MCP 标准接口
#### Pipeline
- 抓取与提取（Ingestion）
	- Context7 会定期监控并抓取目标项目（比如 Vercel 的 Next.js 仓库）的最源头资料：
	- GitHub 源代码与 Markdown 文档。
	- 官方文档网站的最新页面。
	- 项目中的 llms.txt 或 llms-full.txt（这是现代开源项目专门为 AI 准备的精炼文档文件）。
- 切片与结构化（Chunking & Structuring）
	- 去除冗余： 删掉网页的页脚、导航栏、广告、CSS 样式等无关信息。
	- 拆分 Snippet（代码片段）： 比如在 vercel/next.js 中，Context7 将复杂的全量文档拆分成了 5,900+ 个独立的 Snippets（代码片段）。
	- 版本打标： 区分不同版本（如 Next.js 14 vs Next.js 15），确保按版本号隔离，解决“旧 API 干扰新版本”的问题。
- 语义向量化与索引（Indexing）
	- 每一个拆分出来的代码片段和说明，都会被生成对应的语义索引（Embeddings）。
- 实时按需供给 AI（RAG 检索）
	- 你提问： “帮我在 Next.js 15 里写一个 Middleware 鉴权”
	- AI 发送请求： AI 的 MCP 客户端向 Context7 发送请求，寻找标识为 /vercel/next.js@15 且关于 Middleware 的片段。
	- 精准投喂： Context7 仅挑选出与当前提问最相关的 2~3 个 Snippet（比如几百个 Token），注入到 AI 的大脑（Prompt 上下文）中。
	- 生成正确代码： AI 依据最新的官方示例，写出完全符合最新 API 的代码。

#### Two modes
- Skills + CLI— installs a skill that guides your agent to fetch docs using ctx7 CLI commands (no MCP required)
	- CLI commands
	- ctx7 library <name> <query>: Searches the Context7 index by library name and returns matching libraries with their IDs.
	- ctx7 docs <libraryId> <query>: Retrieves documentation for a library using a Context7-compatible library ID (e.g., /mongodb/docs, /vercel/next.js).
- MCP — registers a Context7 MCP server so your agent can call documentation tools natively
	- MCP Tools
	- resolve-library-id: Resolves a general library name into a Context7-compatible library ID.
	- query-docs: Retrieves documentation for a library using a Context7-compatible library ID.
	

### User exp
- Try Live
- Docs
	- Installation
		- npx ctx7 setup
			- API_KEY
	- Use
		- How do I set up Next.js 14 middleware? use context7
- Pricing
	- 席位费 (Per Seat / Subscription)
		- $10 / 席位 / 月
	- API 调用超额费 (API Call Overages)
		- 超出免费套餐额度按 $10 / 1,000 次 API 调用 收费
	- 私有知识资产解析费 (Private Repo Parsing)
		- 非公开文档导入 Context7 并通过其五阶段流水线（解析、LLM 增强、向量化、重排等）进行深度处理时，会消耗计算资源
		- $25 / 100 万 (1M) Tokens。（注：后续日常查阅缓存是免费的，仅在首次添加或刷新时收费
- Blog
