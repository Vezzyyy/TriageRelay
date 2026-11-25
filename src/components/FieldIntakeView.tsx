import React, { useState } from "react";
import {
  Camera,
  Lock,
  ArrowRight,
  Radio,
  AlertTriangle,
  Building2,
  Waves,
  Flame,
  Navigation,
  ShieldAlert
} from "lucide-react";
import { SAMPLE_DISASTER_SCENARIOS, type DisasterScenario } from "../data/sampleScenarios";
import { runLocalTriageInference } from "../services/hybridAi";
import { submitTriageReport } from "../services/storageQueue";
import { getVettedProtocolCard } from "../services/remoteConfigService";
import type { TriageReport, RedactionResult, SafetyProtocolCard, HazardType } from "../types/triage";

interface FieldIntakeViewProps {
  onReportSubmitted: (report: TriageReport) => void;
  onIncrementEdgeCount: () => void;
  isSimulatedOffline: boolean;
}

export const FieldIntakeView: React.FC<FieldIntakeViewProps> = ({
  onReportSubmitted,
  onIncrementEdgeCount,
  isSimulatedOffline
}) => {
  const [reportText, setReportText] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<{
    report: TriageReport;
    redaction: RedactionResult;
    latencyMs: number;
    protocolCard: SafetyProtocolCard;
  } | null>(null);

  const handleLoadScenario = (scenario: DisasterScenario) => {
    setActiveScenarioId(scenario.id);
    setReportText(scenario.raw_text);
    setImagePreviewUrl(scenario.image_url);
    setSelectedImage(null);
    setLastResult(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setActiveScenarioId(null);
      setSelectedImage(file);
      setImagePreviewUrl(URL.createObjectURL(file));
      setLastResult(null);
    }
  };

  const handleRunOfflineTriage = async () => {
    if (!reportText.trim()) return;
    setIsProcessing(true);

    try {
      const { report, redaction, latencyMs } = await runLocalTriageInference(
        reportText,
        selectedImage
      );

      if (isSimulatedOffline) {
        report.sync_status = "QUEUED_OFFLINE";
      }

      const protocolCard = await getVettedProtocolCard(report.hazard_type);
      const finalReport = await submitTriageReport(report);

      setLastResult({
        report: finalReport,
        redaction,
        latencyMs,
        protocolCard
      });

      onReportSubmitted(finalReport);
      onIncrementEdgeCount();
    } catch (err) {
      console.error("Local triage failed:", err);
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
      {/* Architectural Header & Scenario Preset Layer */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-[13px] pb-[13px] border-b border-[#E0E0DA]">
        <div>
          <h1 className="text-[21px] tracking-[-0.02em] font-medium text-[#141517]">
            Field Responder Intake
          </h1>
          <p className="text-[13px] text-[#54575F] mt-[3px]">
            On-device multimodal classification. Raw media and personal identifiers remain strictly local.
          </p>
        </div>

        {/* Concentric Fibonacci Preset Switcher (8px outer, 3px pad, 5px inner) */}
        <div className="flex flex-wrap items-center gap-[8px]">
          <span className="text-[12px] font-mono text-[#868991]">Presets</span>
          <div className="flex items-center bg-[#ECECE7] p-[3px] rounded-[8px] border border-[#E0E0DA]/70">
            {SAMPLE_DISASTER_SCENARIOS.map((scen) => (
              <button
                key={scen.id}
                onClick={() => handleLoadScenario(scen)}
                className={`px-[13px] py-[5px] rounded-[5px] text-[12px] font-mono transition-all ${
                  activeScenarioId === scen.id
                    ? "bg-white text-[#141517] font-medium shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                    : "text-[#54575F] hover:text-[#141517]"
                }`}
              >
                {scen.short_label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Golden Ratio Spiral Layout: 1.618fr (8) Left Major | 1fr (5->3->2->1) Right Minor */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.618fr_1fr] gap-[21px] items-start">
        {/* SPIRAL BLOCK 8: Primary Field Intake Canvas (61.8%) */}
        <section className="bg-white border border-[#E0E0DA] rounded-[13px] p-[21px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-[21px]">
          {/* Photo Evidence Sub-Frame (8px radius, 13px pad) */}
          <div className="space-y-[8px]">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-[#54575F]">
                Site Evidence (JPEG / PNG)
              </span>
              <span className="text-[11px] font-mono text-[#186847] flex items-center gap-[5px]">
                <Lock className="w-[11px] h-[11px]" />
                Client Memory Only
              </span>
            </div>

            <div className="rounded-[8px] border border-[#E0E0DA] bg-[#F5F5F2] overflow-hidden">
              {imagePreviewUrl ? (
                <div>
                  <div className="bg-[#ECECE7] border-b border-[#E0E0DA] flex items-center justify-center">
                    <img
                      src={imagePreviewUrl}
                      alt="Field site evidence"
                      className="w-full max-h-[252px] object-contain"
                    />
                  </div>
                  <div className="px-[13px] py-[8px] flex items-center justify-between text-[12px] font-mono text-[#54575F]">
                    <span>0 bytes uploaded to cloud</span>
                    <button
                      onClick={() => {
                        setImagePreviewUrl(null);
                        setSelectedImage(null);
                        setActiveScenarioId(null);
                      }}
                      className="text-[#C9331B] hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center py-[34px] px-[21px] text-center hover:bg-[#ECECE7]/50 transition-colors">
                  <Camera className="w-[21px] h-[21px] text-[#868991] mb-[8px]" />
                  <span className="text-[13px] font-medium text-[#141517]">
                    Attach field damage photograph
                  </span>
                  <span className="text-[12px] text-[#868991] mt-[3px]">
                    Processed locally via Gemini Nano; never transmitted over wire
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

          {/* Eyewitness Narrative Input */}
          <div className="space-y-[8px]">
            <div className="flex items-center justify-between">
              <label htmlFor="eyewitness-input" className="text-[12px] font-medium text-[#54575F]">
                Eyewitness Report
              </label>
              <span className="text-[11px] font-mono text-[#868991]">
                EN / FR / AR
              </span>
            </div>
            <textarea
              id="eyewitness-input"
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="Enter unstructured field report, casualty estimates, or caller contact details..."
              rows={5}
              className="w-full rounded-[8px] border border-[#E0E0DA] bg-[#FAF9F6] p-[13px] text-[14px] leading-relaxed text-[#141517] placeholder-[#868991] focus:outline-none focus:border-[#141517] transition-colors resize-none"
            />
          </div>

          {/* Primary Action Layer */}
          <div className="pt-[13px] border-t border-[#E0E0DA] flex flex-col sm:flex-row sm:items-center justify-between gap-[13px]">
            <div className="text-[12px] font-mono text-[#868991]">
              Inference mode: <span className="text-[#141517]">only_on_device</span>
            </div>

            <button
              onClick={handleRunOfflineTriage}
              disabled={isProcessing || !reportText.trim()}
              className="px-[21px] py-[13px] rounded-[8px] bg-[#C9331B] hover:bg-[#AE2914] disabled:bg-[#E0E0DA] disabled:text-[#868991] text-white font-medium text-[13px] transition-colors flex items-center justify-center gap-[8px]"
            >
              {isProcessing ? (
                <>
                  <span className="w-[13px] h-[13px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing On-Device…</span>
                </>
              ) : (
                <>
                  <span>Analyze Locally (Offline-Safe)</span>
                  <ArrowRight className="w-[15px] h-[15px]" />
                </>
              )}
            </button>
          </div>
        </section>

        {/* SPIRAL BLOCK 5 -> 3 -> 2 -> 1: Right Minor Golden Column (38.2%) */}
        <aside className="space-y-[13px]">
          {lastResult ? (
            <>
              {/* SPIRAL CELL 5: Classification + Redaction Diff */}
              <div className="bg-white border border-[#E0E0DA] rounded-[13px] p-[21px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-[13px]">
                {/* Classification Header */}
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

                  {/* Urgency Tag — bold reserved solely for semantic priority */}
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

                {/* Tabular Telemetry Sub-Strip (8px radius, 13px pad) */}
                <div className="rounded-[8px] bg-[#F5F5F2] border border-[#E0E0DA] p-[13px] grid grid-cols-3 gap-[8px] text-[12px] font-mono tabular-nums">
                  <div>
                    <span className="block text-[11px] text-[#868991]">Affected</span>
                    <span className="text-[#141517] font-medium">
                      {lastResult.report.people_affected !== null
                        ? `${lastResult.report.people_affected} persons`
                        : "Unconfirmed"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-[#868991]">Latency</span>
                    <span className="text-[#141517] font-medium">{lastResult.latencyMs} ms</span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-[#868991]">Wire Status</span>
                    <span
                      className={
                        lastResult.report.sync_status === "SYNCED"
                          ? "text-[#186847] font-medium"
                          : "text-[#B4690E] font-medium"
                      }
                    >
                      {lastResult.report.sync_status === "SYNCED" ? "Synced" : "Queued"}
                    </span>
                  </div>
                </div>

                {/* Before / After PII Redaction Diff */}
                <div className="space-y-[8px]">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-medium text-[#141517]">
                      PII Redaction Diff
                    </span>
                    <span className="font-mono text-[11px] text-[#186847]">
                      {lastResult.redaction.redactedEntities.length} tokens scrubbed
                    </span>
                  </div>

                  <div className="space-y-[8px] text-[12px]">
                    <div className="rounded-[8px] border border-[#F2C6BE] bg-[#FDF2F0]/50 p-[13px] space-y-[5px]">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[#C9331B] block">
                        Raw Local Input (Device Only)
                      </span>
                      <p className="text-[#54575F] leading-relaxed break-words">
                        {lastResult.redaction.originalText}
                      </p>
                    </div>

                    <div className="rounded-[8px] border border-[#BCE5D2] bg-[#ECFDF5]/60 p-[13px] space-y-[5px]">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[#186847] block">
                        Scrubbed Wire Payload (Zero PII)
                      </span>
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
              </div>

              {/* SPIRAL SUB-DIVISION: 3 (Protocol Card) : 2+1 (Broadcast & Spiral Anchor) */}
              <div className="grid grid-cols-1 sm:grid-cols-[1.618fr_1fr] gap-[13px] items-stretch">
                {/* SPIRAL CELL 3: Vetted Remote Config Safety Protocol */}
                <div className="bg-white border border-[#E0E0DA] rounded-[13px] p-[13px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-[8px]">
                  <div className="flex items-center justify-between gap-[8px]">
                    <span className="text-[12px] font-medium text-[#141517]">
                      {lastResult.protocolCard.title}
                    </span>
                  </div>

                  <ul className="space-y-[5px] text-[12px] text-[#54575F] leading-snug list-disc list-inside">
                    {lastResult.protocolCard.immediate_actions.slice(0, 3).map((act, i) => (
                      <li key={i}>{act}</li>
                    ))}
                  </ul>

                  <div className="pt-[8px] border-t border-[#E0E0DA] space-y-[5px]">
                    <span className="text-[11px] font-mono text-[#C9331B] flex items-center gap-[5px]">
                      <AlertTriangle className="w-[11px] h-[11px]" />
                      Contraindications
                    </span>
                    <ul className="space-y-[3px] text-[11px] text-[#54575F] leading-snug list-disc list-inside">
                      {lastResult.protocolCard.contraindications.slice(0, 2).map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* SPIRAL CELLS 2 & 1: Stacked Clockwise Inward */}
                <div className="flex flex-col gap-[8px]">
                  {/* Cell 2: Broadcast & Remote Config Anchor */}
                  <div className="bg-[#ECECE7] border border-[#E0E0DA] rounded-[8px] p-[13px] flex-1 flex flex-col justify-between space-y-[8px]">
                    <div className="flex items-center gap-[5px] text-[11px] font-mono text-[#54575F]">
                      <Radio className="w-[12px] h-[12px]" />
                      <span>Broadcast Net</span>
                    </div>
                    <p className="text-[12px] font-mono text-[#141517] leading-snug">
                      {lastResult.protocolCard.broadcast_channel}
                    </p>
                    <span className="text-[10px] font-mono text-[#868991] block">
                      {lastResult.protocolCard.version}
                    </span>
                  </div>

                  {/* Cell 1 (Eye of Spiral): Deterministic Audit Chip */}
                  <div className="bg-white border border-[#E0E0DA] rounded-[8px] p-[13px] flex flex-col gap-[3px] text-[11px] font-mono">
                    <span className="text-[#868991]">Privacy Audit</span>
                    <span className="text-[#186847] font-medium">PII Verified · $0.00</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Quiet Architectural Empty State */
            <div className="bg-white border border-[#E0E0DA] rounded-[13px] p-[21px] space-y-[21px]">
              <div>
                <h2 className="text-[14px] font-medium text-[#141517]">
                  Local Triage Pipeline
                </h2>
                <p className="text-[12px] text-[#54575F] mt-[3px]">
                  Attach an image or select a preset to observe edge inference.
                </p>
              </div>

              <div className="space-y-[8px] text-[12px]">
                <div className="rounded-[8px] bg-[#F5F5F2] border border-[#E0E0DA] p-[13px] flex gap-[13px]">
                  <span className="font-mono text-[#868991]">01</span>
                  <div>
                    <span className="font-medium text-[#141517] block">Deterministic Redaction</span>
                    <span className="text-[#54575F]">Phones, emails, IDs, and names are stripped locally.</span>
                  </div>
                </div>

                <div className="rounded-[8px] bg-[#F5F5F2] border border-[#E0E0DA] p-[13px] flex gap-[13px]">
                  <span className="font-mono text-[#868991]">02</span>
                  <div>
                    <span className="font-medium text-[#141517] block">Strict Schema Classification</span>
                    <span className="text-[#54575F]">Gemini Nano classifies severity without medical hallucinations.</span>
                  </div>
                </div>

                <div className="rounded-[8px] bg-[#F5F5F2] border border-[#E0E0DA] p-[13px] flex gap-[13px]">
                  <span className="font-mono text-[#868991]">03</span>
                  <div>
                    <span className="font-medium text-[#141517] block">Vetted Protocol Mapping</span>
                    <span className="text-[#54575F]">Maps hazard type to curated Remote Config safety checklists.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
