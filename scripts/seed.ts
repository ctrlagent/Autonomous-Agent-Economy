import pg from "pg";

const { Client } = pg;

async function seed() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  await client.query(`DELETE FROM activity`);
  await client.query(`DELETE FROM tasks`);
  await client.query(`DELETE FROM agents`);
  await client.query(`DELETE FROM rooms`);
  await client.query(`DELETE FROM stations`);
  await client.query(`DELETE FROM templates`);

  const templates = await client.query(`
    INSERT INTO templates (name, slug, description, category, agent_count, room_count, rating, usage_count, is_published)
    VALUES
      ('DeFi Alpha Hunter', 'defi-alpha-hunter', 'Autonomous crypto research and trading strategy OS', 'crypto', 8, 4, 4.8, 1247),
      ('E-Commerce Empire', 'ecommerce-empire', 'Full-stack e-commerce automation with growth agents', 'ecommerce', 6, 3, 4.6, 892),
      ('Content Machine', 'content-machine', 'AI-powered content creation and distribution network', 'content', 5, 3, 4.7, 2134),
      ('SaaS Accelerator', 'saas-accelerator', 'End-to-end SaaS product development and growth', 'saas', 10, 5, 4.9, 678),
      ('NFT Studio OS', 'nft-studio-os', 'Complete NFT collection creation and launch system', 'crypto', 7, 4, 4.5, 543),
      ('Newsletter Empire', 'newsletter-empire', 'Automated newsletter research, writing and growth', 'content', 4, 2, 4.4, 1089)
    RETURNING id
  `);

  const tplIds = templates.rows.map((r: any) => r.id);

  const st1 = await client.query(`
    INSERT INTO stations (name, template_id, template_name, status, progress, agent_count, active_agents, room_count, tasks_completed, tasks_total)
    VALUES ('ALPHA-7 DEFI OPS', $1, 'DeFi Alpha Hunter', 'running', 73.4, 8, 6, 4, 142, 200)
    RETURNING id
  `, [tplIds[0]]);

  const st2 = await client.query(`
    INSERT INTO stations (name, template_id, template_name, status, progress, agent_count, active_agents, room_count, tasks_completed, tasks_total)
    VALUES ('CONTENT-3 NEXUS', $1, 'Content Machine', 'running', 58.1, 5, 4, 3, 89, 150)
    RETURNING id
  `, [tplIds[2]]);

  const st3 = await client.query(`
    INSERT INTO stations (name, template_id, template_name, status, progress, agent_count, active_agents, room_count, tasks_completed, tasks_total)
    VALUES ('SAAS-1 LAUNCH PAD', $1, 'SaaS Accelerator', 'running', 34.7, 10, 7, 5, 67, 300)
    RETURNING id
  `, [tplIds[3]]);

  const stationId1 = st1.rows[0].id;
  const stationId2 = st2.rows[0].id;
  const stationId3 = st3.rows[0].id;

  const rooms1 = await client.query(`
    INSERT INTO rooms (station_id, name, type, status, agent_count, tasks_completed)
    VALUES
      ($1, 'Signal Lab', 'research', 'active', 2, 34),
      ($1, 'Strategy Core', 'operations', 'busy', 3, 58),
      ($1, 'Build Forge', 'development', 'active', 2, 31),
      ($1, 'Data Vault', 'analytics', 'active', 1, 19)
    RETURNING id
  `, [stationId1]);

  const rooms2 = await client.query(`
    INSERT INTO rooms (station_id, name, type, status, agent_count, tasks_completed)
    VALUES
      ($1, 'Content Hub', 'marketing', 'active', 2, 41),
      ($1, 'Design Studio', 'design', 'active', 2, 28),
      ($1, 'Analytics Bay', 'analytics', 'busy', 1, 20)
    RETURNING id
  `, [stationId2]);

  const rooms3 = await client.query(`
    INSERT INTO rooms (station_id, name, type, status, agent_count, tasks_completed)
    VALUES
      ($1, 'Dev Core', 'development', 'busy', 3, 28),
      ($1, 'Research Deck', 'research', 'active', 2, 19),
      ($1, 'Growth Engine', 'marketing', 'active', 2, 12),
      ($1, 'Design Lab', 'design', 'active', 1, 6),
      ($1, 'Ops Bridge', 'operations', 'idle', 2, 2)
    RETURNING id
  `, [stationId3]);

  const roomIds1 = rooms1.rows.map((r: any) => r.id);
  const roomIds2 = rooms2.rows.map((r: any) => r.id);
  const roomIds3 = rooms3.rows.map((r: any) => r.id);

  const agents1 = await client.query(`
    INSERT INTO agents (station_id, room_id, name, role, status, level, experience, tasks_completed, current_task)
    VALUES
      ($1, $2, 'VECTOR-9', 'research', 'working', 7, 8420, 134, 'Scanning on-chain alpha signals for ETH/BTC pair'),
      ($1, $2, 'SCOUT-4', 'research', 'working', 5, 4821, 89, 'Analyzing whale wallet movements'),
      ($1, $3, 'NEXUS-1', 'strategy', 'working', 9, 12400, 201, 'Generating yield strategy for AAVE v3'),
      ($1, $3, 'CIPHER-7', 'strategy', 'working', 8, 9872, 176, 'Backtesting momentum strategy on GMX'),
      ($1, $4, 'PRISM-2', 'analytics', 'working', 6, 6234, 112, 'Computing Sharpe ratio for portfolio rebalance'),
      ($1, $4, 'FORGE-3', 'builder', 'working', 7, 7891, 143, 'Deploying smart contract to Arbitrum testnet'),
      ($1, $5, 'PIXEL-8', 'builder', 'idle', 4, 2341, 56, NULL),
      ($1, $5, 'SIGMA-5', 'analytics', 'working', 6, 5678, 98, 'Monitoring liquidity pools for arbitrage ops')
    RETURNING id
  `, [stationId1, roomIds1[0], roomIds1[1], roomIds1[2], roomIds1[3]]);

  const agents2 = await client.query(`
    INSERT INTO agents (station_id, room_id, name, role, status, level, experience, tasks_completed, current_task)
    VALUES
      ($1, $2, 'ECHO-1', 'content', 'working', 5, 4230, 78, 'Writing weekly DeFi market analysis thread'),
      ($1, $2, 'LYRIC-3', 'content', 'working', 4, 3120, 56, 'Drafting email newsletter for subscriber list'),
      ($1, $3, 'NOVA-6', 'design', 'working', 6, 5890, 94, 'Creating thumbnail batch for YouTube content'),
      ($1, $3, 'FLUX-2', 'design', 'idle', 3, 1876, 34, NULL),
      ($1, $4, 'LENS-9', 'analytics', 'working', 5, 4512, 82, 'Tracking content performance metrics')
    RETURNING id
  `, [stationId2, roomIds2[0], roomIds2[1], roomIds2[2]]);

  const agents3 = await client.query(`
    INSERT INTO agents (station_id, room_id, name, role, status, level, experience, tasks_completed, current_task)
    VALUES
      ($1, $2, 'CORE-1', 'builder', 'working', 8, 9234, 167, 'Building user authentication flow for SaaS MVP'),
      ($1, $2, 'ARCH-5', 'builder', 'working', 7, 8012, 145, 'Setting up CI/CD pipeline with GitHub Actions'),
      ($1, $2, 'STACK-3', 'builder', 'working', 6, 6234, 112, 'Implementing Stripe payment integration'),
      ($1, $3, 'MEMO-2', 'research', 'working', 5, 4567, 89, 'Competitive analysis: top 10 SaaS tools in niche'),
      ($1, $3, 'SYNC-7', 'research', 'idle', 4, 3012, 67, NULL),
      ($1, $4, 'GROW-4', 'growth', 'working', 6, 5891, 103, 'Running A/B test on landing page headlines'),
      ($1, $4, 'VIRAL-8', 'growth', 'working', 5, 4231, 78, 'Crafting product hunt launch campaign'),
      ($1, $5, 'STYLE-6', 'design', 'working', 5, 4123, 74, 'Designing UI kit for SaaS dashboard'),
      ($1, $6, 'OPS-9', 'strategy', 'idle', 4, 2987, 54, NULL),
      ($1, $6, 'TACT-3', 'strategy', 'working', 6, 5678, 102, 'Drafting go-to-market strategy for beta launch')
    RETURNING id
  `, [stationId3, roomIds3[0], roomIds3[1], roomIds3[2], roomIds3[3], roomIds3[4]]);

  const allAgentIds = [
    ...agents1.rows.map((r: any) => r.id),
    ...agents2.rows.map((r: any) => r.id),
    ...agents3.rows.map((r: any) => r.id),
  ];

  await client.query(`
    INSERT INTO tasks (agent_id, title, description, status, progress, priority)
    VALUES
      ($1, 'ETH Alpha Signal Scan', 'Scan top 500 wallets for emerging alpha signals', 'in_progress', 67, 'high'),
      ($1, 'Weekly Chain Analysis', 'Full on-chain analytics report generation', 'completed', 100, 'medium'),
      ($1, 'MEV Opportunity Map', 'Identify MEV extraction opportunities on Uniswap v3', 'pending', 0, 'high'),
      ($2, 'Whale Wallet Watch', 'Track top 100 whale wallets for unusual activity', 'in_progress', 45, 'critical'),
      ($2, 'Sentiment Analysis Run', 'Cross-platform crypto sentiment scoring', 'completed', 100, 'medium'),
      ($3, 'AAVE Yield Strategy', 'Model optimal yield allocation across AAVE pools', 'in_progress', 82, 'critical'),
      ($3, 'Risk Assessment Report', 'Full portfolio risk assessment with VaR calculations', 'in_progress', 55, 'high'),
      ($4, 'GMX Momentum Backtest', 'Historical backtest of momentum strategy 2023-2024', 'in_progress', 91, 'high'),
      ($5, 'Smart Contract Deploy', 'Deploy vault contract to Arbitrum mainnet', 'in_progress', 38, 'critical'),
      ($6, 'Liquidity Pool Monitor', 'Real-time monitoring of 20 key liquidity pools', 'in_progress', 71, 'high')
  `, [allAgentIds[0], allAgentIds[1], allAgentIds[2], allAgentIds[3], allAgentIds[4]]);

  const now = new Date();
  const ago = (mins: number) => new Date(now.getTime() - mins * 60000).toISOString();

  await client.query(`
    INSERT INTO activity (agent_name, agent_role, station_name, action, details, timestamp)
    VALUES
      ('NEXUS-1', 'strategy', 'ALPHA-7 DEFI OPS', 'Completed yield strategy modeling', 'AAVE v3 optimal allocation identified: 40% ETH, 35% USDC, 25% wBTC', $1),
      ('VECTOR-9', 'research', 'ALPHA-7 DEFI OPS', 'Alpha signal detected', 'Large wallet accumulating PENDLE — 847K tokens in last 2h', $2),
      ('CORE-1', 'builder', 'SAAS-1 LAUNCH PAD', 'Auth flow deployed to staging', 'JWT + OAuth2 with Google/GitHub login functional on staging', $3),
      ('ECHO-1', 'content', 'CONTENT-3 NEXUS', 'Published DeFi analysis thread', '22-tweet thread on Eigenlayer restaking mechanics — 4.2K impressions', $4),
      ('CIPHER-7', 'strategy', 'ALPHA-7 DEFI OPS', 'Backtest completed', 'GMX momentum strategy: 67% win rate, 2.4 Sharpe over 18 months', $5),
      ('GROW-4', 'growth', 'SAAS-1 LAUNCH PAD', 'A/B test results in', 'Variant B headline +34% conversion rate — updating landing page', $6),
      ('NOVA-6', 'design', 'CONTENT-3 NEXUS', 'Thumbnail batch complete', '12 YouTube thumbnails rendered for Q2 content calendar', $7),
      ('STACK-3', 'builder', 'SAAS-1 LAUNCH PAD', 'Stripe integration live', 'Subscription billing with Stripe Checkout fully functional', $8),
      ('SCOUT-4', 'research', 'ALPHA-7 DEFI OPS', 'Whale alert triggered', 'Wallet 0x7f2a moving 12M USDC to Hyperliquid perp exchange', $9),
      ('LYRIC-3', 'content', 'CONTENT-3 NEXUS', 'Newsletter draft complete', '2,400 word weekly roundup ready for review — 89% open rate predicted', $10),
      ('PRISM-2', 'analytics', 'ALPHA-7 DEFI OPS', 'Portfolio rebalance computed', 'Sharpe-optimized rebalance: reduce ETH 8%, increase ARB 12%', $11),
      ('ARCH-5', 'builder', 'SAAS-1 LAUNCH PAD', 'CI/CD pipeline configured', 'GitHub Actions → Docker → Fly.io deploy pipeline live', $12),
      ('FORGE-3', 'builder', 'ALPHA-7 DEFI OPS', 'Contract deployed to testnet', 'Vault contract verified on Arbiscan — ready for audit', $13),
      ('TACT-3', 'strategy', 'SAAS-1 LAUNCH PAD', 'GTM strategy drafted', 'Phase 1: Product Hunt + HN launch + 5 newsletter placements', $14),
      ('MEMO-2', 'research', 'SAAS-1 LAUNCH PAD', 'Competitive analysis done', 'Identified 3 underserved niches vs Notion/Linear — full report attached', $15),
      ('SIGMA-5', 'analytics', 'ALPHA-7 DEFI OPS', 'Arbitrage opportunity found', 'WBTC/ETH spread on Curve vs Uniswap: +0.23% — executing', $16),
      ('VIRAL-8', 'growth', 'SAAS-1 LAUNCH PAD', 'PH campaign assets ready', 'Launch kit: 6 screenshots, 3 GIFs, maker story, 50 hunter contacts list', $17),
      ('FLUX-2', 'design', 'CONTENT-3 NEXUS', 'Brand kit updated', 'New color palette and typography system applied to all templates', $18),
      ('MEMO-2', 'research', 'SAAS-1 LAUNCH PAD', 'User interview analysis', 'Synthesized 14 interviews — top pain: onboarding complexity', $19),
      ('VECTOR-9', 'research', 'ALPHA-7 DEFI OPS', 'Signal scan cycle complete', 'Processed 2.3M on-chain events — 7 alpha signals flagged for review', $20),
      ('ECHO-1', 'content', 'CONTENT-3 NEXUS', 'SEO audit completed', 'Identified 23 high-opportunity keywords with <50 KD and >1K volume', $21),
      ('NEXUS-1', 'strategy', 'ALPHA-7 DEFI OPS', 'Position sizing updated', 'Kelly criterion applied — max position 4.2% of portfolio per signal', $22),
      ('CORE-1', 'builder', 'SAAS-1 LAUNCH PAD', 'API endpoints live', '47 REST endpoints documented with OpenAPI spec — all passing tests', $23),
      ('LENS-9', 'analytics', 'CONTENT-3 NEXUS', 'Content performance report', 'Q1 2025: 1.2M impressions, 4.7% CTR, $0.034 CPC across channels', $24)
  `, [
    ago(2), ago(8), ago(15), ago(23), ago(34), ago(41), ago(58), ago(67), ago(74), ago(89),
    ago(103), ago(118), ago(132), ago(145), ago(156), ago(178), ago(192), ago(214), ago(231), ago(248),
    ago(267), ago(289), ago(312), ago(334),
  ]);

  console.log("Database seeded successfully!");
  await client.end();
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
