import { db } from "@workspace/db";
import {
  templatesTable,
  stationsTable,
  roomsTable,
  agentsTable,
  tasksTable,
  activityTable,
} from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "./logger";

async function seed() {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(agentsTable);

  if (count > 0) {
    logger.info("Database already seeded — skipping auto-seed");
    return;
  }

  logger.info("Empty database detected — running auto-seed...");

  await db.delete(activityTable);
  await db.delete(tasksTable);
  await db.delete(agentsTable);
  await db.delete(roomsTable);
  await db.delete(stationsTable);
  await db.delete(templatesTable);

  const tpls = await db
    .insert(templatesTable)
    .values([
      { name: "DeFi Alpha Hunter", slug: "defi-alpha-hunter", description: "Autonomous crypto research and trading strategy OS", category: "crypto", agentCount: 8, roomCount: 4, rating: 4.8, usageCount: 1247, isPublished: true },
      { name: "E-Commerce Empire", slug: "ecommerce-empire", description: "Full-stack e-commerce automation with growth agents", category: "ecommerce", agentCount: 6, roomCount: 3, rating: 4.6, usageCount: 892, isPublished: true },
      { name: "Content Machine", slug: "content-machine", description: "AI-powered content creation and distribution network", category: "content", agentCount: 5, roomCount: 3, rating: 4.7, usageCount: 2134, isPublished: true },
      { name: "SaaS Accelerator", slug: "saas-accelerator", description: "End-to-end SaaS product development and growth", category: "saas", agentCount: 10, roomCount: 5, rating: 4.9, usageCount: 678, isPublished: true },
      { name: "NFT Studio OS", slug: "nft-studio-os", description: "Complete NFT collection creation and launch system", category: "crypto", agentCount: 7, roomCount: 4, rating: 4.5, usageCount: 543, isPublished: true },
      { name: "Newsletter Empire", slug: "newsletter-empire", description: "Automated newsletter research, writing and growth", category: "content", agentCount: 4, roomCount: 2, rating: 4.4, usageCount: 1089, isPublished: true },
    ])
    .returning({ id: templatesTable.id });

  const [st1, st2, st3] = await db
    .insert(stationsTable)
    .values([
      { name: "ALPHA-7 DEFI OPS", templateId: tpls[0].id, templateName: "DeFi Alpha Hunter", status: "running", progress: 73.4, agentCount: 8, activeAgents: 6, roomCount: 4, tasksCompleted: 142, tasksTotal: 200 },
      { name: "CONTENT-3 NEXUS", templateId: tpls[2].id, templateName: "Content Machine", status: "running", progress: 58.1, agentCount: 5, activeAgents: 4, roomCount: 3, tasksCompleted: 89, tasksTotal: 150 },
      { name: "SAAS-1 LAUNCH PAD", templateId: tpls[3].id, templateName: "SaaS Accelerator", status: "running", progress: 34.7, agentCount: 10, activeAgents: 7, roomCount: 5, tasksCompleted: 67, tasksTotal: 300 },
    ])
    .returning({ id: stationsTable.id });

  const r1 = await db.insert(roomsTable).values([
    { stationId: st1.id, name: "Signal Lab", type: "research", status: "active", agentCount: 2, tasksCompleted: 34 },
    { stationId: st1.id, name: "Strategy Core", type: "operations", status: "busy", agentCount: 3, tasksCompleted: 58 },
    { stationId: st1.id, name: "Build Forge", type: "development", status: "active", agentCount: 2, tasksCompleted: 31 },
    { stationId: st1.id, name: "Data Vault", type: "analytics", status: "active", agentCount: 1, tasksCompleted: 19 },
  ]).returning({ id: roomsTable.id });

  const r2 = await db.insert(roomsTable).values([
    { stationId: st2.id, name: "Content Hub", type: "marketing", status: "active", agentCount: 2, tasksCompleted: 41 },
    { stationId: st2.id, name: "Design Studio", type: "design", status: "active", agentCount: 2, tasksCompleted: 28 },
    { stationId: st2.id, name: "Analytics Bay", type: "analytics", status: "busy", agentCount: 1, tasksCompleted: 20 },
  ]).returning({ id: roomsTable.id });

  const r3 = await db.insert(roomsTable).values([
    { stationId: st3.id, name: "Dev Core", type: "development", status: "busy", agentCount: 3, tasksCompleted: 28 },
    { stationId: st3.id, name: "Research Deck", type: "research", status: "active", agentCount: 2, tasksCompleted: 19 },
    { stationId: st3.id, name: "Growth Engine", type: "marketing", status: "active", agentCount: 2, tasksCompleted: 12 },
    { stationId: st3.id, name: "Design Lab", type: "design", status: "active", agentCount: 1, tasksCompleted: 6 },
    { stationId: st3.id, name: "Ops Bridge", type: "operations", status: "idle", agentCount: 2, tasksCompleted: 2 },
  ]).returning({ id: roomsTable.id });

  const a1 = await db.insert(agentsTable).values([
    { stationId: st1.id, roomId: r1[0].id, name: "VECTOR-9", role: "research", status: "working", level: 7, experience: 8420, tasksCompleted: 134, currentTask: "Scanning on-chain alpha signals for ETH/BTC pair" },
    { stationId: st1.id, roomId: r1[0].id, name: "SCOUT-4", role: "research", status: "working", level: 5, experience: 4821, tasksCompleted: 89, currentTask: "Analyzing whale wallet movements" },
    { stationId: st1.id, roomId: r1[1].id, name: "NEXUS-1", role: "strategy", status: "working", level: 9, experience: 12400, tasksCompleted: 201, currentTask: "Generating yield strategy for AAVE v3" },
    { stationId: st1.id, roomId: r1[1].id, name: "CIPHER-7", role: "strategy", status: "working", level: 8, experience: 9872, tasksCompleted: 176, currentTask: "Backtesting momentum strategy on GMX" },
    { stationId: st1.id, roomId: r1[2].id, name: "PRISM-2", role: "analytics", status: "working", level: 6, experience: 6234, tasksCompleted: 112, currentTask: "Computing Sharpe ratio for portfolio rebalance" },
    { stationId: st1.id, roomId: r1[2].id, name: "FORGE-3", role: "builder", status: "working", level: 7, experience: 7891, tasksCompleted: 143, currentTask: "Deploying smart contract to Arbitrum testnet" },
    { stationId: st1.id, roomId: r1[3].id, name: "PIXEL-8", role: "builder", status: "idle", level: 4, experience: 2341, tasksCompleted: 56, currentTask: null },
    { stationId: st1.id, roomId: r1[3].id, name: "SIGMA-5", role: "analytics", status: "working", level: 6, experience: 5678, tasksCompleted: 98, currentTask: "Monitoring liquidity pools for arbitrage ops" },
  ]).returning({ id: agentsTable.id });

  const a2 = await db.insert(agentsTable).values([
    { stationId: st2.id, roomId: r2[0].id, name: "ECHO-1", role: "content", status: "working", level: 5, experience: 4230, tasksCompleted: 78, currentTask: "Writing weekly DeFi market analysis thread" },
    { stationId: st2.id, roomId: r2[0].id, name: "LYRIC-3", role: "content", status: "working", level: 4, experience: 3120, tasksCompleted: 56, currentTask: "Drafting email newsletter for subscriber list" },
    { stationId: st2.id, roomId: r2[1].id, name: "NOVA-6", role: "content", status: "working", level: 6, experience: 5890, tasksCompleted: 94, currentTask: "Creating thumbnail batch for YouTube content" },
    { stationId: st2.id, roomId: r2[1].id, name: "FLUX-2", role: "content", status: "idle", level: 3, experience: 1876, tasksCompleted: 34, currentTask: null },
    { stationId: st2.id, roomId: r2[2].id, name: "LENS-9", role: "analytics", status: "working", level: 5, experience: 4512, tasksCompleted: 82, currentTask: "Tracking content performance metrics" },
  ]).returning({ id: agentsTable.id });

  const a3 = await db.insert(agentsTable).values([
    { stationId: st3.id, roomId: r3[0].id, name: "CORE-1", role: "builder", status: "working", level: 8, experience: 9234, tasksCompleted: 167, currentTask: "Building user authentication flow for SaaS MVP" },
    { stationId: st3.id, roomId: r3[0].id, name: "ARCH-5", role: "builder", status: "working", level: 7, experience: 8012, tasksCompleted: 145, currentTask: "Setting up CI/CD pipeline with GitHub Actions" },
    { stationId: st3.id, roomId: r3[0].id, name: "STACK-3", role: "builder", status: "working", level: 6, experience: 6234, tasksCompleted: 112, currentTask: "Implementing Stripe payment integration" },
    { stationId: st3.id, roomId: r3[1].id, name: "MEMO-2", role: "research", status: "working", level: 5, experience: 4567, tasksCompleted: 89, currentTask: "Competitive analysis: top 10 SaaS tools in niche" },
    { stationId: st3.id, roomId: r3[1].id, name: "SYNC-7", role: "research", status: "idle", level: 4, experience: 3012, tasksCompleted: 67, currentTask: null },
    { stationId: st3.id, roomId: r3[2].id, name: "GROW-4", role: "growth", status: "working", level: 6, experience: 5891, tasksCompleted: 103, currentTask: "Running A/B test on landing page headlines" },
    { stationId: st3.id, roomId: r3[2].id, name: "VIRAL-8", role: "growth", status: "working", level: 5, experience: 4231, tasksCompleted: 78, currentTask: "Crafting product hunt launch campaign" },
    { stationId: st3.id, roomId: r3[3].id, name: "STYLE-6", role: "content", status: "working", level: 5, experience: 4123, tasksCompleted: 74, currentTask: "Designing UI kit for SaaS dashboard" },
    { stationId: st3.id, roomId: r3[4].id, name: "OPS-9", role: "strategy", status: "idle", level: 4, experience: 2987, tasksCompleted: 54, currentTask: null },
    { stationId: st3.id, roomId: r3[4].id, name: "TACT-3", role: "strategy", status: "working", level: 6, experience: 5678, tasksCompleted: 102, currentTask: "Drafting go-to-market strategy for beta launch" },
  ]).returning({ id: agentsTable.id });

  const allAgentIds = [...a1, ...a2, ...a3].map((a) => a.id);

  await db.insert(tasksTable).values([
    { agentId: allAgentIds[0], title: "ETH Alpha Signal Scan", description: "Scan top 500 wallets for emerging alpha signals", status: "in_progress", progress: 67, priority: "high" },
    { agentId: allAgentIds[0], title: "Weekly Chain Analysis", description: "Full on-chain analytics report generation", status: "completed", progress: 100, priority: "medium", completedAt: sql`NOW() - INTERVAL '2 hours'` },
    { agentId: allAgentIds[0], title: "MEV Opportunity Map", description: "Identify MEV extraction opportunities on Uniswap v3", status: "pending", progress: 0, priority: "high" },
    { agentId: allAgentIds[1], title: "Whale Wallet Watch", description: "Track top 100 whale wallets for unusual activity", status: "in_progress", progress: 45, priority: "critical" },
    { agentId: allAgentIds[1], title: "Sentiment Analysis Run", description: "Cross-platform crypto sentiment scoring", status: "completed", progress: 100, priority: "medium", completedAt: sql`NOW() - INTERVAL '4 hours'` },
    { agentId: allAgentIds[2], title: "AAVE Yield Strategy", description: "Model optimal yield allocation across AAVE pools", status: "in_progress", progress: 82, priority: "critical" },
    { agentId: allAgentIds[2], title: "Risk Assessment Report", description: "Full portfolio risk assessment with VaR calculations", status: "completed", progress: 100, priority: "high", completedAt: sql`NOW() - INTERVAL '1 hour'` },
    { agentId: allAgentIds[3], title: "GMX Momentum Backtest", description: "Historical backtest of momentum strategy 2023-2024", status: "in_progress", progress: 91, priority: "high" },
    { agentId: allAgentIds[4], title: "Smart Contract Deploy", description: "Deploy vault contract to Arbitrum mainnet", status: "completed", progress: 100, priority: "critical", completedAt: sql`NOW() - INTERVAL '3 hours'` },
    { agentId: allAgentIds[5], title: "Liquidity Pool Monitor", description: "Real-time monitoring of 20 key liquidity pools", status: "in_progress", progress: 71, priority: "high" },
    { agentId: allAgentIds[0], title: "On-chain Flow Analysis", description: "Deep analysis of cross-chain capital flows", status: "completed", progress: 100, priority: "medium", completedAt: sql`NOW() - INTERVAL '30 minutes'` },
    { agentId: allAgentIds[1], title: "Whale Alert System", description: "Configure automated whale movement alerts", status: "completed", progress: 100, priority: "high", completedAt: sql`NOW() - INTERVAL '90 minutes'` },
  ]);

  const now = new Date();
  const ago = (mins: number) => new Date(now.getTime() - mins * 60000);

  await db.insert(activityTable).values([
    { agentName: "NEXUS-1", agentRole: "strategy", stationName: "ALPHA-7 DEFI OPS", action: "Completed yield strategy modeling", details: "AAVE v3 optimal allocation identified: 40% ETH, 35% USDC, 25% wBTC", timestamp: ago(2) },
    { agentName: "VECTOR-9", agentRole: "research", stationName: "ALPHA-7 DEFI OPS", action: "Alpha signal detected", details: "Large wallet accumulating PENDLE — 847K tokens in last 2h", timestamp: ago(8) },
    { agentName: "CORE-1", agentRole: "builder", stationName: "SAAS-1 LAUNCH PAD", action: "Auth flow deployed to staging", details: "JWT + OAuth2 with Google/GitHub login functional on staging", timestamp: ago(15) },
    { agentName: "ECHO-1", agentRole: "content", stationName: "CONTENT-3 NEXUS", action: "Published DeFi analysis thread", details: "22-tweet thread on Eigenlayer restaking mechanics — 4.2K impressions", timestamp: ago(23) },
    { agentName: "CIPHER-7", agentRole: "strategy", stationName: "ALPHA-7 DEFI OPS", action: "Backtest completed", details: "GMX momentum strategy: 67% win rate, 2.4 Sharpe over 18 months", timestamp: ago(34) },
    { agentName: "GROW-4", agentRole: "growth", stationName: "SAAS-1 LAUNCH PAD", action: "A/B test results in", details: "Variant B headline +34% conversion rate — updating landing page", timestamp: ago(41) },
    { agentName: "NOVA-6", agentRole: "content", stationName: "CONTENT-3 NEXUS", action: "Thumbnail batch complete", details: "12 YouTube thumbnails rendered for Q2 content calendar", timestamp: ago(58) },
    { agentName: "STACK-3", agentRole: "builder", stationName: "SAAS-1 LAUNCH PAD", action: "Stripe integration live", details: "Subscription billing with Stripe Checkout fully functional", timestamp: ago(67) },
    { agentName: "SCOUT-4", agentRole: "research", stationName: "ALPHA-7 DEFI OPS", action: "Whale alert triggered", details: "Wallet 0x7f2a moving 12M USDC to Hyperliquid perp exchange", timestamp: ago(74) },
    { agentName: "LYRIC-3", agentRole: "content", stationName: "CONTENT-3 NEXUS", action: "Newsletter draft complete", details: "2,400 word weekly roundup ready for review — 89% open rate predicted", timestamp: ago(89) },
    { agentName: "PRISM-2", agentRole: "analytics", stationName: "ALPHA-7 DEFI OPS", action: "Portfolio rebalance computed", details: "Sharpe-optimized rebalance: reduce ETH 8%, increase ARB 12%", timestamp: ago(103) },
    { agentName: "ARCH-5", agentRole: "builder", stationName: "SAAS-1 LAUNCH PAD", action: "CI/CD pipeline configured", details: "GitHub Actions → Docker → Fly.io deploy pipeline live", timestamp: ago(118) },
    { agentName: "FORGE-3", agentRole: "builder", stationName: "ALPHA-7 DEFI OPS", action: "Contract deployed to testnet", details: "Vault contract verified on Arbiscan — ready for audit", timestamp: ago(132) },
    { agentName: "TACT-3", agentRole: "strategy", stationName: "SAAS-1 LAUNCH PAD", action: "GTM strategy drafted", details: "Phase 1: Product Hunt + HN launch + 5 newsletter placements", timestamp: ago(145) },
    { agentName: "MEMO-2", agentRole: "research", stationName: "SAAS-1 LAUNCH PAD", action: "Competitive analysis done", details: "Identified 3 underserved niches vs Notion/Linear — full report attached", timestamp: ago(156) },
    { agentName: "SIGMA-5", agentRole: "analytics", stationName: "ALPHA-7 DEFI OPS", action: "Arbitrage opportunity found", details: "WBTC/ETH spread on Curve vs Uniswap: +0.23% — executing", timestamp: ago(178) },
    { agentName: "VIRAL-8", agentRole: "growth", stationName: "SAAS-1 LAUNCH PAD", action: "PH campaign assets ready", details: "Launch kit: 6 screenshots, 3 GIFs, maker story, 50 hunter contacts list", timestamp: ago(192) },
    { agentName: "FLUX-2", agentRole: "content", stationName: "CONTENT-3 NEXUS", action: "Brand kit updated", details: "New color palette and typography system applied to all templates", timestamp: ago(214) },
    { agentName: "MEMO-2", agentRole: "research", stationName: "SAAS-1 LAUNCH PAD", action: "User interview analysis", details: "Synthesized 14 interviews — top pain: onboarding complexity", timestamp: ago(231) },
    { agentName: "VECTOR-9", agentRole: "research", stationName: "ALPHA-7 DEFI OPS", action: "Signal scan cycle complete", details: "Processed 2.3M on-chain events — 7 alpha signals flagged for review", timestamp: ago(248) },
    { agentName: "ECHO-1", agentRole: "content", stationName: "CONTENT-3 NEXUS", action: "SEO audit completed", details: "Identified 23 high-opportunity keywords with <50 KD and >1K volume", timestamp: ago(267) },
    { agentName: "NEXUS-1", agentRole: "strategy", stationName: "ALPHA-7 DEFI OPS", action: "Position sizing updated", details: "Kelly criterion applied — max position 4.2% of portfolio per signal", timestamp: ago(289) },
    { agentName: "CORE-1", agentRole: "builder", stationName: "SAAS-1 LAUNCH PAD", action: "API endpoints live", details: "47 REST endpoints documented with OpenAPI spec — all passing tests", timestamp: ago(312) },
    { agentName: "LENS-9", agentRole: "analytics", stationName: "CONTENT-3 NEXUS", action: "Content performance report", details: "Q1 2025: 1.2M impressions, 4.7% CTR, $0.034 CPC across channels", timestamp: ago(334) },
  ]);

  logger.info("Auto-seed complete — 6 templates, 3 stations, 23 agents, 24 activity entries");
}

export async function runAutoSeedIfEmpty() {
  try {
    await seed();
  } catch (err) {
    logger.error({ err }, "Auto-seed failed — continuing without seed data");
  }
}
