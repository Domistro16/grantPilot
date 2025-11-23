import React, { useState, useEffect } from "react";
import { Grant, statusColors } from "../data/grants";
import { grantsApi } from "../api/grants";
import { scraperApi, ScrapeResult, GrantSource } from "../api/scraper";

const AdminDashboard: React.FC = () => {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Grant | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Scraper state
  const [scraping, setScraping] = useState(false);
  const [scrapeResult, setScrapeResult] = useState<ScrapeResult | null>(null);
  const [sources, setSources] = useState<GrantSource[]>([]);
  const [showSources, setShowSources] = useState(false);

  // Fetch grants on mount
  useEffect(() => {
    loadGrants();
    loadSources();
  }, []);

  const loadGrants = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await grantsApi.getAll();
      setGrants(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load grants");
      console.error("Error loading grants:", err);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (grant: Grant) => {
    setEditing(grant);
    setIsNew(false);
    setModalOpen(true);
  };

  const openNew = () => {
    setEditing({
      id: 0, // Will be assigned by backend
      chain: "",
      category: "",
      title: "",
      tag: "",
      amount: "",
      status: "Open",
      deadline: "",
      summary: "",
      focus: "",
      link: "",
      source_url: "",
    });
    setIsNew(true);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setIsNew(false);
    setSaving(false);
  };

  const saveGrant = async () => {
    if (!editing) return;

    try {
      setSaving(true);
      setError(null);

      // Prepare data
      const grantData = {
        chain: editing.chain,
        category: editing.category,
        title: editing.title,
        tag: editing.tag,
        amount: editing.amount,
        status: editing.status,
        deadline: editing.deadline,
        summary: editing.summary,
        focus: editing.focus,
        link: editing.link,
        source_url: editing.source_url || editing.link,
      };

      if (isNew) {
        // Create new grant
        await grantsApi.create(grantData);
      } else {
        // Update existing grant
        await grantsApi.update(editing.id, grantData);
      }

      // Reload grants
      await loadGrants();
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save grant");
      console.error("Error saving grant:", err);
    } finally {
      setSaving(false);
    }
  };

  const deleteGrant = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this grant?")) return;

    try {
      setError(null);
      await grantsApi.delete(id);
      await loadGrants();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete grant");
      console.error("Error deleting grant:", err);
    }
  };

  const handleFieldChange = (field: keyof Grant, value: string) => {
    setEditing((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === grants.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(grants.map(g => g.id)));
    }
  };

  const toggleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Bulk actions
  const bulkDelete = async () => {
    if (selectedIds.size === 0) return;

    const count = selectedIds.size;
    if (!window.confirm(`Are you sure you want to delete ${count} grant(s)?`)) return;

    try {
      setError(null);
      // Delete each selected grant
      await Promise.all(
        Array.from(selectedIds).map(id => grantsApi.delete(id))
      );
      await loadGrants();
      setSelectedIds(new Set());
      setShowBulkActions(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete grants");
      console.error("Error deleting grants:", err);
    }
  };

  const bulkUpdateStatus = async (status: "Open" | "Upcoming" | "Closed") => {
    if (selectedIds.size === 0) return;

    try {
      setError(null);
      // Update status for each selected grant
      await Promise.all(
        Array.from(selectedIds).map(id =>
          grantsApi.update(id, { status })
        )
      );
      await loadGrants();
      setSelectedIds(new Set());
      setShowBulkActions(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update grant status");
      console.error("Error updating grants:", err);
    }
  };

  // Scraper functions
  const loadSources = async () => {
    try {
      const data = await scraperApi.getSources();
      setSources(data);
    } catch (err) {
      console.error("Error loading sources:", err);
    }
  };

  const runScraper = async () => {
    try {
      setScraping(true);
      setError(null);
      setScrapeResult(null);
      const result = await scraperApi.runScraper();
      setScrapeResult(result);
      // Reload grants to show new data
      await loadGrants();
      await loadSources();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run scraper");
      console.error("Error running scraper:", err);
    } finally {
      setScraping(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#050816] text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400 mb-4"></div>
          <p className="text-sm text-gray-400">Loading grants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#050816] text-gray-100">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-8 py-6 flex flex-col gap-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-amber-400 font-semibold uppercase tracking-wide">Admin</p>
            <h1 className="text-2xl font-semibold">GrantPilot Admin Dashboard</h1>
            <p className="text-xs text-gray-400 mt-1">
              Manage grant programs from your Web3 Grants Aggregator backend.
            </p>
          </div>
          <button
            onClick={openNew}
            className="px-4 py-2 rounded-xl bg-amber-400 text-black text-xs font-semibold hover:bg-amber-300 shadow-md"
          >
            + Add new grant
          </button>
        </header>

        {error && (
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-4">
            <p className="text-xs text-rose-300">
              <span className="font-semibold">Error:</span> {error}
            </p>
            <button
              onClick={() => setError(null)}
              className="text-[10px] text-rose-200 hover:text-rose-100 mt-2 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Scraper Control Panel */}
        <section className="rounded-2xl bg-black/40 border border-white/10 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wide">Web Scraper</p>
              <h2 className="text-sm font-semibold text-gray-100">Grant Data Collection</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Scrape {sources.filter(s => s.is_active).length} active grant sources from blockchain ecosystems
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSources(!showSources)}
                className="px-3 py-1.5 rounded-lg border border-white/20 text-[11px] text-gray-100 hover:bg-white/10"
              >
                {showSources ? 'Hide' : 'View'} Sources
              </button>
              <button
                onClick={runScraper}
                disabled={scraping}
                className={`px-4 py-1.5 rounded-lg text-[11px] font-semibold ${
                  scraping
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    : 'bg-emerald-500 text-black hover:bg-emerald-400'
                } shadow-md`}
              >
                {scraping ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-black"></span>
                    Scraping...
                  </span>
                ) : (
                  '🔄 Run Scraper'
                )}
              </button>
            </div>
          </div>

          {/* Scrape Result */}
          {scrapeResult && (
            <div className="mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3">
              <p className="text-[11px] font-semibold text-emerald-300 mb-2">✓ Scrape completed</p>
              <div className="grid grid-cols-3 gap-3 text-[11px]">
                <div>
                  <p className="text-gray-400">Sources Scraped</p>
                  <p className="text-sm font-semibold text-gray-100">{scrapeResult.sources_scraped}</p>
                </div>
                <div>
                  <p className="text-gray-400">Grants Added</p>
                  <p className="text-sm font-semibold text-emerald-300">{scrapeResult.grants_added}</p>
                </div>
                <div>
                  <p className="text-gray-400">Grants Updated</p>
                  <p className="text-sm font-semibold text-amber-300">{scrapeResult.grants_updated}</p>
                </div>
              </div>
              {scrapeResult.errors.length > 0 && (
                <details className="mt-3">
                  <summary className="text-[10px] text-rose-300 cursor-pointer hover:text-rose-200">
                    {scrapeResult.errors.length} error(s) occurred - click to view
                  </summary>
                  <ul className="mt-2 space-y-1 text-[10px] text-rose-200 max-h-32 overflow-y-auto">
                    {scrapeResult.errors.map((err, i) => (
                      <li key={i} className="pl-2 border-l border-rose-500/30">
                        {err}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}

          {/* Grant Sources Table */}
          {showSources && (
            <div className="rounded-xl bg-white/5 border border-white/10 p-3 overflow-x-auto">
              <p className="text-[11px] font-semibold text-gray-300 mb-2">Grant Sources ({sources.length})</p>
              <table className="w-full text-left text-[11px]">
                <thead className="text-[10px] uppercase tracking-wide text-gray-400 border-b border-white/10">
                  <tr>
                    <th className="py-2 pr-3">Source</th>
                    <th className="py-2 pr-3">Chain</th>
                    <th className="py-2 pr-3">Strategy</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Last Scraped</th>
                    <th className="py-2 pr-3">Failures</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {sources.map((source) => (
                    <tr key={source.id} className="border-b border-white/5 last:border-none">
                      <td className="py-2 pr-3 font-medium text-gray-100 max-w-[180px] truncate">
                        {source.name}
                      </td>
                      <td className="py-2 pr-3 text-gray-300">{source.chain_name}</td>
                      <td className="py-2 pr-3">
                        <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-gray-300">
                          {source.scrape_strategy}
                        </span>
                      </td>
                      <td className="py-2 pr-3">
                        {source.is_active ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 text-[10px]">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-gray-500/10 text-gray-400 text-[10px]">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-2 pr-3 text-gray-400">
                        {source.last_scraped_at
                          ? new Date(source.last_scraped_at).toLocaleString()
                          : 'Never'}
                      </td>
                      <td className="py-2 pr-3">
                        {source.consecutive_failures > 0 ? (
                          <span className="text-rose-300">{source.consecutive_failures}</span>
                        ) : (
                          <span className="text-gray-500">0</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-black/40 border border-white/10 p-4 overflow-x-auto">
          {/* Bulk Actions Bar */}
          {selectedIds.size > 0 && (
            <div className="mb-4 rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <p className="text-[11px] font-semibold text-amber-300">
                  {selectedIds.size} grant{selectedIds.size !== 1 ? 's' : ''} selected
                </p>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="text-[10px] text-amber-200 hover:text-amber-100 underline"
                >
                  Clear selection
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="px-3 py-1.5 rounded-lg border border-white/20 text-[11px] text-gray-100 hover:bg-white/10"
                >
                  {showBulkActions ? 'Hide' : 'Show'} Actions
                </button>
              </div>
            </div>
          )}

          {/* Bulk Actions Menu */}
          {selectedIds.size > 0 && showBulkActions && (
            <div className="mb-4 rounded-xl bg-white/5 border border-white/10 p-3">
              <p className="text-[11px] font-semibold text-gray-300 mb-2">Bulk Actions</p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => bulkUpdateStatus("Open")}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-[11px] hover:bg-emerald-500/20"
                >
                  Mark as Open
                </button>
                <button
                  onClick={() => bulkUpdateStatus("Upcoming")}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/40 text-amber-300 text-[11px] hover:bg-amber-500/20"
                >
                  Mark as Upcoming
                </button>
                <button
                  onClick={() => bulkUpdateStatus("Closed")}
                  className="px-3 py-1.5 rounded-lg bg-gray-500/10 border border-gray-500/40 text-gray-300 text-[11px] hover:bg-gray-500/20"
                >
                  Mark as Closed
                </button>
                <div className="ml-auto">
                  <button
                    onClick={bulkDelete}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/60 text-rose-200 text-[11px] hover:bg-rose-500/20"
                  >
                    Delete Selected
                  </button>
                </div>
              </div>
            </div>
          )}

          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase tracking-wide text-gray-400 border-b border-white/10">
              <tr>
                <th className="py-2 pr-3 w-10">
                  <input
                    type="checkbox"
                    checked={grants.length > 0 && selectedIds.size === grants.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-white/20 bg-black/40 text-amber-400 focus:ring-amber-400 focus:ring-offset-0 cursor-pointer"
                  />
                </th>
                <th className="py-2 pr-3">Title</th>
                <th className="py-2 pr-3">Chain</th>
                <th className="py-2 pr-3">Category</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Amount</th>
                <th className="py-2 pr-3">Deadline</th>
                <th className="py-2 pr-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="align-top">
              {grants.map((g) => (
                <tr
                  key={g.id}
                  className={`border-b border-white/5 last:border-none transition-colors ${
                    selectedIds.has(g.id) ? 'bg-amber-500/5' : ''
                  }`}
                >
                  <td className="py-2 pr-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(g.id)}
                      onChange={() => toggleSelect(g.id)}
                      className="w-4 h-4 rounded border-white/20 bg-black/40 text-amber-400 focus:ring-amber-400 focus:ring-offset-0 cursor-pointer"
                    />
                  </td>
                  <td className="py-2 pr-3 font-medium text-gray-100 max-w-[220px] truncate">{g.title}</td>
                  <td className="py-2 pr-3 text-gray-300">{g.chain}</td>
                  <td className="py-2 pr-3 text-gray-300">{g.category}</td>
                  <td className="py-2 pr-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${statusColors[g.status] || ""}`}>
                      {g.status}
                    </span>
                  </td>
                  <td className="py-2 pr-3 text-[#FFB000] font-semibold">{g.amount}</td>
                  <td className="py-2 pr-3 text-gray-300">{g.deadline}</td>
                  <td className="py-2 pl-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => openEdit(g)}
                        className="px-2 py-1 rounded-lg border border-white/20 text-[11px] text-gray-100 hover:bg-white/10"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteGrant(g.id)}
                        className="px-2 py-1 rounded-lg border border-rose-500/60 text-[11px] text-rose-200 hover:bg-rose-500/10"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {grants.length === 0 && (
            <p className="text-[11px] text-gray-500 mt-4 text-center py-8">
              No grants yet. Click "+ Add new grant" to create the first one.
            </p>
          )}
        </section>

        <p className="text-[10px] text-gray-500">
          Connected to backend API at{" "}
          <span className="text-amber-400 font-mono">
            {import.meta.env.VITE_API_URL || "http://localhost:3001/api"}
          </span>
        </p>
      </div>

      {modalOpen && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-xl rounded-2xl bg-[#050816] border border-white/10 p-5 shadow-2xl shadow-black/60 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-amber-400">
                  {isNew ? "New grant" : "Edit grant"}
                </p>
                <h2 className="text-lg font-semibold">{editing?.title || "Untitled grant"}</h2>
              </div>
              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-full border border-white/20 px-3 py-1 text-[11px] text-gray-200 disabled:opacity-50"
              >
                Close
              </button>
            </div>

            {editing && (
              <>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block mb-1 text-gray-300">Title *</label>
                    <input
                      value={editing.title}
                      onChange={(e) => handleFieldChange("title", e.target.value)}
                      className="w-full rounded-xl bg-black/40 border border-white/15 px-3 py-2 outline-none text-xs"
                      placeholder="e.g., BNB Chain Builder Grants"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1 text-gray-300">Chain *</label>
                      <input
                        value={editing.chain}
                        onChange={(e) => handleFieldChange("chain", e.target.value)}
                        className="w-full rounded-xl bg-black/40 border border-white/15 px-3 py-2 outline-none text-xs"
                        placeholder="e.g., BNB Chain"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-gray-300">Category *</label>
                      <input
                        value={editing.category}
                        onChange={(e) => handleFieldChange("category", e.target.value)}
                        className="w-full rounded-xl bg-black/40 border border-white/15 px-3 py-2 outline-none text-xs"
                        placeholder="e.g., Infra, DeFi, Gaming"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1 text-gray-300">Status *</label>
                      <select
                        value={editing.status}
                        onChange={(e) => handleFieldChange("status", e.target.value)}
                        className="w-full rounded-xl bg-black/40 border border-white/15 px-3 py-2 outline-none text-xs"
                      >
                        <option>Open</option>
                        <option>Upcoming</option>
                        <option>Closed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1 text-gray-300">Amount *</label>
                      <input
                        value={editing.amount}
                        onChange={(e) => handleFieldChange("amount", e.target.value)}
                        className="w-full rounded-xl bg-black/40 border border-white/15 px-3 py-2 outline-none text-xs"
                        placeholder="e.g., Up to $150k"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1 text-gray-300">Deadline *</label>
                      <input
                        value={editing.deadline}
                        onChange={(e) => handleFieldChange("deadline", e.target.value)}
                        className="w-full rounded-xl bg-black/40 border border-white/15 px-3 py-2 outline-none text-xs"
                        placeholder="e.g., Dec 30, 2025 or Rolling"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-gray-300">Tag (short) *</label>
                      <input
                        value={editing.tag}
                        onChange={(e) => handleFieldChange("tag", e.target.value)}
                        className="w-full rounded-xl bg-black/40 border border-white/15 px-3 py-2 outline-none text-xs"
                        placeholder="e.g., Infra · DeFi · Tooling"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-300">Summary *</label>
                    <textarea
                      value={editing.summary}
                      onChange={(e) => handleFieldChange("summary", e.target.value)}
                      rows={3}
                      className="w-full rounded-xl bg-black/40 border border-white/15 px-3 py-2 outline-none text-xs"
                      placeholder="2-3 sentence summary of what the grant supports..."
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-300">Focus *</label>
                    <textarea
                      value={editing.focus}
                      onChange={(e) => handleFieldChange("focus", e.target.value)}
                      rows={3}
                      className="w-full rounded-xl bg-black/40 border border-white/15 px-3 py-2 outline-none text-xs"
                      placeholder="1-2 sentences on ideal applicant profile..."
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-300">Application Link *</label>
                    <input
                      value={editing.link}
                      onChange={(e) => handleFieldChange("link", e.target.value)}
                      className="w-full rounded-xl bg-black/40 border border-white/15 px-3 py-2 outline-none text-xs"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 text-xs">
                  <p className="text-[10px] text-gray-500 max-w-xs">
                    {isNew ? "Creating a new grant in the database." : "Updating grant in the database."}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={saveGrant}
                      disabled={saving}
                      className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-semibold hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={closeModal}
                      disabled={saving}
                      className="px-3 py-2 rounded-xl border border-white/20 text-gray-200 hover:bg-white/10 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
