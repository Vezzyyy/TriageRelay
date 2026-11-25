import { useState, useEffect } from "react";
import { TopTelemetryBar } from "./components/TopTelemetryBar";
import { FieldIntakeView } from "./components/FieldIntakeView";
import { CommandBoardView } from "./components/CommandBoardView";
import { 
  checkGeminiNanoAvailability 
} from "./services/hybridAi";
import { 
  ensureAuthenticatedUser, 
  getActiveDisasterProtocol 
} from "./lib/firebase";
import { 
  subscribeToTriageReports, 
  flushOfflineQueue, 
  saveLocalCachedReports,
  clearAllReports 
} from "./services/storageQueue";
import type { TriageReport, TelemetryState } from "./types/triage";

export function App() {
  const [activeView, setActiveView] = useState<"field" | "command">("field");
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);
  const [reports, setReports] = useState<TriageReport[]>([]);
  
  const [telemetry, setTelemetry] = useState<TelemetryState>({
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    nanoState: "READY", // Default optimistic or checked
    activeProtocol: "EARTHQUAKE",
    reportsTriagedLocally: 0,
    cloudCallsCount: 0,
    rawImagesUploaded: 0,
    localComputeCostUsd: 0.00
  });

  // 1. App initialization: Auth, Remote Config, Hardware Detection
  useEffect(() => {
    // Silent anonymous auth
    ensureAuthenticatedUser().catch(console.warn);

    // Check Gemini Nano availability
    checkGeminiNanoAvailability().then((state) => {
      setTelemetry((prev) => ({ ...prev, nanoState: state }));
    });

    // Remote Config active protocol
    getActiveDisasterProtocol().then((protocol) => {
      setTelemetry((prev) => ({ ...prev, activeProtocol: protocol }));
    });

    // Network online/offline listeners
    const handleOnline = () => {
      setTelemetry((prev) => ({ ...prev, isOnline: true }));
      flushOfflineQueue().then((synced) => {
        if (synced > 0) {
          console.info(`Auto-synced ${synced} queued reports back to Firestore.`);
        }
      });
    };

    const handleOffline = () => {
      setTelemetry((prev) => ({ ...prev, isOnline: false }));
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Subscribe to reports (Firestore + IndexedDB offline cache)
    const unsubscribe = subscribeToTriageReports((updatedReports) => {
      setReports(updatedReports);
      setTelemetry((prev) => ({
        ...prev,
        reportsTriagedLocally: updatedReports.length
      }));
    });

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      unsubscribe();
    };
  }, []);

  // Handle report submission
  const handleReportSubmitted = (newReport: TriageReport) => {
    setReports((prev) => [newReport, ...prev.filter(r => r.report_id !== newReport.report_id)]);
  };

  // Toggle verification on Command Board
  const handleToggleVerifyReport = (reportId: string) => {
    const updated = reports.map((r) => {
      if (r.report_id === reportId) {
        return { ...r, verified_by_coordinator: !r.verified_by_coordinator };
      }
      return r;
    });
    setReports(updated);
    saveLocalCachedReports(updated);
  };

  const handleClearDatabase = async () => {
    await clearAllReports();
    setReports([]);
    setTelemetry((prev) => ({ ...prev, reportsTriagedLocally: 0, cloudCallsCount: 0 }));
  };

  const handleIncrementEdgeCount = () => {
    setTelemetry((prev) => ({
      ...prev,
      reportsTriagedLocally: prev.reportsTriagedLocally + 1
    }));
  };

  const handleIncrementCloudCount = () => {
    setTelemetry((prev) => ({
      ...prev,
      cloudCallsCount: prev.cloudCallsCount + 1
    }));
  };

  const queuedCount = reports.filter((r) => r.sync_status === "QUEUED_OFFLINE").length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-500/30">
      {/* Persistent Telemetry Bar */}
      <TopTelemetryBar
        telemetry={telemetry}
        activeView={activeView}
        onSwitchView={setActiveView}
        onToggleSimulatedOffline={() => setIsSimulatedOffline((prev) => !prev)}
        isSimulatedOffline={isSimulatedOffline}
        queuedCount={queuedCount}
      />

      {/* Main Viewport */}
      <main className="flex-1 pb-12">
        {activeView === "field" ? (
          <FieldIntakeView
            onReportSubmitted={handleReportSubmitted}
            onIncrementEdgeCount={handleIncrementEdgeCount}
            isSimulatedOffline={isSimulatedOffline}
          />
        ) : (
          <CommandBoardView
            reports={reports}
            onToggleVerifyReport={handleToggleVerifyReport}
            onIncrementCloudCount={handleIncrementCloudCount}
            onClearDatabase={handleClearDatabase}
          />
        )}
      </main>

      {/* High-Contrast Tactical Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 text-slate-500 text-xs py-4 px-6 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">TriageRelay</span>
            <span>•</span>
            <span>#BuildHybridAI 2026 Solo Entry</span>
            <span>•</span>
            <span className="text-emerald-400">Zero PII Wire Transmission</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Client: Chrome v139+ Gemini Nano</span>
            <span>•</span>
            <span>Cloud: Gemini 2.5 Flash + Google Search</span>
            <span>•</span>
            <span>Apache 2.0 Open Source</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
