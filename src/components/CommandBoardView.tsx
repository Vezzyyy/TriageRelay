import React, { useState } from "react";
import { 
  Server, 
  Sparkles, 
  CheckCircle, 
  Flag, 
  ExternalLink, 
  Users, 
  MapPin, 
  AlertOctagon, 
  ShieldCheck, 
  Filter,
  BookOpen,
  Trash2
} from "lucide-react";
import { runCloudCommandSynthesis } from "../services/hybridAi";
import type { TriageReport, ClusteredIncident } from "../types/triage";

interface CommandBoardViewProps {
  reports: TriageReport[];
  onToggleVerifyReport: (reportId: string) => void;
  onIncrementCloudCount: () => void;
  onClearDatabase: () => void;
}

export const CommandBoardView: React.FC<CommandBoardViewProps> = ({
  reports,
  onToggleVerifyReport,
  onIncrementCloudCount,
  onClearDatabase
}) => {
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [clusters, setClusters] = useState<ClusteredIncident[]>([]);
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");

  const handleRunSynthesis = async () => {
    if (reports.length === 0) return;
    setIsSynthesizing(true);

    try {
      // Invokes ONLY_IN_CLOUD via gemini-2.5-flash with Google Search Grounding
      const generatedClusters = await runCloudCommandSynthesis(reports);
      setClusters(generatedClusters);
      onIncrementCloudCount();
    } catch (err) {
      console.error("Cloud synthesis error:", err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const filteredReports = reports.filter(r => {
    if (filterSeverity === "ALL") return true;
    return r.severity === filterSeverity;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Tactical Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-mono font-bold text-white tracking-wide flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-400" />
              REGIONAL COMMAND TRIAGE BOARD
            </h1>
            <span className="text-xs font-mono bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded">
              CLOUD SYNTHESIS & GROUNDING
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Aggregating PII-scrubbed reports across distributed field responders. Cloud Gemini 2.5 Flash correlates multi-source incidents with live disaster context.
          </p>
        </div>

        {/* Synthesis & Reset CTAs */}
        <div className="flex items-center gap-2">
          {reports.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm("Purge all reports from local cache and Cloud Firestore?")) {
                  onClearDatabase();
                  setClusters([]);
                }
              }}
              className="px-3 py-2.5 rounded-lg bg-slate-800 hover:bg-rose-950 border border-slate-700 hover:border-rose-700 text-slate-300 hover:text-rose-300 font-mono text-xs uppercase tracking-wider transition-all flex items-center gap-1.5"
              title="Wipe database and start clean"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Reset DB
            </button>
          )}

          <button
            onClick={handleRunSynthesis}
            disabled={isSynthesizing || reports.length === 0}
            className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center gap-2 shrink-0"
          >
            {isSynthesizing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Correlating with Gemini 2.5 Flash...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-300" />
                Cluster Incidents & Run Grounded Briefing
              </>
            )}
          </button>
        </div>
      </div>

      {/* Synthesis Clusters Section (If Available) */}
      {clusters.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-mono font-bold text-slate-200 uppercase flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              Corroborated Regional Incidents ({clusters.length})
            </h2>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800 px-2 py-0.5 rounded">
              Google Search Grounded
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clusters.map((cluster) => (
              <div
                key={cluster.cluster_id}
                className="bg-slate-900 border border-slate-700/80 rounded-xl p-5 space-y-3.5 shadow-xl hover:border-slate-600 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400">
                      {cluster.hazard_type.replace(/_/g, " ")}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-black ${
                        cluster.severity === "CRITICAL"
                          ? "bg-red-950 text-red-300 border border-red-700"
                          : "bg-amber-950 text-amber-300 border border-amber-700"
                      }`}
                    >
                      {cluster.severity}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold">{cluster.sector}</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
                    <span className="flex items-center gap-1 text-cyan-300">
                      <Users className="w-3.5 h-3.5" />
                      {cluster.corroborating_reports.length} Sources Corroborating
                    </span>
                    {cluster.total_people_affected > 0 && (
                      <span className="text-rose-400 font-bold">
                        ~{cluster.total_people_affected} Casualties
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-200 font-sans leading-relaxed">
                    {cluster.synthetic_briefing}
                  </p>

                  <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-lg space-y-1">
                    <span className="text-[10px] font-mono font-bold text-purple-300 block uppercase">
                      Operational Grounding:
                    </span>
                    <p className="text-[11px] text-slate-400 font-sans">
                      {cluster.grounded_context}
                    </p>
                  </div>
                </div>

                {/* Citations Footer */}
                {cluster.citations && cluster.citations.length > 0 && (
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-cyan-400" />
                      {cluster.citations[0].title}
                    </span>
                    <a
                      href={cluster.citations[0].uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5"
                    >
                      Ref <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Raw Field Feed */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-mono font-bold text-slate-200 uppercase">
              Field Intake Feed ({reports.length} Total Reports)
            </h2>
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs font-mono">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
            {["ALL", "CRITICAL", "URGENT", "STABLE"].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  filterSeverity === sev
                    ? "bg-slate-800 text-white font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {filteredReports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReports.map((report) => (
              <div
                key={report.report_id}
                className={`bg-slate-900 border rounded-xl p-4 space-y-3 shadow-md transition-all ${
                  report.verified_by_coordinator
                    ? "border-emerald-700/60"
                    : "border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-200">
                    {report.hazard_type.replace(/_/g, " ")}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-black ${
                      report.severity === "CRITICAL"
                        ? "bg-red-950 text-red-300 border border-red-700"
                        : report.severity === "URGENT"
                        ? "bg-amber-950 text-amber-300 border border-amber-700"
                        : "bg-emerald-950 text-emerald-300 border border-emerald-700"
                    }`}
                  >
                    {report.severity}
                  </span>
                </div>

                <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
                  <span>Sector: {report.sector_hint}</span>
                  <span className="text-slate-500">
                    {new Date(report.created_offline_at).toLocaleTimeString()}
                  </span>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs font-sans text-slate-300">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 block uppercase mb-1">
                    PII-Scrubbed Wire Summary:
                  </span>
                  {report.scrubbed_summary}
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      report.sync_status === "SYNCED"
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-900"
                        : "bg-amber-950 text-amber-400 border border-amber-900"
                    }`}
                  >
                    {report.sync_status}
                  </span>

                  <button
                    onClick={() => onToggleVerifyReport(report.report_id)}
                    className={`px-2 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
                      report.verified_by_coordinator
                        ? "bg-emerald-950 border border-emerald-600 text-emerald-300 font-bold"
                        : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {report.verified_by_coordinator ? (
                      <>
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        Verified
                      </>
                    ) : (
                      <>
                        <Flag className="w-3 h-3" />
                        Mark Verified
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-10 text-center space-y-2">
            <AlertOctagon className="w-8 h-8 text-slate-500 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-300">No Reports in this View</h3>
            <p className="text-xs text-slate-500">
              Submit reports from the Field Intake terminal to populate this real-time command feed.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
