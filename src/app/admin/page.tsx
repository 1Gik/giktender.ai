"use client";

import { FormEvent, useEffect, useState } from "react";
import { MainNav } from "@/components/main-nav";

type AdminUser = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  subscriptions: Array<{ status: string; startsAt?: string | null; endsAt?: string | null }>;
  _count: { usageRecords: number; companies: number };
};

type UsagePayload = {
  metrics: { tenderCreated: number; parsed: number; generated: number };
};

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usage, setUsage] = useState<UsagePayload | null>(null);
  const [targetUserId, setTargetUserId] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [error, setError] = useState("");

  const load = async () => {
    const [usersResponse, usageResponse] = await Promise.all([
      fetch("/api/admin/users", { cache: "no-store" }),
      fetch("/api/admin/usage", { cache: "no-store" }),
    ]);

    if (!usersResponse.ok || !usageResponse.ok) {
      setError("Admin access required.");
      return;
    }

    const usersPayload = (await usersResponse.json()) as AdminUser[];
    setUsers(usersPayload);
    if (usersPayload[0] && !targetUserId) {
      setTargetUserId(usersPayload[0].id);
    }

    setUsage((await usageResponse.json()) as UsagePayload);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSetSubscription = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const response = await fetch("/api/admin/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: targetUserId,
        status,
      }),
    });

    if (!response.ok) {
      setError("Failed to update subscription.");
      return;
    }

    await load();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 space-y-4">
        <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h1 className="text-2xl font-semibold">Admin panel</h1>
          <p className="mt-2 text-sm text-gray-600">Manage users, subscriptions, and usage for manual MVP billing flow.</p>
          {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
          <p className="mt-3 text-sm text-gray-700">
            Usage: tenders {usage?.metrics.tenderCreated ?? "..."} · parsed {usage?.metrics.parsed ?? "..."} · generated {usage?.metrics.generated ?? "..."}
          </p>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h2 className="text-lg font-semibold">Users</h2>
            <ul className="mt-3 space-y-2">
              {users.map((user) => (
                <li key={user.id} className="rounded border border-gray-200 p-3 text-sm">
                  <p className="font-medium">{user.fullName} ({user.email})</p>
                  <p className="text-xs text-gray-500">
                    role: {user.role} · companies: {user._count.companies} · usage records: {user._count.usageRecords}
                  </p>
                  <p className="text-xs text-gray-500">
                    subscription: {user.subscriptions[0]?.status ?? "INACTIVE"}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <aside className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h2 className="text-lg font-semibold">Set subscription</h2>
            <form className="mt-4 space-y-3" onSubmit={onSetSubscription}>
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                value={targetUserId}
                onChange={(event) => setTargetUserId(event.target.value)}
              >
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.email}
                  </option>
                ))}
              </select>
              <select className="w-full rounded-md border border-gray-300 px-3 py-2" value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
              <button type="submit" className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700">
                Save
              </button>
            </form>
          </aside>
        </section>
      </main>
    </div>
  );
}
