import Link from "next/link";
import { MainNav } from "@/components/main-nav";

export default function RequirementsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h1 className="text-2xl font-semibold text-gray-900">Requirements checklist</h1>
          <p className="mt-2 text-sm text-gray-600">
            Core checklist workspace is implemented in the tenders module with statuses: ✅ Available, 🤖 Auto-generate, ⚠ Missing, ❌ Blocked.
          </p>
          <Link href="/tenders" className="mt-4 inline-flex rounded-md bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700">
            Open tender workspace
          </Link>
        </div>
      </main>
    </div>
  );
}
