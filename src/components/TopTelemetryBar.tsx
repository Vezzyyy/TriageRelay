import React from "react";
import { Wifi, WifiOff } from "lucide-react";
import type { TelemetryState } from "../types/triage";

interface TopTelemetryBarProps {
  telemetry: TelemetryState;
  activeView: "field" | "command";
  onSwitchView: (view: "field" | "command") => void;
  onToggleSimulatedOffline: () => void;
  isSimulatedOffline: boolean;
  queuedCount: number;
}

export const TopTelemetryBar: React.FC<TopTelemetryBarProps> = ({
  telemetry,
  activeView,
  onSwitchView,
  onToggleSimulatedOffline,
  isSimulatedOffline,
  queuedCount
}) => {
  const effectiveOnline = telemetry.isOnline && !isSimulatedOffline;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E0E0DA]">
      <div className="max-w-[1360px] mx-auto px-[21px] py-[13px] flex flex-col lg:flex-row items-center justify-between gap-[13px]">
        {/* Left: Brand & Concentric Fibonacci Segmented Navigation */}
        <div className="flex items-center justify-between w-full lg:w-auto gap-[21px]">
          <div className="flex items-center gap-[8px]">
            <span className="inline-block w-[8px] h-[8px] rounded-[2px] bg-[#C9331B]" />
            <span className="text-[15px] tracking-[-0.015em] font-semibold text-[#141517]">
              TriageRelay
            </span>
            <span className="hidden sm:inline-block text-[12px] font-mono text-[#868991] pl-[5px] border-l border-[#E0E0DA]">
              Field &amp; Command
            </span>
          </div>

          {/* 8px outer container, 3px padding, 5px inner buttons (5 + 3 = 8 concentric) */}
          <nav
            aria-label="Primary View Switcher"
            className="flex items-center bg-[#ECECE7] p-[3px] rounded-[8px] border border-[#E0E0DA]/70"
          >
            <button
              onClick={() => onSwitchView("field")}
              className={`px-[13px] py-[5px] rounded-[5px] text-[13px] transition-all flex items-center gap-[8px] ${
                activeView === "field"
                  ? "bg-white text-[#141517] font-medium shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                  : "text-[#54575F] font-normal hover:text-[#141517]"
              }`}
            >
              <span>Field Intake</span>
              {queuedCount > 0 && (
                <span className="font-mono text-[11px] bg-[#FEF3C7] text-[#B4690E] px-[5px] py-[1px] rounded-[3px] tabular-nums">
                  {queuedCount}
                </span>
              )}
            </button>
            <button
              onClick={() => onSwitchView("command")}
              className={`px-[13px] py-[5px] rounded-[5px] text-[13px] transition-all flex items-center gap-[8px] ${
                activeView === "command"
                  ? "bg-white text-[#141517] font-medium shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                  : "text-[#54575F] font-normal hover:text-[#141517]"
              }`}
            >
              <span>Command Board</span>
            </button>
          </nav>
        </div>

        {/* Right: Restrained Inline Telemetry Strip */}
        <div className="flex flex-wrap items-center justify-center lg:justify-end gap-[13px] text-[12px] font-mono tabular-nums text-[#54575F]">
          <button
            onClick={onToggleSimulatedOffline}
            title="Click to simulate a network dead zone (offline mode)"
            className={`cursor-pointer flex items-center gap-[8px] px-[13px] py-[5px] rounded-[5px] border transition-colors ${
              effectiveOnline
                ? "bg-white border-[#C9C9C0] text-[#186847] hover:bg-[#ECFDF5]/60 hover:border-[#186847]/50 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                : "bg-[#FDF2F0] border-[#E8B4AB] text-[#C9331B] font-medium hover:bg-[#FCE8E4]"
            }`}
          >
            {effectiveOnline ? (
              <>
                <Wifi className="w-[13px] h-[13px]" />
                <span>Online</span>
                <span className="text-[11px] font-sans text-[#868991]">· Test offline</span>
              </>
            ) : (
              <>
                <WifiOff className="w-[13px] h-[13px]" />
                <span>Dead Zone</span>
                <span className="text-[11px] font-sans text-[#C9331B]/80">· Go online</span>
              </>
            )}
          </button>

          <div className="flex items-center divide-x divide-[#E0E0DA] bg-[#F5F5F2] border border-[#E0E0DA] rounded-[5px] py-[5px]">
            <div className="px-[13px] flex items-center gap-[6px]">
              {telemetry.nanoState === "READY" ? (
                <>
                  <span className="inline-block w-[6px] h-[6px] rounded-full bg-[#186847] shadow-[0_0_6px_rgba(24,104,71,0.5)]" />
                  <span className="text-[#186847] font-medium">Gemini Nano Active</span>
                </>
              ) : telemetry.nanoState === "DOWNLOADING" ? (
                <>
                  <span className="inline-block w-[6px] h-[6px] rounded-full bg-[#B4690E]" />
                  <span className="text-[#B4690E]">Gemini Nano Syncing</span>
                </>
              ) : (
                <>
                  <span className="inline-block w-[6px] h-[6px] rounded-full bg-[#54575F]" />
                  <span className="text-[#54575F]">Local Edge Engine</span>
                </>
              )}
            </div>

            <div className="hidden sm:flex px-[13px] items-center gap-[5px]">
              <span className="text-[#868991]">FEMA</span>
              <span className="text-[#141517]">
                {telemetry.activeProtocol === "FLASH_FLOOD" ? "Flash Flood" : telemetry.activeProtocol === "EARTHQUAKE" ? "Earthquake" : "General"}
              </span>
            </div>

            <div className="px-[13px] flex items-center gap-[8px]">
              <span>
                <span className="text-[#868991]">Edge </span>
                <span className="text-[#141517] font-medium">{telemetry.reportsTriagedLocally}</span>
              </span>
              <span className="text-[#D2D2CA]">/</span>
              <span className="hidden md:inline">
                <span className="text-[#868991]">Cloud </span>
                <span className="text-[#141517] font-medium">{telemetry.cloudCallsCount}</span>
              </span>
              <span className="hidden md:inline text-[#D2D2CA]">/</span>
              <span>
                <span className="text-[#868991]">Raw Img </span>
                <span className="text-[#186847]">{telemetry.rawImagesUploaded}</span>
              </span>
              <span className="hidden xl:inline text-[#D2D2CA]">/</span>
              <span className="hidden xl:inline text-[#141517]">$0.00</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
