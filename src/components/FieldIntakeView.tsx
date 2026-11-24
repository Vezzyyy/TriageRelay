import React, { useState } from "react";
import { 
  Camera, 
  FileText, 
  ShieldAlert, 
  AlertTriangle, 
  Clock, 
  Lock, 
  Flame, 
  Waves, 
  Building2, 
  Navigation, 
  Sparkles,
  ArrowRight,
  Info,
  Radio
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<{
    report: TriageReport;
    redaction: RedactionResult;
    latencyMs: number;
    protocolCard: SafetyProtocolCard;
  } | null>(null);

  // Load sample scenario instantly for testing / judging walkthrough
  const handleLoadScenario = (scenario: DisasterScenario) => {
    setReportText(scenario.raw_text);
    setImagePreviewUrl(scenario.image_url);
    setSelectedImage(null); // SVG mock data URL
    setLastResult(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreviewUrl(URL.createObjectURL(file));
      setLastResult(null);
    }
  };

  const handleRunOfflineTriage = async () => {
    if (!reportText.trim()) return;
    setIsProcessing(true);

    try {
      // 1. Run strict on-device inference with deterministic PII scrubbing
      const { report, redaction, latencyMs } = await runLocalTriageInference(
        reportText,
        selectedImage
      );

      // Force status to QUEUED_OFFLINE if in simulated dead zone
      if (isSimulatedOffline) {
        report.sync_status = "QUEUED_OFFLINE";
      }

      // 2. Fetch the vetted safety protocol card for this classified hazard
      const protocolCard = await getVettedProtocolCard(report.hazard_type);

      // 3. Commit to local queue / Firestore offline cache
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
      case "STRUCTURAL_COLLAPSE": return <Building2 className="w-5 h-5 text-rose-400" />;
      case "FLASH_FLOOD": return <Waves className="w-5 h-5 text-cyan-400" />;
      case "FIRE_HAZARD": return <Flame className="w-5 h-5 text-orange-400" />;
      case "BLOCKED_ACCESS": return <Navigation className="w-5 h-5 text-amber-400" />;
      case "MEDICAL_EMERGENCY": return <ShieldAlert className="w-5 h-5 text-red-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Tactical Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-mono font-bold text-white tracking-wide">
              FIELD RESPONDER INTAKE
            </h1>
            <span className="text-xs font-mono bg-red-950 text-red-300 border border-red-800 px-2 py-0.5 rounded">
              EDGE ONLY • ZERO CLOUD LEAK
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Multimodal on-device classification via Gemini Nano. Raw images and victim identifiers never leave this terminal.
          </p>
        </div>

        {/* 1-Click Scenario Quick-Loaders */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Load Scenario:</span>
          {SAMPLE_DISASTER_SCENARIOS.map((scen, idx) => (
            <button
              key={scen.id}
              onClick={() => handleLoadScenario(scen)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-all flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-cyan-400" />
              Scenario {idx + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4 shadow-md">
            <h2 className="text-sm font-mono font-semibold uppercase text-slate-300 flex items-center gap-2">
              <Camera className="w-4 h-4 text-cyan-400" />
              1. Incident Photo (JPEG/PNG)
            </h2>

            {/* Photo Dropzone & Preview */}
            <div className="relative group border-2 border-dashed border-slate-700 hover:border-slate-500 rounded-lg p-3 text-center transition-all bg-slate-950/60">
              {imagePreviewUrl ? (
                <div className="space-y-2">
                  <img
                    src={imagePreviewUrl}
                    alt="Damage Evidence"
                    className="w-full h-44 object-cover rounded-md border border-slate-800"
                  />
                  <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                    <span className="flex items-center gap-1 text-emerald-400 font-mono">
                      <Lock className="w-3 h-3" /> Stays in Client Memory
                    </span>
                    <button
                      onClick={() => {
                        setImagePreviewUrl(null);
                        setSelectedImage(null);
                      }}
                      className="text-red-400 hover:text-red-300 text-xs"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              ) : (
                <label className="cursor-pointer block py-6">
                  <Camera className="w-8 h-8 text-slate-500 mx-auto mb-2 group-hover:text-slate-300 transition-colors" />
                  <span className="text-xs font-medium text-slate-300 block">
                    Upload disaster damage photo
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-1">
                    JPEG or PNG • Processed strictly on-device
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

            {/* Multilingual Text Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-mono font-semibold uppercase text-slate-300 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  2. Eyewitness Account
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  EN / FR / AR supported
                </span>
              </div>
              <textarea
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                placeholder="Type or paste chaotic eyewitness message with victim descriptions, phone numbers, or damage notes..."
                rows={5}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none font-sans"
              />
            </div>

            {/* Trigger Button */}
            <button
              onClick={handleRunOfflineTriage}
              disabled={isProcessing || !reportText.trim()}
              className="w-full py-3 px-4 rounded-lg bg-red-600 hover:bg-red-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-mono font-bold text-sm tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Triaging On-Device...
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  Analyze Locally (Offline-Safe)
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Results & Vetted Protocols (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {lastResult ? (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Output Header Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    {getHazardIcon(lastResult.report.hazard_type)}
                    <div>
                      <h3 className="text-base font-bold text-white font-mono">
                        {lastResult.report.hazard_type.replace(/_/g, " ")}
                      </h3>
                      <span className="text-xs text-slate-400 font-mono">
                        Sector: {lastResult.report.sector_hint}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Severity Badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-mono font-black tracking-wider ${
                        lastResult.report.severity === "CRITICAL"
                          ? "bg-red-950 text-red-300 border border-red-600 animate-pulse"
                          : lastResult.report.severity === "URGENT"
                          ? "bg-amber-950 text-amber-300 border border-amber-600"
                          : "bg-emerald-950 text-emerald-300 border border-emerald-600"
                      }`}
                    >
                      {lastResult.report.severity}
                    </span>

                    {/* Latency Pill */}
                    <span className="text-xs font-mono bg-slate-950 text-cyan-400 border border-slate-800 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {lastResult.latencyMs}ms
                    </span>
                  </div>
                </div>

                {/* Casualties & Sync Status Bar */}
                <div className="flex flex-wrap items-center justify-between text-xs font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 gap-2">
                  <div className="flex items-center gap-2 text-slate-300">
                    <span>Estimated Casualties:</span>
                    <span className="font-bold text-red-400">
                      {lastResult.report.people_affected !== null
                        ? `${lastResult.report.people_affected} Reported`
                        : "Unknown / Unconfirmed"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Sync Wire:</span>
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                        lastResult.report.sync_status === "SYNCED"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : "bg-amber-950 text-amber-400 border border-amber-800"
                      }`}
                    >
                      {lastResult.report.sync_status}
                    </span>
                  </div>
                </div>

                {/* BEFORE / AFTER PII REDACTION DIFF */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      Deterministic PII Redaction Diff
                    </span>
                    <span className="text-emerald-400 text-[11px]">
                      {lastResult.redaction.redactedEntities.length} sensitive tokens scrubbed
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                    {/* Before (Original Raw Text) */}
                    <div className="bg-red-950/20 border border-red-900/40 rounded-lg p-3 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-red-400 block tracking-wider">
                        Raw Input (Never Leaves Device)
                      </span>
                      <p className="text-slate-300 break-words line-clamp-4 font-sans text-xs">
                        {lastResult.redaction.originalText}
                      </p>
                    </div>

                    {/* After (Scrubbed Wire Text) */}
                    <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-lg p-3 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">
                        Scrubbed Wire Payload (Zero PII)
                      </span>
                      <p className="text-slate-200 break-words line-clamp-4 font-sans text-xs">
                        {lastResult.redaction.redactedText}
                      </p>
                    </div>
                  </div>
                </div>

                {/* VETTED STATIC SAFETY PROTOCOL CARD (From Remote Config) */}
                <div className="border border-purple-900/50 bg-purple-950/20 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-purple-400" />
                      <h4 className="text-xs font-mono font-bold uppercase text-purple-200">
                        Vetted Remote Config Safety Protocol: {lastResult.protocolCard.title}
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-purple-300 bg-purple-900/60 px-2 py-0.5 rounded">
                      {lastResult.protocolCard.version}
                    </span>
                  </div>

                  {/* Immediate Actions */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase block">
                      Immediate Mandatory Actions:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-200 list-disc list-inside">
                      {lastResult.protocolCard.immediate_actions.map((act, i) => (
                        <li key={i}>{act}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Hard Contraindications (What NEVER to do) */}
                  <div className="space-y-1.5 pt-1 border-t border-purple-900/40">
                    <span className="text-[11px] font-mono font-bold text-rose-400 uppercase block flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-400" />
                      Strict Contraindications (Never Do):
                    </span>
                    <ul className="space-y-1 text-xs text-rose-200 list-disc list-inside">
                      {lastResult.protocolCard.contraindications.map((contra, i) => (
                        <li key={i}>{contra}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Broadcast Channel */}
                  <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-purple-900/40">
                    <span className="flex items-center gap-1">
                      <Radio className="w-3.5 h-3.5 text-purple-400" />
                      Broadcast Net: {lastResult.protocolCard.broadcast_channel}
                    </span>
                    <span className="text-emerald-400 font-semibold">
                      Deterministic Vetted Card
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Info className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-200">
                Ready for Field Intake
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Load a scenario above or upload a disaster photo and eyewitness text. Analysis runs 100% locally with zero cloud network dependency.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
