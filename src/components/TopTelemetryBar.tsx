import React from "react";
import { 
  Wifi, 
  WifiOff, 
  Cpu, 
  ShieldCheck, 
  Layers, 
  DollarSign, 
  Radio,
  Server
} from "lucide-react";
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
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-slate-100 px-4 py-2.5 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Slogan */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 font-bold tracking-wider">
              <Radio className="w-4 h-4 animate-pulse text-red-500" />
            </div>
            <div>
              <span className="font-mono font-black text-lg tracking-wider text-slate-100 flex items-center gap-1.5">
                TRIAGE<span className="text-red-500">RELAY</span>
                <span className="text-[10px] font-sans font-semibold uppercase bg-red-950/80 text-red-300 border border-red-700/50 px-1.5 py-0.5 rounded">
                  v2026.1
                </span>
              </span>
            </div>
          </div>

          {/* Navigation Pill */}
          <nav className="flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-xs font-medium">
            <button
              onClick={() => onSwitchView("field")}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                activeView === "field"
                  ? "bg-red-600 text-white shadow-sm font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              Field Intake
              {queuedCount > 0 && (
                <span className="bg-amber-500/30 text-amber-300 text-[10px] px-1.5 py-0.2 rounded-full border border-amber-500/50">
                  {queuedCount}
                </span>
              )}
            </button>
            <button
              onClick={() => onSwitchView("command")}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                activeView === "command"
                  ? "bg-blue-600 text-white shadow-sm font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              Command Board
            </button>
          </nav>
        </div>

        {/* Live Hardware & Telemetry HUD */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono w-full md:w-auto justify-center md:justify-end">
          {/* Network State with Clickable Simulated Dead Zone Toggle */}
          <button
            onClick={onToggleSimulatedOffline}
            title="Click to simulate dead zone / offline mode"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all ${
              effectiveOnline
                ? "bg-emerald-950/50 border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/60"
                : "bg-red-950/60 border-red-500/60 text-red-300 font-bold hover:bg-red-900/80 animate-pulse-subtle"
            }`}
          >
            {effectiveOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span>ONLINE MESH</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-red-400" />
                <span>DEAD ZONE ACTIVE</span>
                <span className="text-[10px] bg-red-800 text-white px-1 rounded">SIM</span>
              </>
            )}
          </button>

          {/* Gemini Nano Hardware Status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>NANO:</span>
            <span className={`font-semibold ${
              telemetry.nanoState === "READY" ? "text-cyan-400" : "text-amber-400"
            }`}>
              {telemetry.nanoState}
            </span>
          </div>

          {/* Remote Config Protocol Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>CONFIG:</span>
            <span className="text-purple-300 font-semibold">{telemetry.activeProtocol}</span>
          </div>

          {/* Hard Privacy Guard Counter */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-300 font-semibold">{telemetry.reportsTriagedLocally}</span>
            <span className="text-slate-400">Edge</span>
          </div>

          {/* Local Token Cost: Always $0.00 */}
          <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
            <DollarSign className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-yellow-400 font-bold">$0.00</span>
            <span className="text-slate-500">Local HW</span>
          </div>
        </div>
      </div>
    </header>
  );
};
