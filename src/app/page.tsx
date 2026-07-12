import Link from "next/link";
import { MainNav } from "@/components/main-nav";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
          <h1 className="text-3xl font-semibold text-gray-900 sm:text-4xl">Prozorro Tender Automation MVP</h1>
          <p className="mt-4 max-w-3xl text-gray-600">
            Structured workflow for company profiles, tender requirement analysis, checklist validation, document generation,
            export, and admin-managed subscriptions.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/dashboard" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700">
              Open dashboard
            </Link>
            <Link href="/tenders" className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100">
              Go to tenders workspace
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
