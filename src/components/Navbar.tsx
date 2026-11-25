import React from "react";
import { Wifi, WifiOff } from "lucide-react";

interface NavbarProps {
  currentPage: "report" | "dispatch";
  onNavigate: (path: "/report" | "/dispatch") => void;
  isOnline: boolean;
  isSimulatedOffline: boolean;
  onToggleOffline: () => void;
  queuedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  isOnline,
  isSimulatedOffline,
  onToggleOffline,
  queuedCount
}) => {
  const effectiveOnline = isOnline && !isSimulatedOffline;

  const handleLinkClick = (e: React.MouseEvent, path: "/report" | "/dispatch") => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
    e.preventDefault();
    onNavigate(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E0E0DA]">
      <div className="max-w-[1360px] mx-auto px-[21px] py-[13px] flex items-center justify-between gap-[13px]">
        <div className="flex items-center gap-[21px]">
          <a
            href="/report"
            onClick={(e) => handleLinkClick(e, "/report")}
            className="flex items-center gap-[8px] text-[15px] tracking-[-0.015em] font-semibold text-[#141517]"
          >
            <span className="inline-block w-[8px] h-[8px] rounded-[2px] bg-[#C9331B]" />
            <span>TriageRelay</span>
          </a>

          <nav
            aria-label="Pages"
            className="flex items-center bg-[#ECECE7] p-[3px] rounded-[8px] border border-[#E0E0DA]/70"
          >
            <a
              href="/report"
              onClick={(e) => handleLinkClick(e, "/report")}
              className={`px-[13px] py-[5px] rounded-[5px] text-[13px] transition-all flex items-center gap-[8px] ${
                currentPage === "report"
                  ? "bg-white text-[#141517] font-medium shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                  : "text-[#54575F] hover:text-[#141517]"
              }`}
            >
              <span>Report</span>
            </a>

            <a
              href="/dispatch"
              onClick={(e) => handleLinkClick(e, "/dispatch")}
              className={`px-[13px] py-[5px] rounded-[5px] text-[13px] transition-all flex items-center gap-[8px] ${
                currentPage === "dispatch"
                  ? "bg-white text-[#141517] font-medium shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                  : "text-[#54575F] hover:text-[#141517]"
              }`}
            >
              <span>Dispatch</span>
              {queuedCount > 0 && (
                <span className="font-mono text-[11px] bg-[#FEF3C7] text-[#B4690E] px-[5px] py-[1px] rounded-[3px] tabular-nums">
                  {queuedCount}
                </span>
              )}
            </a>
          </nav>
        </div>

        <button
          onClick={onToggleOffline}
          title={effectiveOnline ? "Switch to offline mode" : "Restore online connection"}
          className={`cursor-pointer flex items-center gap-[8px] px-[13px] py-[5px] rounded-[5px] border text-[12px] font-mono transition-colors ${
            effectiveOnline
              ? "bg-white border-[#E0E0DA] text-[#186847] hover:border-[#C9C9C0]"
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
              <span>Offline</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
