import React, { useState } from "react";
import {
  Camera,
  ArrowRight,
  Radio,
  AlertTriangle,
  Building2,
  Waves,
  Flame,
  Navigation,
  ShieldAlert
} from "lucide-react";
import { runLocalTriageInference } from "../services/hybridAi";
import { submitTriageReport } from "../services/storageQueue";
import { getVettedProtocolCard } from "../services/remoteConfigService";
import type { TriageReport, RedactionResult, SafetyProtocolCard, HazardType } from "../types/triage";

interface ReportPageProps {
  onReportSubmitted: (report: TriageReport) => void;
  isSimulatedOffline: boolean;
  reports: TriageReport[];
}

export const ReportPage: React.FC<ReportPageProps> = ({
  onReportSubmitted,
  isSimulatedOffline,
  reports
}) => {
  const [reportText, setReportText] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<{
    report: TriageReport;
    redaction: RedactionResult;
    protocolCard: SafetyProtocolCard;
  } | null>(null);

  const hasInput = Boolean(reportText.trim() || selectedImage || imagePreviewUrl);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasInput || isProcessing) return;
    setIsProcessing(true);

    try {
      const effectiveText =
        reportText.trim() || "Damage photograph attached for assessment.";
      const { report, redaction } = await runLocalTriageInference(
        effectiveText,
        selectedImage
      );

      if (isSimulatedOffline) {
        report.sync_status = "QUEUED_OFFLINE";
      }

      const protocolCard = await getVettedProtocolCard(report.hazard_type);
      const finalReport = await submitTriageReport(report, isSimulatedOffline);

      setLastResult({
        report: finalReport,
        redaction,
        protocolCard
      });

      onReportSubmitted(finalReport);
      setReportText("");
      setSelectedImage(null);
      setImagePreviewUrl(null);
    } catch (err) {
      console.error("Failed to submit incident report:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const getHazardIcon = (hazard: HazardType) => {
    switch (hazard) {
      case "STRUCTURAL_COLLAPSE": return <Building2 className="w-[16px] h-[16px] text-[#C9331B]" />;
      case "FLASH_FLOOD": return <Waves className="w-[16px] h-[16px] text-[#254EDB]" />;
      case "FIRE_HAZARD": return <Flame className="w-[16px] h-[16px] text-[#B4690E]" />;
      case "BLOCKED_ACCESS": return <Navigation className="w-[16px] h-[16px] text-[#B4690E]" />;
      case "MEDICAL_EMERGENCY": return <ShieldAlert className="w-[16px] h-[16px] text-[#C9331B]" />;
    }
  };

  const formatHazardLabel = (hazard: HazardType) =>
    hazard
      .toLowerCase()
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  return (
    <div className="max-w-[1360px] mx-auto px-[21px] py-[21px] space-y-[21px]">
      <div className="pb-[13px] border-b border-[#E0E0DA]">
        <h1 className="text-[21px] tracking-[-0.02em] font-medium text-[#141517]">
          Report Incident
        </h1>
      </div>

      {/* Golden Ratio Spiral Layout: 1.618fr (8) Left Major | 1fr (5->3->2->1) Right Minor */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.618fr_1fr] gap-[21px] items-start">
        {/* SPIRAL BLOCK 8: Primary Incident Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-[#E0E0DA] rounded-[13px] p-[21px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-[21px]"
        >
          {/* Optional Photo Upload */}
          <div className="space-y-[8px]">
            <label className="text-[12px] font-medium text-[#54575F] block">
              Photo
            </label>

            <div className="rounded-[8px] border border-[#E0E0DA] bg-[#F5F5F2] overflow-hidden">
              {imagePreviewUrl ? (
                <div>
                  <div className="bg-[#ECECE7] border-b border-[#E0E0DA] flex items-center justify-center">
                    <img
                      src={imagePreviewUrl}
                      alt="Attached incident evidence"
                      className="w-full max-h-[252px] object-contain"
                    />
                  </div>
                  <div className="px-[13px] py-[8px] flex items-center justify-end text-[12px] font-mono">
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreviewUrl(null);
                        setSelectedImage(null);
                      }}
                      className="cursor-pointer text-[#C9331B] hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center py-[34px] px-[21px] text-center hover:bg-[#ECECE7]/50 transition-colors">
                  <Camera className="w-[21px] h-[21px] text-[#868991] mb-[8px]" />
                  <span className="text-[13px] font-medium text-[#141517]">
                    Attach photo
                  </span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Incident Description */}
          <div className="space-y-[8px]">
            <label htmlFor="incident-details" className="text-[12px] font-medium text-[#54575F] block">
              Details
            </label>
            <textarea
              id="incident-details"
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="Describe the incident, location, and anyone needing assistance..."
              rows={5}
              className="w-full rounded-[8px] border border-[#E0E0DA] bg-[#FAF9F6] p-[13px] text-[14px] leading-relaxed text-[#141517] placeholder-[#868991] focus:outline-none focus:border-[#141517] transition-colors resize-none"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-[13px] border-t border-[#E0E0DA] flex justify-end">
            <button
              type="submit"
              disabled={isProcessing || !hasInput}
              className="cursor-pointer disabled:cursor-not-allowed px-[21px] py-[13px] rounded-[8px] bg-[#C9331B] hover:bg-[#AE2914] disabled:bg-[#E0E0DA] disabled:text-[#868991] text-white font-medium text-[13px] transition-colors flex items-center justify-center gap-[8px]"
            >
              {isProcessing ? (
                <>
                  <span className="w-[13px] h-[13px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Submitting…</span>
                </>
              ) : (
                <>
                  <span>Submit Report</span>
                  <ArrowRight className="w-[15px] h-[15px]" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* SPIRAL BLOCK 5 -> 3 -> 2 -> 1: Assessment & Safety Protocol */}
        <aside className="space-y-[13px]">
          {lastResult ? (
            <>
              {/* SPIRAL CELL 5: Triage Assessment */}
              <div className="bg-white border border-[#E0E0DA] rounded-[13px] p-[21px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-[13px]">
                <div className="flex items-start justify-between gap-[13px]">
                  <div className="flex items-start gap-[8px]">
                    <div className="mt-[2px]">
                      {getHazardIcon(lastResult.report.hazard_type)}
                    </div>
                    <div>
                      <h2 className="text-[15px] font-medium text-[#141517]">
                        {formatHazardLabel(lastResult.report.hazard_type)}
                      </h2>
                      <p className="text-[12px] font-mono text-[#54575F]">
                        {lastResult.report.sector_hint}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-[8px] py-[3px] rounded-[3px] text-[11px] font-mono font-semibold tracking-wide ${
                      lastResult.report.severity === "CRITICAL"
                        ? "bg-[#FDF2F0] text-[#C9331B] border border-[#F2C6BE]"
                        : lastResult.report.severity === "URGENT"
                        ? "bg-[#FEF3C7] text-[#B4690E] border border-[#F5D688]"
                        : "bg-[#ECFDF5] text-[#186847] border border-[#BCE5D2]"
                    }`}
                  >
                    {lastResult.report.severity}
                  </span>
                </div>

                {/* Status & Affected */}
                <div className="rounded-[8px] bg-[#F5F5F2] border border-[#E0E0DA] p-[13px] grid grid-cols-2 gap-[8px] text-[12px] font-mono tabular-nums">
                  <div>
                    <span className="block text-[11px] text-[#868991]">Affected</span>
                    <span className="text-[#141517] font-medium">
                      {lastResult.report.people_affected !== null
                        ? `${lastResult.report.people_affected} persons`
                        : "Unconfirmed"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-[#868991]">Delivery</span>
                    {(() => {
                      const liveSync =
                        reports.find((r) => r.report_id === lastResult.report.report_id)?.sync_status ??
                        lastResult.report.sync_status;
                      return (
                        <span
                          className={
                            liveSync === "SYNCED"
                              ? "text-[#186847] font-medium"
                              : "text-[#B4690E] font-medium"
                          }
                        >
                          {liveSync === "SYNCED" ? "Delivered" : "Queued Offline"}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                {/* Sanitized Summary */}
                <div className="space-y-[8px]">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-medium text-[#141517]">
                      Submitted Summary
                    </span>
                    {lastResult.redaction.redactedEntities.length > 0 && (
                      <span className="font-mono text-[11px] text-[#186847]">
                        {lastResult.redaction.redactedEntities.length} personal details redacted
                      </span>
                    )}
                  </div>

                  <div className="rounded-[8px] border border-[#E0E0DA] bg-[#F5F5F2] p-[13px] text-[12px]">
                    <p className="text-[#141517] leading-relaxed break-words">
                      {lastResult.redaction.redactedText.split(/(\[[A-Z_]+_REDACTED\])/g).map((part, idx) =>
                        /^\[[A-Z_]+_REDACTED\]$/.test(part) ? (
                          <span
                            key={idx}
                            className="inline-block font-mono text-[11px] bg-[#D1FAE5] text-[#14532D] px-[5px] py-[1px] rounded-[3px]"
                          >
                            {part}
                          </span>
                        ) : (
                          <React.Fragment key={idx}>{part}</React.Fragment>
                        )
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* SPIRAL SUB-DIVISION: 3 (Protocol) : 2+1 (Channel & Status) */}
              <div className="grid grid-cols-1 sm:grid-cols-[1.618fr_1fr] gap-[13px] items-stretch">
                {/* SPIRAL CELL 3: Safety Protocol */}
                <div className="bg-white border border-[#E0E0DA] rounded-[13px] p-[13px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-[8px]">
                  <span className="text-[12px] font-medium text-[#141517] block">
                    {lastResult.protocolCard.title}
                  </span>

                  <ul className="space-y-[5px] text-[12px] text-[#54575F] leading-snug list-disc list-inside">
                    {lastResult.protocolCard.immediate_actions.slice(0, 3).map((act, i) => (
                      <li key={i}>{act}</li>
                    ))}
                  </ul>

                  <div className="pt-[8px] border-t border-[#E0E0DA] space-y-[5px]">
                    <span className="text-[11px] font-mono text-[#C9331B] flex items-center gap-[5px]">
                      <AlertTriangle className="w-[11px] h-[11px]" />
                      Do Not
                    </span>
                    <ul className="space-y-[3px] text-[11px] text-[#54575F] leading-snug list-disc list-inside">
                      {lastResult.protocolCard.contraindications.slice(0, 2).map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* SPIRAL CELLS 2 & 1 */}
                <div className="flex flex-col gap-[8px]">
                  <div className="bg-[#ECECE7] border border-[#E0E0DA] rounded-[8px] p-[13px] flex-1 flex flex-col justify-between space-y-[8px]">
                    <div className="flex items-center gap-[5px] text-[11px] font-mono text-[#54575F]">
                      <Radio className="w-[12px] h-[12px]" />
                      <span>Channel</span>
                    </div>
                    <p className="text-[12px] font-mono text-[#141517] leading-snug">
                      {lastResult.protocolCard.broadcast_channel}
                    </p>
                  </div>

                  <div className="bg-white border border-[#E0E0DA] rounded-[8px] p-[13px] flex flex-col gap-[3px] text-[11px] font-mono">
                    <span className="text-[#868991]">Reference</span>
                    <span className="text-[#141517] font-medium truncate">{lastResult.report.report_id}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white border border-[#E0E0DA] rounded-[13px] p-[21px] text-[13px] text-[#54575F]">
              Safety instructions and dispatch status will appear here after you submit a report.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
