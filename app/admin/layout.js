"use client";

import { useState } from "react";
import AuthGuard from "../../components/AuthGuard";
import AdminNav from "../../components/AdminNav";

export default function AdminLayout({ children }) {
  const [dark, setDark] = useState(false);

  return (
    <AuthGuard roles={["ADMIN", "MESERO"]}>
      {(user) => (
        <div className={dark ? "dark" : ""}>
          <div className="min-h-screen bg-paper text-ink dark:bg-ink dark:text-paper">
            <AdminNav user={user} dark={dark} onToggleDark={() => setDark((d) => !d)} />
            <div className="p-5">{children}</div>
          </div>
        </div>
      )}
    </AuthGuard>
  );
}
