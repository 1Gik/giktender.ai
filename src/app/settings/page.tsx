"use client";

import { useEffect, useState } from "react";
import { MainNav } from "@/components/main-nav";

type DashboardPayload = {
  subscription: { active: boolean };
  usage: { tendersCreated: number; freeTenderRemaining: boolean };
};

export default function SettingsPage() {
  const [data, setData] = useState<DashboardPayload | null>(null);

  useEffect(() => {
    (async () => {
      const response = await fetch("/api/dashboard", { cache: "no-store" });
      if (!response.ok) return;
      setData((await response.json()) as DashboardPayload);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h1 className="text-2xl font-semibold text-gray-900">Subscription</h1>
          <p className="mt-2 text-sm text-gray-600">MVP billing flow: first tender is free, then access is manually activated by admin.</p>
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-gray-700">
            <li>First tender free: {data?.usage.freeTenderRemaining ? "yes" : "already used"}</li>
            <li>Created tenders: {data?.usage.tendersCreated ?? "..."}</li>
            <li>Subscription active: {data?.subscription.active ? "yes" : "no"}</li>
            <li>Payment channel: Telegram + manual card transfer + admin activation.</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
