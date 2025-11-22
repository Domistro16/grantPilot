import React, { useState, useEffect, useRef } from "react";
import { Search, Filter, Sparkles } from "lucide-react";

// ------------------------------ MOCK DATA ------------------------------
const mockGrants = [
  {
    id: 1,
    chain: "BNB Chain",
    category: "Infra",
    title: "BNB Chain Builder Grants",
    tag: "Infra · DeFi · Tooling",
    amount: "Up to $150k",
    status: "Open",
    deadline: "Dec 30, 2025",
    summary:
      "Support for builders shipping infra, DeFi, gaming and tooling on BNB Chain.",
    focus: "Teams with deployed MVPs, traction, or strong ecosystem alignment.",
    link: "#",
  },
  {
    id: 2,
    chain: "Solana",
    category: "Ecosystem",
    title: "Solana Ecosystem Grants",
    tag: "Infra · Consumer · Payments",
    amount: "Varies by track",
    status: "Open",
    deadline: "Rolling",
    summary:
      "Fueling high-performance apps, consumer products and infra on Solana.",
    focus: "Strong UX, clear go-to-market, and on-chain traction.",
    link: "#",
  },
  {
    id: 3,
    chain: "Ethereum / L2s",
    category: "Public Goods",
    title: "Ethereum Foundation Grants",
    tag: "Research · Public Goods",
    amount: "Custom per proposal",
    status: "Upcoming",
    deadline: "Q1 2026 (est.)",
    summary:
      "Support for core research, protocol work and public goods across the Ethereum ecosystem.",
    focus: "Long-term, mission-driven work that improves Ethereum for everyone.",
    link: "#",
  },
  {
    id: 4,
    chain: "Multichain",
    category: "Hackathons",
    title: "Ecosystem & Hackathon Match",
    tag: "Match · Acceleration",
    amount: "$5k – $50k",
    status: "Open",
    deadline: "Jan 15, 2026",
    summary:
      "Match funding for teams emerging from hackathons and accelerator programs.",
    focus: "Early-stage teams with a clear plan to ship in 90 days.",
    link: "#",
  },
  {
    id: 5,
    chain: "Polygon",
    category: "Ecosystem",
    title: "Polygon Village Grants",
    tag: "DeFi · Gaming · Infra",
    amount: "Varies by track",
    status: "Open",
    deadline: "Rolling",
    summary:
      "Support for teams expanding the Polygon ecosystem across key verticals.",
    focus: "Protocols and products that grow usage on Polygon.",
    link: "#",
  },
  {
    id: 6,
    chain: "Base",
    category: "Consumer",
    title: "Base Ecosystem Grants",
    tag: "Consumer · Tools",
    amount: "Up to $150k",
    status: "Open",
    deadline: "Rolling",
    summary: "Growing consumer apps, infra and tools on Base.",
    focus: "Teams with strong user focus and measurable on-chain activity.",
    link: "#",
  },
  {
    id: 7,
    chain: "Arbitrum",
    category: "L2 Infra",
    title: "Arbitrum Grants (Public Goods)",
    tag: "Infra · Tooling",
    amount: "Custom",
    status: "Upcoming",
    deadline: "TBA",
    summary: "Support for public goods and infra around Arbitrum.",
    focus: "Tooling and infra that benefit the wider ecosystem.",
    link: "#",
  },
  {
    id: 8,
    chain: "Optimism",
    category: "Public Goods",
    title: "Optimism Grants & RPGF",
    tag: "Retroactive · Public Goods",
    amount: "Varies",
    status: "Open",
    deadline: "By season",
    summary:
      "Retroactive and direct grants for impactful public goods on Optimism.",
    focus: "Measurable impact for the Optimism Collective.",
    link: "#",
  },
  {
    id: 9,
    chain: "Near",
    category: "Tooling",
    title: "Near Ecosystem Grants",
    tag: "Tools · Infra",
    amount: "Up to $75k",
    status: "Open",
    deadline: "Rolling",
    summary:
      "Boosting Near ecosystem with tools, infra, and user-facing apps.",
    focus: "Developer tools and infra with real usage.",
    link: "#",
  },
  {
    id: 10,
    chain: "Aptos",
    category: "Infra",
    title: "Aptos Developer Grants",
    tag: "Infra · Tooling",
    amount: "Up to $100k",
    status: "Open",
    deadline: "Rolling",
    summary: "Funding for builders shipping infra and tooling on Aptos.",
    focus: "High-leverage infra and devex improvements.",
    link: "#",
  },
  {
    id: 11,
    chain: "Sui",
    category: "Tooling",
    title: "Sui Developer Grants",
    tag: "Tooling · Infra",
    amount: "Up to $50k",
    status: "Open",
    deadline: "Rolling",
    summary: "Empowering devs with tools and infra on Sui.",
    focus: "High-impact tools used by other teams.",
    link: "#",
  },
  {
    id: 12,
    chain: "Scroll",
    category: "ZK",
    title: "Scroll Ecosystem Grants",
    tag: "ZK · Infra",
    amount: "Varies",
    status: "Open",
    deadline: "TBA",
    summary: "ZK infra and ecosystem grants for Scroll.",
    focus: "Research, infra and tooling around ZK-based apps.",
    link: "#",
  },
];

const statusColors: Record<string, string> = {
  Open: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40",
  Upcoming: "bg-amber-500/10 text-amber-300 border border-amber-500/40",
  Closed: "bg-rose-500/10 text-rose-300 border border-rose-500/40",
};

export default function GrantPilotDashboard() {
  const [selectedId, setSelectedId] = useState<number>(1);
  const [query, setQuery] = useState("");
  const [agentOpen, setAgentOpen] = useState(false);
  const [chainFilter, setChainFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const activeItemRef = useRef<HTMLButtonElement | null>(null);

  const selected = mockGrants.find((g) => g.id === selectedId) || mockGrants[0];

  const chainOptions = ["All", ...Array.from(new Set(mockGrants.map((g) => g.chain)))];
  const categoryOptions = ["All", ...Array.from(new Set(mockGrants.map((g) => g.category)))];
  const statusOptions = ["All", "Open", "Upcoming", "Closed"];

  const normalizedQuery = query.toLowerCase().trim();

  const filtered = mockGrants.filter((g) => {
    const matchesQuery =
      !normalizedQuery ||
      g.title.toLowerCase().includes(normalizedQuery) ||
      g.chain.toLowerCase().includes(normalizedQuery) ||
      g.summary.toLowerCase().includes(normalizedQuery) ||
      g.tag.toLowerCase().includes(normalizedQuery);

    const matchesChain = chainFilter === "All" || g.chain === chainFilter;
    const matchesCategory = categoryFilter === "All" || g.category === categoryFilter;
    const matchesStatus = statusFilter === "All" || g.status === statusFilter;

    return matchesQuery && matchesChain && matchesCategory && matchesStatus;
  });

  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [selectedId]);

  const AgentContent: React.FC = () => (
    <>
      <div className="rounded-xl border border-white/10 bg-black/40 p-3 space-y-3 text-[11px] text-gray-200 overflow-y-auto max-h-[50vh] lg:max-h-none">
        <div className="bg-white/5 border border-white/10 rounded-2xl px-3 py-2 max-w-[90%]">
          <p>Tell me what you're building and I'll map it to realistic grant paths.</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl px-3 py-2 max-w-[90%]">
          <p className="text-gray-300 mb-1">For this {selected.chain} program, consider:</p>
          <ul className="list-disc list-inside text-gray-300 space-y-0.5">
            <li>Your traction with dashboards and agents.</li>
            <li>Why this should live on {selected.chain}.</li>
            <li>How funds map to milestones.</li>
          </ul>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/40 rounded-2xl px-3 py-2 max-w-[90%]">
          <p className="text-emerald-200 text-[11px] font-semibold mb-0.5">Coming soon</p>
          <p className="text-emerald-100/90 text-[11px]">
            Connect your deck + Notion once and auto-draft answers for every grant you click.
          </p>
        </div>
      </div>
      <div className="mt-3 bg-black/70 border border-white/10 rounded-2xl px-3 py-2 flex items-center gap-2">
        <div className="h-7 w-7 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-black font-semibold text-[11px]">
          L3
        </div>
        <input
          placeholder="Paste short project blurb..."
          className="flex-1 bg-transparent text-[11px] outline-none placeholder:text-gray-500"
        />
        <button className="px-2.5 py-1.5 bg-amber-400 text-black rounded-xl text-[11px] font-medium hover:bg-amber-300 transition-colors">
          Send
        </button>
      </div>
      <p className="text-[10px] text-gray-300 text-right mt-2">Demo only · No data sent.</p>
    </>
  );

  const DetailContent: React.FC = () => (
    <>
      <h2 className="text-xl font-semibold mb-2">{selected.title}</h2>
      <p className="text-[11px] text-gray-400 mb-3">{selected.tag}</p>

      <div className="text-xs text-gray-300 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`px-2 py-1 rounded-full text-[10px] ${statusColors[selected.status]}`}
          >
            {selected.status}
          </span>
          <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-full text-[10px]">
            {selected.chain}
          </span>
          <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-full text-[10px]">
            {selected.category}
          </span>
        </div>

        <p className="text-gray-300">{selected.summary}</p>

        <div className="bg-black/30 border border-white/10 rounded-xl p-3 space-y-1">
          <p className="text-[11px] text-gray-300">
            <strong>Funding:</strong>{" "}
            <span className="text-[#FFB000] font-semibold">{selected.amount}</span>
          </p>
          <p className="text-[11px] text-gray-300">
            <strong>Deadline:</strong> {selected.deadline}
          </p>
          <p className="text-[11px] text-gray-300">
            <strong>Focus:</strong> {selected.focus}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mt-2">
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-3">
            <p className="text-[11px] uppercase tracking-wide text-emerald-300 mb-1">Fit (demo)</p>
            <p className="text-sm font-semibold">Strong for infra + agents</p>
            <p className="text-[11px] text-gray-400">
              Based on teams shipping infra, dashboards & agents.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-sky-500/10 via-sky-500/5 to-transparent p-3">
            <p className="text-[11px] uppercase tracking-wide text-sky-300 mb-1">Time to apply</p>
            <p className="text-sm font-semibold">45–60 minutes</p>
            <p className="text-[11px] text-gray-400">
              Assuming deck, metrics & Notion are ready.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <button
          onClick={() => setIsSubscribed((prev) => !prev)}
          className={`w-full px-3 py-2 rounded-xl text-black text-xs font-semibold transition flex items-center justify-center gap-2 shadow-md ${
            isSubscribed ? "bg-emerald-500 hover:bg-emerald-400" : "bg-amber-400 hover:bg-amber-300"
          }`}
        >
          {isSubscribed ? (
            <>
              <span className="h-1.5 w-1.5 bg-emerald-300 rounded-full animate-ping" />
              Subscribed
            </>
          ) : (
            <>Subscribe to this grant</>
          )}
        </button>
        <a
          href={selected.link}
          className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/10 text-xs hover:bg-white/20 transition text-center"
        >
          Open grant page
        </a>
        <button onClick={() => { setDetailOpen(false); setAgentOpen(true); }} className="w-full flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-[11px] font-medium shadow-[0_0_12px_rgba(16,185,129,0.35)] text-center transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-[0_0_18px_rgba(16,185,129,0.55)]">
          <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Let GrantPilot draft my first response
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen w-full bg-[#050816] text-gray-100">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8 flex flex-col">
        {/* HEADER */}
        <header className="sticky top-0 z-30 bg-[#050816]/80 backdrop-blur border-b border-white/5 px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-amber-500/40">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">GrantPilot</h1>
              <p className="text-xs text-gray-400">One cockpit for multi-chain grants.</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 rounded-full">
              <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Live grant intel
            </span>
            <button className="px-6 py-1.5 bg-[#FFB000] text-black rounded-full hover:bg-[#e6a000]">
              Connect Wallet
            </button>
          </div>
        </header>

        {/* DESKTOP DISCOVERY INTRO */}
        <section className="hidden lg:block bg-[#050816]/95 backdrop-blur border-b border-white/5 px-4 md:px-8 py-6">
          <p className="text-[10px] text-amber-400 font-semibold">DISCOVERY</p>
          <h2 className="text-2xl sm:text-3xl font-bold leading-snug">Your AI co-pilot for multi-chain grants.</h2>
          <p className="text-xs sm:text-sm text-gray-400 max-w-2xl mt-1">
            Filter, compare and prep your funding path across ecosystems without losing the narrative of what you're
            building.
          </p>
        </section>

        {/* DESKTOP DISCOVERY CONTROLS */}
        <div className="hidden lg:grid lg:grid-cols-[1.1fr_1.4fr_1.1fr] w-full px-4 md:px-8 relative h-full">
          <section className="sticky top-0 z-20 col-start-2 col-end-4 bg-[#050816]/95 backdrop-blur border-b border-white/5 py-4">
            <div className="bg-black/30 border border-white/10 p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-[11px] text-gray-400">
                <div className="inline-flex items-center gap-1">
                  <Filter className="h-3 w-3" />
                  <span>Discovery controls</span>
                </div>
                <span className="hidden sm:inline text-[10px] text-gray-300">
                  Demo data · Not connected to real programs (yet).
                </span>
              </div>
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-gray-500 pointer-events-none" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by grant, chain, category or narrative..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-8 pr-3 text-xs placeholder:text-gray-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <select
                  value={chainFilter}
                  onChange={(e) => setChainFilter(e.target.value)}
                  className="rounded-xl bg-black text-white border border-white/10 px-3 py-2 focus:border-amber-400 focus:outline-none"
                >
                  {chainOptions.map((c) => (
                    <option key={c} value={c}>
                      {c === "All" ? "All chains" : c}
                    </option>
                  ))}
                </select>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="rounded-xl bg-black text-white border border-white/10 px-3 py-2 focus:border-amber-400 focus:outline-none"
                >
                  {categoryOptions.map((c) => (
                    <option key={c} value={c}>
                      {c === "All" ? "All categories" : c}
                    </option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl bg-black text-white border border-white/10 px-3 py-2 focus:border-amber-400 focus:outline-none"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>
        </div>

        {/* MAIN AREA */}
        <main className="flex-1 pb-6 overflow-visible px-4 md:px-8">
          {/* MOBILE DISCOVERY + CONTROLS */}
          <div className="lg:hidden space-y-4 mb-6">
            <section className="bg-[#050816]/95 backdrop-blur border border-white/5 px-4 py-4 rounded-2xl">
              <p className="text-[10px] text-amber-400 font-semibold">DISCOVERY</p>
              <h2 className="text-xl font-bold leading-snug">Your AI co-pilot for multi-chain grants.</h2>
              <p className="text-xs text-gray-400 mt-1">
                Filter, compare and prep funding paths across ecosystems.
              </p>
            </section>
            <section className="bg-black/30 border border-white/10 p-4 rounded-2xl space-y-3">
              <div className="flex items-center gap-1 text-[11px] text-gray-400">
                <Filter className="h-3 w-3" />
                <span>Discovery controls</span>
              </div>
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-gray-500 pointer-events-none" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by grant, chain, category or narrative..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-8 pr-3 text-xs placeholder:text-gray-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <select
                  value={chainFilter}
                  onChange={(e) => setChainFilter(e.target.value)}
                  className="rounded-xl bg-black text-white border border-white/10 px-2 py-2"
                >
                  {chainOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="rounded-xl bg-black text-white border border-white/10 px-2 py-2"
                >
                  {categoryOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl bg-black text-white border border-white/10 px-2 py-2"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </section>
          </div>

          {/* GRID LAYOUT */}
          <div className="grid lg:grid-cols-[1.1fr_1.4fr_1.1fr] gap-6 mt-0 items-start">
            {/* LEFT COLUMN – scrollable list */}
            <section className="self-start lg:-mt-40 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 p-4 flex flex-col overflow-hidden shadow-lg shadow-black/20">
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-4 relative after:content-[''] after:absolute after:top-0 after:left-0 after:right-0 after:h-3 after:bg-gradient-to-b after:from-black/30 after:to-transparent after:pointer-events-none after:opacity-0 hover:after:opacity-100 after:transition-all after:duration-300">
                {filtered.map((g) => (
                  <button
                    key={g.id}
                    ref={g.id === selectedId ? activeItemRef : null}
                    onClick={() => {
                      setSelectedId(g.id);
                      if (typeof window !== "undefined" && window.innerWidth < 1024) {
                        setDetailOpen(true);
                      }
                    }}
                    className={`w-full text-left rounded-xl border px-4 py-4 transform transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-[2px] hover:shadow-xl hover:shadow-black/40 flex flex-col gap-2 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 ${
                      g.id === selectedId
                        ? "border-amber-400/70 shadow-[0_0_8px_rgba(251,191,36,0.4)] bg-white/10"
                        : "border-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-base truncate">{g.title}</p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] ${
                          statusColors[g.status] || ""
                        }`}
                      >
                        {g.status}
                      </span>
                    </div>
                    <p className="text-[12px] text-gray-200 font-semibold">
                      {g.chain} · {g.category}
                    </p>
                    <p className="text-[12px] text-gray-300 font-medium line-clamp-2">
                      {g.summary}
                    </p>
                  </button>
                ))}
                {filtered.length === 0 && (
                  <p className="text-[11px] text-gray-500 mt-4">
                    No grants match this combination yet. Try loosening a filter.
                  </p>
                )}
              </div>
            </section>

            {/* MIDDLE PANEL – sticky details (desktop only) */}
            <section className="hidden lg:flex sticky top-0 self-start rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-5 flex-col shadow-xl shadow-black/50 hover:shadow-2xl hover:shadow-black/60 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]">
              <DetailContent />
            </section>

            {/* RIGHT PANEL – sticky agent (desktop) */}
            <section className="hidden lg:flex sticky top-0 self-start rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-5 flex-col shadow-xl shadow-black/50">
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-amber-300 mb-0.5">
                    AI Grants Agent
                  </p>
                  <p className="text-[11px] text-gray-400">
                    Turn this shortlist into tailored applications.
                  </p>
                </div>
                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-[10px] text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live
                </div>
              </div>
              <AgentContent />
            </section>
          </div>
        </main>

        {/* MOBILE DETAIL DRAWER */}
        {detailOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex items-end bg-black/60">
            <div className="w-full bg-[#050b1a] rounded-t-2xl border-t border-white/10 p-4 max-h-[85vh] overflow-y-auto shadow-2xl shadow-black/60">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold truncate pr-4">
                  {selected.title}
                </h2>
                <button
                  onClick={() => setDetailOpen(false)}
                  className="rounded-full border border-white/20 px-3 py-1 text-[11px] text-gray-200"
                >
                  Close
                </button>
              </div>
              <DetailContent />
            </div>
          </div>
        )}

        {/* MOBILE FLOATING CHAT BUBBLE */}
        <button
          onClick={() => setAgentOpen(true)}
          className="lg:hidden fixed bottom-4 right-4 z-40 rounded-full bg-amber-400 px-6 py-2 shadow-lg shadow-amber-500/40 flex items-center gap-2 text-sm font-semibold text-black"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Grants Agent
        </button>

        {/* MOBILE AGENT DRAWER */}
        {agentOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex items-end bg-black/60">
            <div className="w-full bg-[#050b1a] rounded-t-2xl border-t border-white/10 p-4 max-h-[80vh] flex flex-col gap-3 shadow-2xl shadow-black/60">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-amber-300">
                    AI Grants Agent
                  </p>
                  <p className="text-xs text-gray-400">
                    Context-aware drafts for {selected.chain} grants.
                  </p>
                </div>
                <button
                  onClick={() => setAgentOpen(false)}
                  className="rounded-full border border-white/20 px-2 py-1 text-[11px] text-gray-200"
                >
                  Close
                </button>
              </div>
              <AgentContent />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
