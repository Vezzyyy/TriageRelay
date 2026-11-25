import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc,
  getDocs,
  onSnapshot, 
  query, 
  orderBy, 
  type Unsubscribe 
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { TriageReport } from "../types/triage";

const LOCAL_STORAGE_KEY = "triagerelay_offline_reports_v1";

/**
 * Completely purges all local and remote reports (clean slate)
 */
export async function clearAllReports(): Promise<void> {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    if (navigator.onLine) {
      const reportsCollection = collection(db, "triage_reports");
      const snapshot = await getDocs(reportsCollection);
      const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, "triage_reports", d.id)));
      await Promise.all(deletePromises);
    }
  } catch (err) {
    console.error("Failed to clear reports:", err);
  }
}

/**
 * Loads cached reports from local browser storage
 */
export function getLocalCachedReports(): TriageReport[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Failed to read local offline reports:", err);
    return [];
  }
}

/**
 * Saves reports locally to ensure zero data loss during total network outage
 */
export function saveLocalCachedReports(reports: TriageReport[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reports));
  } catch (err) {
    console.error("Failed to cache offline reports:", err);
  }
}

/**
 * Adds a new report: immediately stores in local cache, then attempts Firestore write
 */
export async function submitTriageReport(report: TriageReport): Promise<TriageReport> {
  const current = getLocalCachedReports();
  const updated = [report, ...current.filter(r => r.report_id !== report.report_id)];
  saveLocalCachedReports(updated);

  // Attempt Firestore write (handled seamlessly by Firestore persistent cache even offline)
  try {
    const reportRef = doc(db, "triage_reports", report.report_id);
    await setDoc(reportRef, {
      ...report,
      sync_status: navigator.onLine ? "SYNCED" : "QUEUED_OFFLINE"
    }, { merge: true });

    if (navigator.onLine) {
      report.sync_status = "SYNCED";
      saveLocalCachedReports(
        updated.map(r => r.report_id === report.report_id ? { ...r, sync_status: "SYNCED" } : r)
      );
    }
  } catch (err) {
    console.info("Firestore setDoc buffered to offline cache:", err);
  }

  return report;
}

/**
 * Subscribes to live Firestore triage updates (with automatic offline fallback)
 */
export function subscribeToTriageReports(
  onUpdate: (reports: TriageReport[]) => void
): Unsubscribe {
  const reportsCollection = collection(db, "triage_reports");
  const q = query(reportsCollection, orderBy("created_offline_at", "desc"));

  // Initial trigger with locally cached data for instant zero-latency UI load
  const cached = getLocalCachedReports();
  if (cached.length > 0) {
    onUpdate(cached);
  }

  return onSnapshot(
    q,
    (snapshot) => {
      const liveReports: TriageReport[] = [];
      snapshot.forEach(docSnap => {
        liveReports.push(docSnap.data() as TriageReport);
      });

      // Merge local un-synced items with cloud items
      const localOnly = getLocalCachedReports().filter(
        loc => !liveReports.some(rem => rem.report_id === loc.report_id)
      );

      const merged = [...localOnly, ...liveReports];
      saveLocalCachedReports(merged);
      onUpdate(merged);
    },
    (err) => {
      console.warn("Firestore snapshot listener offline mode, falling back to local storage cache:", err);
      onUpdate(getLocalCachedReports());
    }
  );
}

/**
 * Flushes all pending offline reports when network connectivity returns
 */
export async function flushOfflineQueue(): Promise<number> {
  if (!navigator.onLine) return 0;
  const current = getLocalCachedReports();
  const queued = current.filter(r => r.sync_status === "QUEUED_OFFLINE");
  let syncedCount = 0;

  for (const rep of queued) {
    try {
      const ref = doc(db, "triage_reports", rep.report_id);
      await setDoc(ref, { ...rep, sync_status: "SYNCED" }, { merge: true });
      rep.sync_status = "SYNCED";
      syncedCount++;
    } catch (err) {
      console.warn(`Failed to sync queued report ${rep.report_id}:`, err);
    }
  }

  if (syncedCount > 0) {
    saveLocalCachedReports(current);
  }

  return syncedCount;
}
