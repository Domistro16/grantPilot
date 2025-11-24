import React, { useState, useEffect, useRef } from "react";
import { Search, Filter, Sparkles } from "lucide-react";
import { grantsApi } from "./api/grants";
import { Grant } from "./data/grants";
import { AgentChat } from "./components/AgentChat";
import { ConnectWallet } from "./components/ConnectWallet";

const statusColors: Record<string, string> = {
  Open: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40",
  Upcoming: "bg-amber-500/10 text-amber-300 border border-amber-500/40",
  Closed: "bg-rose-500/10 text-rose-300 border border-rose-500/40",
};

interface Chain {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

export default function GrantPilotDashboard() {
  // Core data state
  const [grants, setGrants] = useState<Grant[]>([]);
  const [chains, setChains] = useState<Chain[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // UI state
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [agentOpen, setAgentOpen] = useState(false);
  const [chainFilter, setChainFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [subscribedGrants, setSubscribedGrants] = useState<Set<number>>(new Set());
  const [detailOpen, setDetailOpen] = useState(false);

  // Subscription modal state
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false);
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState<{
    type: 'idle' | 'success' | 'error';
    message: string;
  }>({ type: 'idle', message: '' });

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribing, setSubscribing] = useState(false);

  const activeItemRef = useRef<HTMLButtonElement | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const statusOptions = ["All", "Open", "Upcoming", "Closed"];

  // Debounced search (300ms delay)
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [query]);

  // Fetch chains and categories on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const apiBase =
          ((import.meta as any).env && (import.meta as any).env.VITE_API_URL) ||
          "http://localhost:3001/api";

        const [chainsData, categoriesData] = await Promise.all([
          grantsApi.getAll().then(() =>
            fetch(`${apiBase}/chains`).then(res => res.json())
          ),
          fetch(`${apiBase}/categories`).then(res => res.json())
        ]);
        setChains(chainsData);
        setCategories(categoriesData);
      } catch (err) {
        console.error("Error fetching metadata:", err);
        // Continue anyway, filters will just show "All"
      }
    };

    fetchMetadata();
  }, []);

  // Fetch grants whenever filters change
  useEffect(() => {
    const fetchGrants = async () => {
      try {
        setLoading(true);
        setError(null);

        const filters: any = {};
        if (chainFilter !== "All") filters.chain = chainFilter;
        if (categoryFilter !== "All") filters.category = categoryFilter;
        if (statusFilter !== "All") filters.status = statusFilter;
        if (debouncedQuery.trim()) filters.search = debouncedQuery.trim();

        const data = await grantsApi.getAll(filters);
        setGrants(data);

        // If current selected grant is not in results, select the first one
        if (data.length > 0) {
          const stillExists = data.find(g => g.id === selectedId);
          if (!stillExists) {
            setSelectedId(data[0].id);
          } else if (selectedId === null) {
            setSelectedId(data[0].id);
          }
        } else {
          setSelectedId(null);
        }
      } catch (err) {
        console.error("Error fetching grants:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load grants. Please check your connection and try again."
        );
        setGrants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGrants();
  }, [chainFilter, categoryFilter, statusFilter, debouncedQuery]);

  // Auto-scroll to selected item
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [selectedId]);

  // Get selected grant
  const selected = grants.find((g) => g.id === selectedId) || grants[0] || null;
  const isSubscribed = selected ? subscribedGrants.has(selected.id) : false;

  // Prepare filter options
  const chainOptions = ["All", ...chains.map(c => c.name)];
  const categoryOptions = ["All", ...categories.map(c => c.name)];

  // Handle subscription - open modal
  const handleSubscribe = () => {
    if (!selected) return;
    setSubscribeModalOpen(true);
    setSubscribeEmail("");
    setSubscribeStatus({ type: 'idle', message: '' });
  };

  // Submit subscription
  const submitSubscription = async () => {
    if (!selected) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(subscribeEmail)) {
      setSubscribeStatus({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    try {
      setSubscribing(true);
      setSubscribeStatus({ type: 'idle', message: '' });
      const result = await grantsApi.subscribe(subscribeEmail, selected.id);

      if (result.success) {
        setSubscribedGrants(prev => new Set(prev).add(selected.id));
        setSubscribeStatus({
          type: 'success',
          message: `Success! You're subscribed to updates for "${selected.title}"`
        });
        // Close modal after 2 seconds
        setTimeout(() => {
          setSubscribeModalOpen(false);
        }, 2000);
      } else {
        setSubscribedGrants(prev => new Set(prev).add(selected.id));
        setSubscribeStatus({
          type: 'success',
          message: result.message || 'Subscription successful!'
        });
        setTimeout(() => {
          setSubscribeModalOpen(false);
        }, 2000);
      }
    } catch (err) {
      console.error("Subscription error:", err);
      setSubscribeStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to subscribe. Please try again.'
      });
    } finally {
      setSubscribing(false);
    }
  };


  const DetailContent: React.FC = () => {
    if (!selected) {
      return (
        <div className="text-center py-8 text-gray-400 text-sm">
          No grant selected
        </div>
      );
    }

    return (
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

          {(selected.fit_score || selected.time_to_apply) && (
            <div className="grid sm:grid-cols-2 gap-3 mt-2">
              {selected.fit_score && (
                <div className="rounded-xl border border-white/10 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-3">
                  <p className="text-[11px] uppercase tracking-wide text-emerald-300 mb-1">Fit</p>
                  <p className="text-sm font-semibold">{selected.fit_score}</p>
                  {selected.fit_description && (
                    <p className="text-[11px] text-gray-400">
                      {selected.fit_description}
                    </p>
                  )}
                </div>
              )}
              {selected.time_to_apply && (
                <div className="rounded-xl border border-white/10 bg-gradient-to-br from-sky-500/10 via-sky-500/5 to-transparent p-3">
                  <p className="text-[11px] uppercase tracking-wide text-sky-300 mb-1">Time to apply</p>
                  <p className="text-sm font-semibold">{selected.time_to_apply}</p>
                  {selected.time_to_apply_description && (
                    <p className="text-[11px] text-gray-400">
                      {selected.time_to_apply_description}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <button
            onClick={handleSubscribe}
            disabled={subscribing}
            className={`w-full px-3 py-2 rounded-xl text-black text-xs font-semibold transition flex items-center justify-center gap-2 shadow-md ${
              isSubscribed
                ? "bg-emerald-500 hover:bg-emerald-400"
                : subscribing
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-amber-400 hover:bg-amber-300"
            }`}
          >
            {subscribing ? (
              <>Subscribing...</>
            ) : isSubscribed ? (
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
            target="_blank"
            rel="noopener noreferrer"
            className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/10 text-xs hover:bg-white/20 transition text-center"
          >
            Open grant page
          </a>
          <button
            onClick={() => {
              setDetailOpen(false);
              setAgentOpen(true);
            }}
            className="w-full flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-[11px] font-medium shadow-[0_0_12px_rgba(16,185,129,0.35)] text-center transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-[0_0_18px_rgba(16,185,129,0.55)]"
          >
            <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Let GrantPilot draft my first response
          </button>
        </div>
      </>
    );
  };

  // Loading state
  if (loading && grants.length === 0) {
    return (
      <div className="min-h-screen w-full bg-[#050816] text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mb-4"></div>
          <p className="text-sm text-gray-400">Loading grants from Web3 ecosystems...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && grants.length === 0) {
    return (
      <div className="min-h-screen w-full bg-[#050816] text-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-center">
          <div className="text-rose-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Unable to Load Grants</h2>
          <p className="text-sm text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-amber-400 text-black rounded-xl text-sm font-semibold hover:bg-amber-300 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
            <ConnectWallet />
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
                <span className="hidden sm:inline text-[10px] text-emerald-300">
                  {loading ? "Updating..." : `${grants.length} grants loaded`}
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
              <div className="mt-4">
                <ConnectWallet />
              </div>
            </section>
            <section className="bg-black/30 border border-white/10 p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-[11px] text-gray-400">
                <div className="flex items-center gap-1">
                  <Filter className="h-3 w-3" />
                  <span>Discovery controls</span>
                </div>
                <span className="text-[10px] text-emerald-300">
                  {loading ? "..." : `${grants.length}`}
                </span>
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
                {loading && (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-amber-400"></div>
                  </div>
                )}
                {!loading && grants.map((g) => (
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
                {!loading && grants.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-[11px] text-gray-500 mb-2">
                      No grants match your filters.
                    </p>
                    <button
                      onClick={() => {
                        setChainFilter("All");
                        setCategoryFilter("All");
                        setStatusFilter("All");
                        setQuery("");
                      }}
                      className="text-[11px] text-amber-400 hover:text-amber-300 underline"
                    >
                      Reset filters
                    </button>
                  </div>
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
              <AgentChat grant={selected} />
            </section>
          </div>
        </main>

        {/* MOBILE DETAIL DRAWER */}
        {detailOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex items-end bg-black/60">
            <div className="w-full bg-[#050b1a] rounded-t-2xl border-t border-white/10 p-4 max-h-[85vh] overflow-y-auto shadow-2xl shadow-black/60">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold truncate pr-4">
                  {selected?.title || "Grant Details"}
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
                    Context-aware drafts for {selected?.chain || "your"} grants.
                  </p>
                </div>
                <button
                  onClick={() => setAgentOpen(false)}
                  className="rounded-full border border-white/20 px-2 py-1 text-[11px] text-gray-200"
                >
                  Close
                </button>
              </div>
              <AgentChat grant={selected} />
            </div>
          </div>
        )}

        {/* SUBSCRIPTION MODAL */}
        {subscribeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-gradient-to-br from-[#0a1628] to-[#050b1a] rounded-2xl border border-white/10 shadow-2xl max-w-md w-full p-6">
              {/* Header */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-1">
                  Subscribe to Grant Updates
                </h3>
                <p className="text-sm text-gray-400">
                  Get notified about deadlines and status changes for{" "}
                  <span className="text-amber-400 font-medium">{selected?.title}</span>
                </p>
              </div>

              {/* Email Input */}
              <div className="mb-4">
                <label htmlFor="subscribe-email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  id="subscribe-email"
                  type="email"
                  value={subscribeEmail}
                  onChange={(e) => setSubscribeEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !subscribing) {
                      submitSubscription();
                    }
                  }}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  disabled={subscribing || subscribeStatus.type === 'success'}
                  autoFocus
                />
              </div>

              {/* Status Messages */}
              {subscribeStatus.type === 'error' && (
                <div className="mb-4 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2.5">
                  <p className="text-sm text-rose-300">{subscribeStatus.message}</p>
                </div>
              )}

              {subscribeStatus.type === 'success' && (
                <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-2.5">
                  <p className="text-sm text-emerald-300">{subscribeStatus.message}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setSubscribeModalOpen(false)}
                  disabled={subscribing}
                  className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-300 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={submitSubscription}
                  disabled={subscribing || !subscribeEmail || subscribeStatus.type === 'success'}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20"
                >
                  {subscribing ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Subscribing...
                    </span>
                  ) : subscribeStatus.type === 'success' ? (
                    'Subscribed ✓'
                  ) : (
                    'Subscribe'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
