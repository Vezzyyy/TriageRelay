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
            title="Toggle simulated dead zone (offline mode)"
            className={`flex items-center gap-[8px] px-[13px] py-[5px] rounded-[5px] border transition-colors ${
              effectiveOnline
                ? "bg-[#F5F5F2] border-[#E0E0DA] text-[#186847] hover:border-[#C9C9C0]"
                : "bg-[#FDF2F0] border-[#E8B4AB] text-[#C9331B] font-medium"
            }`}
          >
            {effectiveOnline ? (
              <>
                <Wifi className="w-[13px] h-[13px]" />
                <span>Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-[13px] h-[13px]" />
                <span>Dead Zone Mode</span>
              </>
            )}
          </button>

          <div className="flex items-center divide-x divide-[#E0E0DA] bg-[#F5F5F2] border border-[#E0E0DA] rounded-[5px] py-[5px]">
            <div className="px-[13px] flex items-center gap-[5px]">
              <span className="text-[#868991]">Nano</span>
              <span className={telemetry.nanoState === "READY" ? "text-[#186847]" : "text-[#54575F]"}>
                {telemetry.nanoState === "READY" ? "Ready" : telemetry.nanoState === "DOWNLOADING" ? "Syncing" : "Edge Fallback"}
              </span>
            </div>

            <div className="hidden sm:flex px-[13px] items-center gap-[5px]">
              <span className="text-[#868991]">Protocol</span>
              <span className="text-[#141517]">{telemetry.activeProtocol}</span>
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
