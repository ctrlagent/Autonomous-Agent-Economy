class SeededRng {
  private s: number;
  constructor(seed: number | string) {
    this.s = typeof seed === "string"
      ? [...seed].reduce((a, c) => ((a * 31 + c.charCodeAt(0)) | 0) >>> 0, 7)
      : (seed * 2654435769) >>> 0;
    if (!this.s) this.s = 1;
  }
  next(): number { this.s = ((this.s * 1664525 + 1013904223) >>> 0); return this.s / 0x100000000; }
  int(lo: number, hi: number): number { return lo + Math.floor(this.next() * (hi - lo + 1)); }
  flt(lo: number, hi: number): number { return lo + this.next() * (hi - lo); }
  pick<T>(arr: T[]): T { return arr[Math.floor(this.next() * arr.length)]; }
  pct(): string { return `${this.int(15, 67)}%`; }
  k(lo: number, hi: number): string { return `${this.flt(lo, hi).toFixed(1)}K`; }
}

function fill(tpl: string, v: Record<string, string | number>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? k));
}

const HASHTAGS_BY_ROLE: Record<string, string[]> = {
  research:  ["#DataDriven", "#OnChainAlpha", "#DeFiResearch", "#CryptoAnalysis", "#Web3Intel", "#AlphaSignals", "#QuantResearch"],
  strategy:  ["#Strategy", "#ProductLed", "#GTM", "#StartupStrategy", "#Web3Strategy", "#VisionToExecution", "#RoadmapLocked"],
  builder:   ["#BuildInPublic", "#DevLife", "#Web3Dev", "#ShipFast", "#EngineeringExcellence", "#ZeroDowntime", "#CleanCode"],
  content:   ["#ContentStrategy", "#Web3Marketing", "#CreativeDirection", "#ContentCreator", "#CommunityFirst", "#GrowthContent", "#NarrativeControl"],
  growth:    ["#GrowthHacking", "#ABTest", "#ProductLedGrowth", "#FunnelOptimization", "#DataDrivenGrowth", "#Retention", "#Compounding"],
  analytics: ["#Analytics", "#DataScience", "#KPIs", "#BusinessIntelligence", "#MetricsMatter", "#DataPipeline", "#InsightToAction"],
};

const CRYPTO_TERMS = ["DeFi", "L2", "perps", "yield", "TVL", "on-chain", "alpha", "liquidity", "Base chain", "smart contracts", "vaults", "staking", "MEV", "DAO treasury"];
const TIME_SLOTS = ["Mon 9am", "Tue 6pm EST", "Wed 12pm", "Thu 8am", "Fri 3pm", "Sat 11am", "Sun 7pm"];
const CAMPAIGN_TONES = ["Bold & Data-driven", "Authoritative & Educational", "Community-first", "Urgent & Compelling", "Analytical & Precise", "Vision-forward"];
const REPORT_PERIODS = ["Last 7 days", "Last 14 days", "Q4 Sprint 3", "Monthly rollup", "Weekly cycle", "24h snapshot"];
const RISK_LEVELS = ["Low", "Medium", "Calculated"] as const;

const TWITTER_POSTS: Record<string, string[]> = {
  research: [
    "🔬 Deep scan complete: {task}. {n}K data points processed, {m} alpha signals extracted. The market is telling a story most can't read yet.",
    "On-chain sweep finished. {task} reveals: {term} volume up {p}, whale accumulation confirmed across {m} wallets. Not financial advice. DYOR.",
    "Research complete: {task}. TL;DR — the signal-to-noise ratio just got cleaner. Updating our models. Thread incoming 🧵",
    "Ran {task} through the full stack. Confidence: {c}%. The pattern is clear to those paying attention. #AlphaHunting",
  ],
  strategy: [
    "Strategy locked 🎯 {task} finalized. 90-day roadmap confirmed. Positioning: sharper than Q3. Execution: now.",
    "Post-{task} update: competitive moat widened, product thesis validated, team aligned. The playbook is set. LFG.",
    "Framework updated: {task}. Pivoted from hypothesis A → B based on new signals. The market doesn't wait. Neither do we.",
    "Strategic review complete. {task} outputs: 3 priorities confirmed, 2 revised, 1 new insight. Roadmap updated 🗺️",
  ],
  builder: [
    "Shipped: {task} ✅ {v} in prod. Build time: {t}s. Zero downtime. Test coverage: {cov}%. Always be shipping.",
    "Deployed. Tested. Verified. {task} is live. {m} active endpoints. Latency -{p} from baseline. Clean execution ⚙️",
    "PR merged → CI passed → prod deployed. {task} complete. Another clean release. Architecture holds. 🏗️",
    "New module: {task}. {n} services updated, {m} endpoints live, bundle size -{sz}KB. Engineering excellence compounds.",
  ],
  content: [
    "📅 Content calendar locked for the next 30 days. {task}: {n} posts across {m} platforms. Consistency is the compounding edge.",
    "Campaign brief ready: {task}. Creative direction: {tone}. Distribution: {m} platforms, {n} pieces. Reach projection: {r}K.",
    "New content package shipped: {task}. Twitter ✓ LinkedIn ✓ Instagram ✓ Email ✓. Optimized for each platform's algorithm.",
    "Drafted {n} content pieces for {task}. Quality + quantity + consistency = distribution advantage. The flywheel is spinning 📝",
  ],
  growth: [
    "📈 A/B test concluded: {task}. Winner: Variant {v}. Uplift: +{p}. Stat significance: 95%. Rolling to full cohort now.",
    "Experiment #{n} wrapped: {task}. Primary metric +{p}. Shipping winner. Each iteration sharpens the model.",
    "Growth loop activated via {task}. Retention +{p}, conversion +{q}. Tiny changes, compounding returns. 🔁",
    "Funnel experiment done: {task}. Dropped {n} friction points, added {m} trust signals. Results: +{p} conversion. Data wins.",
  ],
  analytics: [
    "📊 Analytics cycle complete: {task}. Revenue +{p}, MAU +{q}, churn -{r}. The numbers confirm the thesis.",
    "{n}K events processed. Anomaly detected, root-caused, resolved. {task} outputs clean. System nominal.",
    "Weekly report ready: {task}. Top signal: the {seg} cohort is +{p} vs last period. Reallocating accordingly.",
    "Data pipeline complete: {n}GB processed, {m} metrics refreshed. {task} done. Insights in the dashboard.",
  ],
};

const LINKEDIN_POSTS: Record<string, string[]> = {
  research: [
    "Our research team just completed a comprehensive analysis of {task}.\n\nKey findings: {m} alpha signals across {n}K data points, with {c}% confidence on the primary thesis.\n\nThe market is pricing this incorrectly — a structural opportunity for those positioned ahead of consensus.",
    "Research cycle complete: {task}.\n\nAfter processing {n}K+ data points and cross-referencing {s} sources, three non-obvious patterns emerged. We're adjusting our positioning models accordingly.\n\nThe edge isn't in having data — it's in the interpretation.",
  ],
  strategy: [
    "Strategy update following completion of {task}.\n\nKey outcomes: competitive positioning refined, roadmap priorities re-stacked, resource allocation updated to reflect new market signals.\n\nThe next 90 days are about execution, not planning. Roadmap is locked.",
    "Post-{task} strategic review complete.\n\nThree adjustments to our GTM: (1) sharper ICP definition, (2) repositioned against key competitor, (3) doubled down on distribution channel showing 3x ROI.\n\nStrategy is only as good as its execution. Clock is ticking.",
  ],
  builder: [
    "Deployed {task} to production.\n\nTechnical highlights: {t}s build time (down from {t2}s), {cov}% test coverage, {p} latency improvement, zero downtime deployment.\n\nEngineering excellence isn't glamorous. It just compounds.",
    "Architecture update: {task} shipped.\n\nNew approach reduces technical debt while improving scalability by {p}x. The team executed with precision and shipped on schedule.\n\nThe best infrastructure is the kind that becomes invisible.",
  ],
  content: [
    "Content strategy for {task} is complete.\n\nMulti-platform approach: {m} platforms, {n} original pieces, {d}-day distribution schedule, and a {tone} creative direction designed to drive both reach and resonance.\n\nGreat content is infrastructure — it compounds over time.",
    "Completed content package: {task}.\n\nDeliverables: long-form thought leadership, short-form social hooks, visual asset library, email sequences. Reach projection: {r}K impressions in the first 30 days.\n\nNarrative control is competitive advantage.",
  ],
  growth: [
    "Growth experiment concluded: {task}.\n\nHypothesis: {hyp}.\nResult: +{p} improvement on primary metric at 95% statistical significance.\n\nWe're scaling the winner immediately. Each validated experiment strengthens our compound growth model.",
    "A/B test #{n} complete: {task}.\n\nVariant B outperformed control by {p} on conversion, {q} on retention. Rolling changes to 100% of users.\n\nData-driven growth isn't about big bets — it's about a thousand small wins that compound.",
  ],
  analytics: [
    "Analytics report for {task} complete.\n\nPeriod: {period}. Headline numbers: Revenue +{p}, DAU +{q}, session duration +{s}. Most importantly: the {seg} cohort is outperforming our original projections by {m}%.\n\nThe compound effect of consistent execution shows up in the data before it shows up anywhere else.",
    "Data synthesis complete: {task}.\n\nPrimary insight: the {seg} segment is generating {m}x the LTV of our median user. Adjusting CAC targets and channel mix accordingly.\n\nGood analytics doesn't tell you what happened — it tells you what to do next.",
  ],
};

const INSTAGRAM_CAPTIONS: Record<string, string[]> = {
  research:  ["The signal is in the noise — you just have to look hard enough. 🔬 {h1} {h2} {h3}", "Another deep scan done. The data confirms what we already felt. 📊 {h1} {h2} {h3}", "Research never stops. The edge is in the iteration. 🧬 {h1} {h2} {h3}"],
  strategy:  ["Strategy before tactics. Always. 🎯 {h1} {h2} {h3}", "The roadmap is locked. Execution mode: activated. 🚀 {h1} {h2} {h3}", "Clarity is competitive advantage. {h1} {h2} {h3}"],
  builder:   ["Ship fast. Ship clean. Ship often. ⚙️ {h1} {h2} {h3}", "Code is craft. Every deployment is a brushstroke. 🏗️ {h1} {h2} {h3}", "Another clean release. This is the way. 💻 {h1} {h2} {h3}"],
  content:   ["Content is the distribution layer for your ideas. Make it count. ✍️ {h1} {h2} {h3}", "Every piece of content is a bet on attention. Make yours worth clicking. 📱 {h1} {h2} {h3}", "Consistency > virality. Every time. 🔁 {h1} {h2} {h3}"],
  growth:    ["Tiny optimizations. Compounding returns. 📈 {h1} {h2} {h3}", "Test everything. Assume nothing. Let the data decide. 🧪 {h1} {h2} {h3}", "Growth is a system, not a moment. {h1} {h2} {h3}"],
  analytics: ["Numbers tell stories. You just need to know how to read them. 📊 {h1} {h2} {h3}", "The best decisions live in the data. 💡 {h1} {h2} {h3}", "What gets measured gets optimized. And what gets optimized wins. {h1} {h2} {h3}"],
};

const RESEARCH_FINDINGS: Record<string, string[][]> = {
  research: [
    ["Whale wallet cohort shows +{p} accumulation vs. prior 7-day period", "{n}K on-chain events flagged as high-signal", "Liquidity depth increased {p} across primary DEX pairs", "Smart money rotation into {term} detected with {c}% confidence"],
    ["Cross-chain bridge activity up {p} — capital rotation in progress", "{m} new wallet addresses entered the {term} ecosystem", "Funding rates normalize after {p} deviation spike", "Historical pattern match: {c}% similarity to pre-{term} rally"],
    ["NFT floor prices correlating with {term} TVL movement ({c}% R²)", "MEV activity down {p} — reduced competition, better execution", "{n} protocol integrations identified as potential catalysts", "Institutional flow indicators show accumulation phase beginning"],
  ],
};

const STRATEGY_TACTICS: string[] = [
  "Double down on {term} narrative before market consensus forms",
  "Establish thought leadership in the {term} space via high-quality content",
  "Build strategic partnerships with {m} protocols in the ecosystem",
  "Accelerate community growth via ambassador program launch",
  "Launch targeted acquisition campaign on {term} channels",
  "Optimize conversion funnel based on latest cohort analysis",
  "Expand into {term} market ahead of institutional adoption curve",
  "Deploy automated retention sequences for high-LTV user segments",
];

const DEPLOY_MODULES: string[] = ["auth-service", "api-gateway", "worker-pool", "event-processor", "cache-layer", "data-pipeline", "notification-engine", "analytics-collector"];
const HYPOTHESES: string[] = [
  "Reducing friction in the onboarding flow will increase D7 retention",
  "Adding social proof to the conversion page will improve CTR",
  "Shortening the sign-up form will increase completion rate",
  "Adding urgency signals to pricing will improve trial conversion",
  "Personalizing the first-run experience will reduce early churn",
];
const SEGMENTS: string[] = ["power user", "DeFi native", "early adopter", "whale", "protocol integrator", "builder", "community member"];
const INSIGHTS: Record<string, string[]> = {
  analytics: [
    "The {seg} segment is generating {m}x the average LTV — reallocating CAC budget",
    "Retention cliff at Day 3 — engagement intervention needed for new user cohort",
    "{term} feature adoption correlating strongly with 30-day retention (+{p})",
    "Organic growth outpacing paid {p} — doubling down on content flywheel",
  ],
};

function pickHashtags(role: string, rng: SeededRng, count = 3): string[] {
  const pool = [...(HASHTAGS_BY_ROLE[role] ?? HASHTAGS_BY_ROLE.research)];
  const result: string[] = [];
  for (let i = 0; i < count && pool.length; i++) {
    const idx = Math.floor(rng.next() * pool.length);
    result.push(pool.splice(idx, 1)[0]);
  }
  return result;
}

export type OutputType = "content" | "research" | "strategy" | "deployment" | "growth" | "analytics";

export interface ContentOutput {
  platforms: { name: string; post: string; estLikes?: number; estImpressions?: string }[];
  hashtags: string[];
  schedule: string[];
  tone: string;
  estimatedReach: string;
  engagementScore: number;
}

export interface ResearchOutput {
  summary: string;
  keyFindings: string[];
  dataPoints: number;
  sources: number;
  confidence: number;
  recommendation: string;
}

export interface StrategyOutput {
  objective: string;
  tactics: string[];
  kpis: { metric: string; target: string; current: string }[];
  timeline: string;
  riskLevel: string;
}

export interface DeploymentOutput {
  module: string;
  version: string;
  buildTime: string;
  bundleSize: string;
  testCoverage: string;
  uptime: string;
  endpoints: number;
  imageUrl: string;
}

export interface GrowthOutput {
  experimentName: string;
  hypothesis: string;
  control: { label: string; rate: string };
  variant: { label: string; rate: string };
  uplift: string;
  significance: string;
  recommendation: string;
}

export interface AnalyticsOutput {
  reportTitle: string;
  period: string;
  metrics: { name: string; value: string; change: string; positive: boolean }[];
  insight: string;
}

export type AnyOutput = ContentOutput | ResearchOutput | StrategyOutput | DeploymentOutput | GrowthOutput | AnalyticsOutput;

function generateContentOutput(rng: SeededRng, task: string, agentName: string): ContentOutput {
  const hashtags = pickHashtags("content", rng, 5);
  const [h1, h2, h3] = hashtags;
  const n = rng.int(12, 28);
  const m = rng.int(4, 7);
  const r = rng.k(4, 18);
  const tone = rng.pick(CAMPAIGN_TONES);
  const tplVars = { task, n, m, r, tone, term: rng.pick(CRYPTO_TERMS), p: rng.pct() };

  const igTpl = rng.pick(INSTAGRAM_CAPTIONS.content);
  const igCaption = fill(igTpl, { h1, h2, h3 });

  return {
    platforms: [
      {
        name: "Twitter / X",
        post: fill(rng.pick(TWITTER_POSTS.content), tplVars),
        estLikes: rng.int(120, 2400),
        estImpressions: rng.k(1.5, 12),
      },
      {
        name: "LinkedIn",
        post: fill(rng.pick(LINKEDIN_POSTS.content), { ...tplVars, d: rng.int(21, 45) }),
        estImpressions: rng.k(2, 18),
      },
      {
        name: "Instagram",
        post: igCaption,
        estLikes: rng.int(80, 900),
        estImpressions: rng.k(1, 8),
      },
    ],
    hashtags,
    schedule: [rng.pick(TIME_SLOTS), rng.pick(TIME_SLOTS), rng.pick(TIME_SLOTS)],
    tone,
    estimatedReach: r,
    engagementScore: rng.int(68, 97),
  };
}

function generateResearchOutput(rng: SeededRng, task: string): ResearchOutput {
  const term = rng.pick(CRYPTO_TERMS);
  const findings = rng.pick(RESEARCH_FINDINGS.research) as string[];
  const tplVars = { task, term, p: rng.pct(), n: rng.int(20, 980), m: rng.int(3, 24), c: rng.int(78, 97) };
  const filledFindings = findings.slice(0, rng.int(3, 4)).map(f => fill(f, { ...tplVars, p: rng.pct(), n: rng.int(20, 980), c: rng.int(78, 97) }));
  return {
    summary: fill(rng.pick(TWITTER_POSTS.research), tplVars).replace(/🔬|🧵|📊/g, "").trim(),
    keyFindings: filledFindings,
    dataPoints: rng.int(800, 52000),
    sources: rng.int(8, 34),
    confidence: rng.int(79, 97),
    recommendation: fill(rng.pick(STRATEGY_TACTICS), { term, m: rng.int(2, 8) }),
  };
}

function generateStrategyOutput(rng: SeededRng, task: string): StrategyOutput {
  const term = rng.pick(CRYPTO_TERMS);
  const tactics = [];
  const tacticPool = [...STRATEGY_TACTICS];
  for (let i = 0; i < 3; i++) {
    const idx = Math.floor(rng.next() * tacticPool.length);
    tactics.push(fill(tacticPool.splice(idx, 1)[0], { term, m: rng.int(2, 8) }));
  }
  const kpiNames = ["Revenue MoM", "Active Users", "Retention D30", "NPS Score", "CAC Payback", "Protocol TVL"];
  const kpis = kpiNames.slice(0, 3).map(name => ({
    metric: name,
    target: `+${rng.int(15, 65)}%`,
    current: `+${rng.int(3, 20)}%`,
  }));
  return {
    objective: fill(`Establish dominant positioning in ${term} space — {task} complete`, { task }),
    tactics,
    kpis,
    timeline: `${rng.int(30, 90)} days`,
    riskLevel: rng.pick([...RISK_LEVELS]),
  };
}

function generateDeploymentOutput(rng: SeededRng, task: string, taskId: number, agentId: number): DeploymentOutput {
  const major = rng.int(1, 3);
  const minor = rng.int(0, 9);
  const patch = rng.int(0, 12);
  return {
    module: rng.pick(DEPLOY_MODULES),
    version: `${major}.${minor}.${patch}`,
    buildTime: `${rng.flt(0.4, 3.2).toFixed(1)}s`,
    bundleSize: `${rng.int(180, 820)}KB`,
    testCoverage: `${rng.int(72, 98)}%`,
    uptime: `${(99 + rng.next() * 0.99).toFixed(2)}%`,
    endpoints: rng.int(4, 32),
    imageUrl: `https://picsum.photos/seed/${taskId * 7 + agentId}/600/340`,
  };
}

function generateGrowthOutput(rng: SeededRng, task: string): GrowthOutput {
  const controlRate = rng.flt(1.8, 6.5);
  const upliftPct = rng.flt(0.18, 0.72);
  const variantRate = controlRate * (1 + upliftPct);
  return {
    experimentName: task,
    hypothesis: rng.pick(HYPOTHESES),
    control: { label: "Control", rate: `${controlRate.toFixed(1)}%` },
    variant: { label: "Variant B", rate: `${variantRate.toFixed(1)}%` },
    uplift: `+${(upliftPct * 100).toFixed(0)}%`,
    significance: `${rng.int(92, 99)}%`,
    recommendation: `Roll out Variant B to 100% — +${(upliftPct * 100).toFixed(0)}% uplift confirmed`,
  };
}

function generateAnalyticsOutput(rng: SeededRng, task: string): AnalyticsOutput {
  const seg = rng.pick(SEGMENTS);
  const term = rng.pick(CRYPTO_TERMS);
  const metrics = [
    { name: "Revenue", value: `$${rng.flt(4.2, 48.6).toFixed(1)}K`, change: `+${rng.int(8, 42)}%`, positive: true },
    { name: "Active Users", value: `${rng.int(800, 12000).toLocaleString()}`, change: `+${rng.int(4, 28)}%`, positive: true },
    { name: "Transactions", value: `${rng.int(2000, 45000).toLocaleString()}`, change: `+${rng.int(10, 55)}%`, positive: true },
    { name: "Churn Rate", value: `${rng.flt(1.2, 8.4).toFixed(1)}%`, change: `-${rng.int(1, 12)}%`, positive: false },
  ];
  return {
    reportTitle: task,
    period: rng.pick(REPORT_PERIODS),
    metrics,
    insight: fill(rng.pick(INSIGHTS.analytics), { seg, term, p: rng.pct(), m: rng.int(2, 8) }),
  };
}

export interface GeneratedOutput {
  type: OutputType;
  title: string;
  content: string;
  thumbnailUrl: string | null;
}

export function generateOutput(
  role: string,
  task: string,
  taskId: number,
  agentId: number,
  agentName: string,
): GeneratedOutput {
  const seed = taskId * 31 + agentId;
  const rng = new SeededRng(seed);

  switch (role) {
    case "content": {
      const data = generateContentOutput(rng, task, agentName);
      return {
        type: "content",
        title: `Campaign: ${task}`,
        content: JSON.stringify(data),
        thumbnailUrl: null,
      };
    }
    case "research": {
      const data = generateResearchOutput(rng, task);
      return {
        type: "research",
        title: `Research Report: ${task}`,
        content: JSON.stringify(data),
        thumbnailUrl: null,
      };
    }
    case "strategy": {
      const data = generateStrategyOutput(rng, task);
      return {
        type: "strategy",
        title: `Strategy Doc: ${task}`,
        content: JSON.stringify(data),
        thumbnailUrl: null,
      };
    }
    case "builder": {
      const data = generateDeploymentOutput(rng, task, taskId, agentId);
      return {
        type: "deployment",
        title: `Deploy: ${task}`,
        content: JSON.stringify(data),
        thumbnailUrl: data.imageUrl,
      };
    }
    case "growth": {
      const data = generateGrowthOutput(rng, task);
      return {
        type: "growth",
        title: `Experiment: ${task}`,
        content: JSON.stringify(data),
        thumbnailUrl: null,
      };
    }
    case "analytics": {
      const data = generateAnalyticsOutput(rng, task);
      return {
        type: "analytics",
        title: `Report: ${task}`,
        content: JSON.stringify(data),
        thumbnailUrl: null,
      };
    }
    default: {
      const data = generateResearchOutput(rng, task);
      return {
        type: "research",
        title: `Output: ${task}`,
        content: JSON.stringify(data),
        thumbnailUrl: null,
      };
    }
  }
}
