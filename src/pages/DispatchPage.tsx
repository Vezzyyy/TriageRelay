import React, { useState } from "react";
import {
  CheckCircle,
  Flag,
  ExternalLink,
  MapPin,
  Trash2,
  ArrowUpRight
} from "lucide-react";
import { runCloudCommandSynthesis } from "../services/hybridAi";
import type { TriageReport, ClusteredIncident, HazardType } from "../types/triage";

interface DispatchPageProps {
  reports: TriageReport[];
  onToggleVerifyReport: (reportId: string) => void;
  onClearDatabase: () => void;
}

export const DispatchPage: React.FC<DispatchPageProps> = ({
  reports,
  onToggleVerifyReport,
  onClearDatabase
}) => {
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [clusters, setClusters] = useState<ClusteredIncident[]>([]);
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");

  const handleRunSynthesis = async () => {
    if (reports.length === 0) return;
    setIsSynthesizing(true);

    try {
      const generatedClusters = await runCloudCommandSynthesis(reports);
      setClusters(generatedClusters);
    } catch (err) {
      console.error("Failed to generate briefing:", err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const formatHazardLabel = (hazard: HazardType) =>
    hazard
      .toLowerCase()
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const filteredReports = reports.filter((r) => {
    if (filterSeverity === "ALL") return true;
    return r.severity === filterSeverity;
  });

  const verifiedCount = reports.filter((r) => r.verified_by_coordinator).length;

  return (
    <div className="max-w-[1360px] mx-auto px-[21px] py-[21px] space-y-[21px]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-[13px] pb-[13px] border-b border-[#E0E0DA]">
        <h1 className="text-[21px] tracking-[-0.02em] font-medium text-[#141517]">
          Dispatch Center
        </h1>

        <div className="flex items-center gap-[8px]">
          <span className="text-[12px] font-mono text-[#868991]">Priority</span>
          <div className="flex items-center bg-[#ECECE7] p-[3px] rounded-[8px] border border-[#E0E0DA]/70">
            {["ALL", "CRITICAL", "URGENT", "STABLE"].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`cursor-pointer px-[13px] py-[5px] rounded-[5px] text-[12px] font-mono transition-all ${
                  filterSeverity === sev
                    ? "bg-white text-[#141517] font-medium shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                    : "text-[#54575F] hover:text-[#141517]"
                }`}
              >
                {sev === "ALL" ? "All" : sev.charAt(0) + sev.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Golden Ratio Spiral Grid: 1.618fr (8) Incoming Feed | 1fr (5->3->2->1) Briefing & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.618fr_1fr] gap-[21px] items-start">
        {/* SPIRAL BLOCK 8: Incoming Reports */}
        <section className="space-y-[13px]">
          <div className="flex items-center justify-between text-[12px] font-mono text-[#54575F]">
            <span>Incoming Reports</span>
            <span className="tabular-nums">{filteredReports.length} of {reports.length}</span>
          </div>

          {filteredReports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[13px]">
              {filteredReports.map((report) => (
                <article
                  key={report.report_id}
                  className={`bg-white border rounded-[13px] p-[13px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col justify-between gap-[13px] transition-colors ${
                    report.verified_by_coordinator
                      ? "border-[#186847]/50"
                      : "border-[#E0E0DA] hover:border-[#C9C9C0]"
                  }`}
                >
                  <div className="space-y-[8px]">
                    <div className="flex items-start justify-between gap-[8px]">
                      <span className="text-[14px] font-medium text-[#141517]">
                        {formatHazardLabel(report.hazard_type)}
                      </span>
                      <span
                        className={`px-[8px] py-[2px] rounded-[3px] text-[10px] font-mono font-semibold ${
                          report.severity === "CRITICAL"
                            ? "bg-[#FDF2F0] text-[#C9331B] border border-[#F2C6BE]"
                            : report.severity === "URGENT"
                            ? "bg-[#FEF3C7] text-[#B4690E] border border-[#F5D688]"
                            : "bg-[#ECFDF5] text-[#186847] border border-[#BCE5D2]"
                        }`}
                      >
                        {report.severity}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-[#868991] tabular-nums">
                      <span>{report.sector_hint}</span>
                      <span>{new Date(report.created_offline_at).toLocaleTimeString()}</span>
                    </div>

                    <div className="rounded-[8px] bg-[#F5F5F2] border border-[#E0E0DA] p-[13px]">
                      <p className="text-[12px] text-[#141517] leading-relaxed break-words">
                        {report.scrubbed_summary}
                      </p>
                    </div>
                  </div>

                  <div className="pt-[8px] border-t border-[#E0E0DA] flex items-center justify-between text-[11px] font-mono">
                    <span
                      className={`px-[8px] py-[2px] rounded-[3px] ${
                        report.sync_status === "SYNCED"
                          ? "bg-[#ECFDF5] text-[#186847]"
                          : "bg-[#FEF3C7] text-[#B4690E]"
                      }`}
                    >
                      {report.sync_status === "SYNCED" ? "Synced" : "Queued"}
                    </span>

                    <button
                      onClick={() => onToggleVerifyReport(report.report_id)}
                      className={`cursor-pointer px-[8px] py-[5px] rounded-[5px] border transition-colors flex items-center gap-[5px] ${
                        report.verified_by_coordinator
                          ? "bg-[#ECFDF5] border-[#BCE5D2] text-[#186847] font-medium"
                          : "bg-white border-[#E0E0DA] text-[#54575F] hover:border-[#C9C9C0] hover:text-[#141517]"
                      }`}
                    >
                      {report.verified_by_coordinator ? (
                        <>
                          <CheckCircle className="w-[12px] h-[12px]" />
                          <span>Verified</span>
                        </>
                      ) : (
                        <>
                          <Flag className="w-[12px] h-[12px]" />
                          <span>Verify</span>
                        </>
                      )}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-[#E0E0DA] rounded-[13px] p-[34px] text-center">
              <p className="text-[13px] text-[#54575F]">
                No reports received yet.
              </p>
            </div>
          )}
        </section>

        {/* SPIRAL BLOCK 5 -> 3 -> 2 -> 1: Situational Briefing & Controls */}
        <aside className="space-y-[13px]">
          <div className="bg-white border border-[#E0E0DA] rounded-[13px] p-[21px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-[13px]">
            <h2 className="text-[15px] font-medium text-[#141517]">
              Situational Briefing
            </h2>

            <button
              onClick={handleRunSynthesis}
              disabled={isSynthesizing || reports.length === 0}
              className="cursor-pointer disabled:cursor-not-allowed w-full px-[21px] py-[13px] rounded-[8px] bg-[#254EDB] hover:bg-[#1D3FB3] disabled:bg-[#E0E0DA] disabled:text-[#868991] text-white font-medium text-[13px] transition-colors flex items-center justify-center gap-[8px]"
            >
              {isSynthesizing ? (
                <>
                  <span className="w-[13px] h-[13px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Correlating…</span>
                </>
              ) : (
                <>
                  <span>Generate Briefing</span>
                  <ArrowUpRight className="w-[15px] h-[15px]" />
                </>
              )}
            </button>
          </div>

          {clusters.length > 0 && (
            <div className="space-y-[13px]">
              <div className="flex items-center justify-between text-[12px] font-mono text-[#54575F]">
                <span>Incident Clusters</span>
                <span className="tabular-nums">{clusters.length}</span>
              </div>

              {clusters.map((cluster) => (
                <div
                  key={cluster.cluster_id}
                  className="bg-white border border-[#E0E0DA] rounded-[13px] p-[13px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-[8px]"
                >
                  <div className="flex items-start justify-between gap-[8px]">
                    <span className="text-[13px] font-medium text-[#141517]">
                      {formatHazardLabel(cluster.hazard_type)}
                    </span>
                    <span
                      className={`px-[8px] py-[2px] rounded-[3px] text-[10px] font-mono font-semibold ${
                        cluster.severity === "CRITICAL"
                          ? "bg-[#FDF2F0] text-[#C9331B]"
                          : "bg-[#FEF3C7] text-[#B4690E]"
                      }`}
                    >
                      {cluster.severity}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-[#54575F]">
                    <span className="flex items-center gap-[5px]">
                      <MapPin className="w-[11px] h-[11px] text-[#868991]" />
                      {cluster.sector}
                    </span>
                    <span className="tabular-nums">
                      {cluster.corroborating_reports.length} reports · {cluster.total_people_affected} affected
                    </span>
                  </div>

                  <p className="text-[12px] text-[#141517] leading-relaxed">
                    {cluster.synthetic_briefing}
                  </p>

                  <div className="rounded-[8px] bg-[#F5F5F2] border border-[#E0E0DA] p-[13px]">
                    <p className="text-[11px] text-[#54575F] leading-relaxed">
                      {cluster.grounded_context}
                    </p>
                  </div>

                  {cluster.citations && cluster.citations.length > 0 && (
                    <div className="pt-[8px] border-t border-[#E0E0DA] flex items-center justify-between gap-[13px] text-[11px] font-mono">
                      <span className="text-[#868991] truncate min-w-0">
                        {cluster.citations[0].title}
                      </span>
                      <a
                        href={cluster.citations[0].uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#254EDB] hover:underline flex items-center gap-[3px] shrink-0"
                      >
                        <span>Reference</span>
                        <ExternalLink className="w-[11px] h-[11px]" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* SPIRAL CELLS 2 & 1 */}
          <div className="grid grid-cols-[1.618fr_1fr] gap-[8px]">
            <div className="bg-[#ECECE7] border border-[#E0E0DA] rounded-[8px] p-[13px] text-[11px] font-mono text-[#54575F] flex flex-col justify-between">
              <span className="text-[#868991]">Verified</span>
              <span className="text-[#141517] tabular-nums">{verifiedCount} of {reports.length}</span>
            </div>

            <button
              onClick={() => {
                if (window.confirm("Clear all incident reports?")) {
                  onClearDatabase();
                  setClusters([]);
                }
              }}
              disabled={reports.length === 0 && clusters.length === 0}
              className="cursor-pointer disabled:cursor-not-allowed bg-white border border-[#E0E0DA] hover:border-[#C9331B] hover:text-[#C9331B] disabled:opacity-40 disabled:hover:border-[#E0E0DA] disabled:hover:text-[#54575F] text-[#54575F] rounded-[8px] p-[13px] text-[11px] font-mono transition-colors flex flex-col items-start justify-between text-left"
            >
              <Trash2 className="w-[13px] h-[13px]" />
              <span>Clear All</span>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
