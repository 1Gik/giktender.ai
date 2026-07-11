"use client";

import { useEffect, useState } from "react";
import { MainNav } from "@/components/main-nav";

type DashboardPayload = {
  user: { fullName: string; email: string };
  companies: Array<{ id: string; name: string; legalForm: string }>;
  recentTenders: Array<{ id: string; title: string; parseStatus: string; company: { name: string } }>;
  subscription: { active: boolean };
  usage: { tendersCreated: number; freeTenderRemaining: boolean };
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const response = await fetch("/api/dashboard", { cache: "no-store" });
      if (!response.ok) {
        setError("Please login to view dashboard.");
        return;
      }
      setData((await response.json()) as DashboardPayload);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 space-y-4">
        <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
          {data ? (
            <>
              <p className="mt-2 text-sm text-gray-600">{data.user.fullName} · {data.user.email}</p>
              <p className="mt-1 text-sm text-gray-600">
                Subscription: {data.subscription.active ? "✅ Active" : "⚠ Inactive"} · Tenders created: {data.usage.tendersCreated}
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-gray-600">Loading...</p>
          )}
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h2 className="text-lg font-semibold">Company profiles</h2>
            <ul className="mt-3 space-y-2 text-sm text-gray-700">
              {data?.companies.map((company) => (
                <li key={company.id} className="rounded border border-gray-200 p-3">
                  {company.legalForm} {company.name}
                </li>
              ))}
              {!data?.companies.length ? <li className="text-gray-500">No companies yet.</li> : null}
            </ul>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h2 className="text-lg font-semibold">Recent tenders</h2>
            <ul className="mt-3 space-y-2 text-sm text-gray-700">
              {data?.recentTenders.map((tender) => (
                <li key={tender.id} className="rounded border border-gray-200 p-3">
                  <p className="font-medium">{tender.title}</p>
                  <p className="text-xs text-gray-500">{tender.company.name} · {tender.parseStatus}</p>
                </li>
              ))}
              {!data?.recentTenders.length ? <li className="text-gray-500">No tenders yet.</li> : null}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
