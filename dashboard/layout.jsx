import React from "react";
import Header from "./_components/Header";
import MediaCleanupGuard from "@/components/MediaCleanupGuard";

function DashboardLayout({ children }) {
  return (
    <MediaCleanupGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header />
        <div>{children}</div>
      </div>
    </MediaCleanupGuard>
  );
}

export default DashboardLayout;
