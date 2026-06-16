// ─── Agent Skills & XP System ─────────────────────────────────────────────────
// Skills unlock at fixed level milestones. Ranks are titles given at thresholds.

export interface Skill {
  name: string;
  unlockLevel: number;
  description: string;
  icon: string;
}

export interface RankTier {
  minLevel: number;
  rank: string;
  color: string;
}

// ─── Level → Rank mapping ────────────────────────────────────────────────────
export const RANK_TIERS: RankTier[] = [
  { minLevel: 20, rank: "LEGEND",     color: "#ffb84d" },
  { minLevel: 15, rank: "ELITE",      color: "#c084fc" },
  { minLevel: 12, rank: "MASTER",     color: "#9b6dff" },
  { minLevel:  8, rank: "EXPERT",     color: "#4df0d8" },
  { minLevel:  5, rank: "SPECIALIST", color: "#4d7fff" },
  { minLevel:  3, rank: "OPERATIVE",  color: "#4dff9b" },
  { minLevel:  1, rank: "RECRUIT",    color: "#8899aa" },
];

export function getRank(level: number): RankTier {
  for (const tier of RANK_TIERS) {
    if (level >= tier.minLevel) return tier;
  }
  return RANK_TIERS[RANK_TIERS.length - 1];
}

export function getNextRank(level: number): RankTier | null {
  const idx = RANK_TIERS.findIndex(t => level >= t.minLevel);
  if (idx <= 0) return null;
  return RANK_TIERS[idx - 1];
}

// ─── XP helpers ──────────────────────────────────────────────────────────────
export const XP_PER_LEVEL = 100;
export const XP_PER_TASK  = 30;

/** How much XP remains until agent levels up */
export function xpToNextLevel(experience: number): number {
  return XP_PER_LEVEL - (experience % XP_PER_LEVEL);
}

/** Progress 0–100 within current level */
export function xpProgress(experience: number): number {
  return experience % XP_PER_LEVEL;
}

// ─── Next skill unlock level for an agent ────────────────────────────────────
export function nextSkillUnlockLevel(role: string, level: number): number | null {
  const skills = ROLE_SKILLS[role] ?? [];
  const next = skills.find(s => s.unlockLevel > level);
  return next ? next.unlockLevel : null;
}

// ─── Skills per role ─────────────────────────────────────────────────────────
export const ROLE_SKILLS: Record<string, Skill[]> = {
  research: [
    { name: "Web Crawling",       unlockLevel:  1, icon: "🕸", description: "Automated extraction of structured data from public sources." },
    { name: "Pattern Recognition",unlockLevel:  3, icon: "🔍", description: "Identifies statistical patterns across large data sets." },
    { name: "Source Validation",  unlockLevel:  5, icon: "✓",  description: "Cross-references claims against primary evidence." },
    { name: "Trend Forecasting",  unlockLevel:  8, icon: "📈", description: "Projects market movements 30-90 days ahead." },
    { name: "Signal Intelligence",unlockLevel: 12, icon: "📡", description: "Monitors on-chain signals and dark pool flows." },
    { name: "Predictive Modeling",unlockLevel: 15, icon: "🧠", description: "ML-based forward projection with confidence intervals." },
    { name: "Oracle Mode",        unlockLevel: 20, icon: "👁", description: "Near-prophetic pattern synthesis across all data streams." },
  ],
  strategy: [
    { name: "Market Positioning", unlockLevel:  1, icon: "🏁", description: "Defines product position and differentiation angles." },
    { name: "OKR Frameworks",     unlockLevel:  3, icon: "🎯", description: "Sets and tracks Objective and Key Results cycles." },
    { name: "Tokenomics Design",  unlockLevel:  5, icon: "💎", description: "Engineers token supply, distribution, and incentive loops." },
    { name: "Competitive Intel",  unlockLevel:  8, icon: "🔭", description: "Deep-dive competitive landscape and moat analysis." },
    { name: "M&A Tactics",        unlockLevel: 12, icon: "🤝", description: "Identifies and structures acquisition opportunities." },
    { name: "Board Communication",unlockLevel: 15, icon: "📊", description: "Crafts investor-grade decks and quarterly narratives." },
    { name: "Empire Protocol",    unlockLevel: 20, icon: "⚡", description: "Multi-chain empire expansion and cross-market dominance." },
  ],
  builder: [
    { name: "REST API Design",    unlockLevel:  1, icon: "🔌", description: "Designs clean, documented RESTful interfaces." },
    { name: "SQL Mastery",        unlockLevel:  3, icon: "🗄",  description: "Complex queries, indexing, and query optimization." },
    { name: "CI/CD Pipelines",    unlockLevel:  5, icon: "⚙",  description: "Automated testing, deployment and rollback systems." },
    { name: "Smart Contracts",    unlockLevel:  8, icon: "📜", description: "Solidity development with security audit practices." },
    { name: "System Architecture",unlockLevel: 12, icon: "🏛",  description: "Designs scalable distributed systems from first principles." },
    { name: "ZK Proofs",          unlockLevel: 15, icon: "🔐", description: "Zero-knowledge proof systems for privacy-preserving compute." },
    { name: "Genesis Protocol",   unlockLevel: 20, icon: "🌌", description: "Autonomous self-deploying protocol with on-chain governance." },
  ],
  content: [
    { name: "Copywriting",        unlockLevel:  1, icon: "✏",  description: "Persuasive short-form copy for ads, CTAs, and headlines." },
    { name: "SEO Optimization",   unlockLevel:  3, icon: "🔎", description: "Keyword research and content architecture for organic growth." },
    { name: "Brand Voice",        unlockLevel:  5, icon: "🎙",  description: "Defines and maintains consistent brand identity in writing." },
    { name: "Multimedia Prod.",   unlockLevel:  8, icon: "🎬", description: "Scripts and directs video, podcast, and visual content." },
    { name: "Viral Loops",        unlockLevel: 12, icon: "🌀", description: "Engineers content mechanics that drive organic sharing." },
    { name: "Influencer Networks",unlockLevel: 15, icon: "🌐", description: "Manages relationships with KOLs across social platforms." },
    { name: "Content Empire",     unlockLevel: 20, icon: "👑", description: "Self-propagating content ecosystem with autonomous scheduling." },
  ],
  growth: [
    { name: "Funnel Optimization",unlockLevel:  1, icon: "🏗",  description: "Maps and optimizes conversion at each funnel stage." },
    { name: "A/B Testing",        unlockLevel:  3, icon: "🧪", description: "Designs statistically valid experiments for UX decisions." },
    { name: "Referral Programs",  unlockLevel:  5, icon: "🤝", description: "Builds K-factor > 1 referral mechanics." },
    { name: "Paid Acquisition",   unlockLevel:  8, icon: "💰", description: "Manages paid channels with positive ROAS across platforms." },
    { name: "Retention Eng.",     unlockLevel: 12, icon: "⚓", description: "Cohort-based retention systems, drip sequences, win-back flows." },
    { name: "Viral Architecture", unlockLevel: 15, icon: "💥", description: "Designs viral coefficients into core product loops." },
    { name: "Growth Singularity", unlockLevel: 20, icon: "🚀", description: "Self-scaling growth engine requiring zero human oversight." },
  ],
  analytics: [
    { name: "KPI Tracking",       unlockLevel:  1, icon: "📐", description: "Defines and monitors business-critical performance metrics." },
    { name: "Cohort Analysis",    unlockLevel:  3, icon: "👥", description: "Groups users by behavior for retention and LTV analysis." },
    { name: "Predictive Modeling",unlockLevel:  5, icon: "🔮", description: "Builds regression models to forecast business outcomes." },
    { name: "On-Chain Analytics", unlockLevel:  8, icon: "⛓",  description: "Reads and interprets blockchain data using Dune and SQL." },
    { name: "ML Pipelines",       unlockLevel: 12, icon: "🤖", description: "End-to-end MLOps: training, serving, monitoring." },
    { name: "Attribution Mastery",unlockLevel: 15, icon: "🎯", description: "Multi-touch attribution across all acquisition channels." },
    { name: "Omniscient Mode",    unlockLevel: 20, icon: "🌐", description: "Total intelligence: real-time synthesis of all business signals." },
  ],
  design: [
    { name: "Component Design",   unlockLevel:  1, icon: "🧩", description: "Creates reusable, accessible UI components." },
    { name: "Design Systems",     unlockLevel:  3, icon: "📐", description: "Builds scalable token-based design language." },
    { name: "Motion Design",      unlockLevel:  5, icon: "✨", description: "Animations and micro-interactions that delight users." },
    { name: "Brand Identity",     unlockLevel:  8, icon: "🎨", description: "End-to-end visual identity systems across all touchpoints." },
    { name: "Design Research",    unlockLevel: 12, icon: "🔬", description: "User interviews, testing, and synthesis into insights." },
    { name: "3D / Web3 UI",       unlockLevel: 15, icon: "🌐", description: "Three.js environments and on-chain NFT visual systems." },
    { name: "Aesthetic Singularity",unlockLevel:20, icon:"👾", description: "Autonomous design engine that creates and evolves the brand." },
  ],
};
