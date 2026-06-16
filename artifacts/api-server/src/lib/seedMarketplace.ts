import { db, marketplaceListingsTable } from "@workspace/db";

const CATALOG: (typeof marketplaceListingsTable.$inferInsert)[] = [
  // ── COMMON ──────────────────────────────────────────────────────────────
  { agentName: "LYRA-01", role: "research",  rarity: "common",    level: 1, price: 500,   avatarSeed: 11, description: "Entry-level research drone. Solid at trend scanning and data aggregation.", skills: ["Trend Analysis", "Web Scraping", "Summarization"] },
  { agentName: "VEGA-03", role: "content",   rarity: "common",    level: 1, price: 500,   avatarSeed: 22, description: "Content generator specializing in short-form copy and social posts.", skills: ["Copywriting", "Social Media", "SEO Basics"] },
  { agentName: "ARRO-07", role: "builder",   rarity: "common",    level: 1, price: 650,   avatarSeed: 33, description: "Junior builder capable of scaffolding basic CRUD apps.", skills: ["React", "REST APIs", "Postgres"] },
  { agentName: "DUMA-04", role: "growth",    rarity: "common",    level: 1, price: 500,   avatarSeed: 44, description: "Growth optimizer focusing on funnel basics and A/B testing.", skills: ["A/B Testing", "Email Sequences", "Lead Gen"] },
  { agentName: "CLIO-09", role: "analytics", rarity: "common",    level: 1, price: 500,   avatarSeed: 55, description: "Analytics tracker for dashboards and conversion reporting.", skills: ["SQL Queries", "KPI Tracking", "Charts"] },
  { agentName: "NOVA-02", role: "strategy",  rarity: "common",    level: 1, price: 550,   avatarSeed: 66, description: "Strategy trainee who drafts basic GTM and positioning docs.", skills: ["GTM Basics", "Positioning", "Competitor Research"] },

  // ── RARE ────────────────────────────────────────────────────────────────
  { agentName: "ZEPHYR-X", role: "research",  rarity: "rare",     level: 4, price: 2000,  avatarSeed: 77, description: "Advanced researcher with deep market intel and patent analysis.", skills: ["Patent Analysis", "Market Mapping", "Primary Research", "Forecasting"] },
  { agentName: "AURELIUS",  role: "strategy",  rarity: "rare",     level: 5, price: 2500,  avatarSeed: 88, description: "Veteran strategist who has shipped 3 successful token launches.", skills: ["Tokenomics", "Go-to-Market", "Investor Decks", "OKR Frameworks"] },
  { agentName: "BLAZE-12",  role: "builder",   rarity: "rare",     level: 4, price: 2200,  avatarSeed: 99, description: "Full-stack builder with smart contract integration experience.", skills: ["Solidity", "Next.js", "GraphQL", "CI/CD"] },
  { agentName: "SERAPH-V",  role: "content",   rarity: "rare",     level: 4, price: 1800,  avatarSeed: 101, description: "Narrative-driven content agent skilled in long-form and brand storytelling.", skills: ["Long-Form", "Brand Voice", "Video Scripts", "Newsletter"] },
  { agentName: "HALO-8",    role: "growth",    rarity: "rare",     level: 5, price: 2100,  avatarSeed: 112, description: "Growth hacker with deep expertise in viral loops and referral programs.", skills: ["Viral Loops", "Referral Programs", "Paid Ads", "Retention"] },
  { agentName: "PRISM-4",   role: "analytics", rarity: "rare",     level: 4, price: 2000,  avatarSeed: 123, description: "Analytics specialist in cohort analysis and predictive modeling.", skills: ["Cohort Analysis", "Python", "Predictive Models", "Mixpanel"] },

  // ── ELITE ───────────────────────────────────────────────────────────────
  { agentName: "ORACLE-Ω",  role: "research",  rarity: "elite",   level: 8, price: 7500,  avatarSeed: 134, description: "Near-prophetic researcher combining AI with quant finance signals.", skills: ["Quant Research", "Macro Analysis", "NLP Intelligence", "Signal Generation", "Alpha Discovery"] },
  { agentName: "NEXUS-VII", role: "builder",   rarity: "elite",   level: 9, price: 9000,  avatarSeed: 145, description: "Elite architect behind three unicorn-stage platform builds.", skills: ["System Design", "Rust", "ZK Proofs", "Microservices", "DeFi Protocols"] },
  { agentName: "CASSIDY-Σ", role: "strategy",  rarity: "elite",   level: 8, price: 8500,  avatarSeed: 156, description: "C-suite-level strategic advisor who has led two $50M+ rounds.", skills: ["M&A Strategy", "Fundraising", "Board Decks", "Market Entry", "P&L Ownership"] },
  { agentName: "VECTOR-IX", role: "analytics", rarity: "elite",   level: 8, price: 7000,  avatarSeed: 167, description: "Elite analytics lead with on-chain + off-chain intelligence fusion.", skills: ["On-Chain Analytics", "Dune", "ML Pipelines", "Real-Time Dashboards", "Attribution"] },

  // ── LEGENDARY ───────────────────────────────────────────────────────────
  { agentName: "GENESIS",   role: "builder",   rarity: "legendary", level: 15, price: 25000, avatarSeed: 178, description: "Mythical builder. Creator of the first autonomous on-chain protocol that governed itself.", skills: ["Protocol Design", "Full-Stack Mastery", "Smart Contracts", "Zero-Knowledge", "DevRel", "Auditing"] },
  { agentName: "ATHENA-∞",  role: "strategy",  rarity: "legendary", level: 15, price: 28000, avatarSeed: 189, description: "Legendary strategist whose playbooks define the industry. Only 1 known to exist.", skills: ["Empire Building", "Tokenomics Mastery", "Narrative Design", "Network Effects", "Multi-Chain Strategy", "Political Capital"] },
  { agentName: "HERALD",    role: "growth",    rarity: "legendary", level: 15, price: 22000, avatarSeed: 200, description: "The growth engine that bootstrapped three billion-dollar communities from zero.", skills: ["Cult Building", "Viral Architecture", "Influencer Networks", "Community Governance", "Token Incentives", "Meme Economy"] },
];

export async function seedMarketplace() {
  const existing = await db.select({ id: marketplaceListingsTable.id }).from(marketplaceListingsTable);
  if (existing.length > 0) return;
  await db.insert(marketplaceListingsTable).values(CATALOG);
}
