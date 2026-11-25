import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { ReportPage } from "./pages/ReportPage";
import { DispatchPage } from "./pages/DispatchPage";
import {
  ensureAuthenticatedUser,
  getActiveDisasterProtocol
} from "./lib/firebase";
import {
  subscribeToTriageReports,
  flushOfflineQueue,
  clearAllReports,
  getLocalCachedReports,
  updateReportVerification
} from "./services/storageQueue";
import type { TriageReport } from "./types/triage";

function resolvePageFromPath(pathname: string): "report" | "dispatch" {
  const clean = pathname.toLowerCase().replace(/\/+$/, "");
  if (clean === "/dispatch" || clean === "/command") {
    return "dispatch";
  }
  return "report";
}

export function App() {
  const [currentPage, setCurrentPage] = useState<"report" | "dispatch">(() =>
    typeof window !== "undefined" ? resolvePageFromPath(window.location.pathname) : "report"
  );
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);
  const [reports, setReports] = useState<TriageReport[]>([]);

  // Update browser tab title per page
  useEffect(() => {
    document.title =
      currentPage === "dispatch"
        ? "TriageRelay — Dispatch Center"
        : "TriageRelay — Report Incident";
  }, [currentPage]);

  // Browser history popstate listener for clean two-page URLs
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPage(resolvePageFromPath(window.location.pathname));
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Auth, Remote Config, Network status, and Real-time Report Sync
  useEffect(() => {
    ensureAuthenticatedUser().catch(console.warn);
    getActiveDisasterProtocol().catch(console.warn);

    const handleOnline = () => {
      setIsOnline(true);
      flushOfflineQueue().then((synced) => {
        if (synced > 0) {
          setReports(getLocalCachedReports());
        }
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const unsubscribe = subscribeToTriageReports((updatedReports) => {
      setReports(updatedReports);
    });

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      unsubscribe();
    };
  }, []);

  const handleNavigate = (path: "/report" | "/dispatch") => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
    }
    setCurrentPage(resolvePageFromPath(path));
  };

  const handleReportSubmitted = (newReport: TriageReport) => {
    setReports((prev) => [newReport, ...prev.filter((r) => r.report_id !== newReport.report_id)]);
  };

  const handleToggleVerifyReport = async (reportId: string) => {
    const target = reports.find((r) => r.report_id === reportId);
    if (!target) return;
    const updated = await updateReportVerification(
      reportId,
      !target.verified_by_coordinator,
      isSimulatedOffline
    );
    setReports(updated);
  };

  const handleClearDatabase = async () => {
    await clearAllReports();
    setReports([]);
  };

  const handleToggleOffline = async () => {
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
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        isOnline={isOnline}
        isSimulatedOffline={isSimulatedOffline}
        onToggleOffline={handleToggleOffline}
        queuedCount={queuedCount}
      />

      <main className="flex-1 pb-[34px]">
        {currentPage === "report" ? (
          <ReportPage
            onReportSubmitted={handleReportSubmitted}
            isSimulatedOffline={isSimulatedOffline}
            reports={reports}
          />
        ) : (
          <DispatchPage
            reports={reports}
            onToggleVerifyReport={handleToggleVerifyReport}
            onClearDatabase={handleClearDatabase}
          />
        )}
      </main>
    </div>
  );
}

export default App;
