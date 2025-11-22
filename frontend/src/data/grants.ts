export type GrantStatus = "Open" | "Upcoming" | "Closed";

export interface Grant {
  id: number;
  chain: string;
  category: string;
  title: string;
  tag: string;
  amount: string;
  status: GrantStatus;
  deadline: string;
  summary: string;
  focus: string;
  link: string;
  source_url?: string;
  fit_score?: string | null;
  fit_description?: string | null;
  time_to_apply?: string | null;
  time_to_apply_description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export const statusColors: Record<GrantStatus, string> = {
  Open: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  Upcoming: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  Closed: "bg-gray-500/20 text-gray-400 border border-gray-500/30",
};
