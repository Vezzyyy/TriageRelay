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
  clearAllReports,
  getLocalCachedReports
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
    // Edge count is derived directly from reports.length to prevent snapshot double-counting
  };

  const handleIncrementCloudCount = () => {
    setTelemetry((prev) => ({
      ...prev,
      cloudCallsCount: prev.cloudCallsCount + 1
    }));
  };

  const handleToggleSimulatedOffline = async () => {
    const nextOffline = !isSimulatedOffline;
    setIsSimulatedOffline(nextOffline);
    if (!nextOffline && navigator.onLine) {
      const synced = await flushOfflineQueue();
      if (synced > 0) {
        setReports(getLocalCachedReports());
      }
    }
  };

  const queuedCount = reports.filter((r) => r.sync_status === "QUEUED_OFFLINE").length;

  return (
    <div className="min-h-screen bg-[#F5F5F2] text-[#141517] flex flex-col font-sans selection:bg-[#C9331B]/15 selection:text-[#141517]">
      {/* Persistent Telemetry Bar */}
      <TopTelemetryBar
        telemetry={{ ...telemetry, reportsTriagedLocally: reports.length }}
        activeView={activeView}
        onSwitchView={setActiveView}
        onToggleSimulatedOffline={handleToggleSimulatedOffline}
        isSimulatedOffline={isSimulatedOffline}
        queuedCount={queuedCount}
      />

      {/* Main Viewport */}
      <main className="flex-1 pb-[34px]">
        {activeView === "field" ? (
          <FieldIntakeView
            onReportSubmitted={handleReportSubmitted}
            onIncrementEdgeCount={handleIncrementEdgeCount}
            isSimulatedOffline={isSimulatedOffline}
            reports={reports}
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

      {/* Restrained Architectural Footer */}
      <footer className="border-t border-[#E0E0DA] bg-[#F5F5F2] text-[#868991] text-[12px] py-[13px] px-[21px] font-mono">
        <div className="max-w-[1360px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-[8px]">
          <div className="flex items-center gap-[8px]">
            <span className="text-[#141517] font-medium">TriageRelay</span>
            <span>/</span>
            <span>#BuildHybridAI 2026</span>
            <span>/</span>
            <span className="text-[#186847]">Zero-PII Wire</span>
          </div>

          <div className="flex items-center gap-[13px] text-[#868991]">
            <span>Edge: Gemini Nano</span>
            <span>·</span>
            <span>Cloud: Gemini 2.5 Flash</span>
            <span>·</span>
            <span>Apache 2.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
