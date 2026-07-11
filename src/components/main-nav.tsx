"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/companies", label: "🏢 Компанії" },
  { href: "/documents", label: "📁 Документи" },
  { href: "/tenders", label: "📄 Тендери" },
  { href: "/requirements", label: "🤖 Аналіз" },
  { href: "/generated", label: "📑 Згенеровані документи" },
  { href: "/settings", label: "⚙ Налаштування" },
  { href: "/admin", label: "🔐 Адмін-панель" },
];

export function MainNav() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-gray-200 bg-white lg:block">
        <div className="flex h-full flex-col p-6">
          <Link href="/dashboard" className="text-xl font-semibold text-gray-900">
            GikTender AI
          </Link>
          <p className="mt-1 text-sm text-gray-500">Tender Ops Workspace</p>
          <nav className="mt-8 space-y-1 text-sm text-gray-700">
            {links.map((link) => {
              const isActive = pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block rounded-xl px-3 py-2.5 transition ${
                    isActive ? "bg-gray-900 text-white" : "hover:bg-gray-100"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
      <header className="fixed left-0 right-0 top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur-sm lg:left-72">
        <div className="flex items-center gap-3 px-4 py-3 lg:px-8">
          <Link href="/dashboard" className="text-lg font-semibold text-gray-900 lg:hidden">
            GikTender AI
          </Link>
          <input
            type="search"
            placeholder="Пошук компанії, тендера або документа"
            className="h-10 w-full max-w-xl rounded-xl border border-gray-300 bg-gray-50 px-3 text-sm outline-none ring-blue-500 focus:ring-2"
          />
          <button
            type="button"
            className="h-10 rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-700 hover:bg-gray-50"
            aria-label="Сповіщення"
          >
            🔔
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-sm font-semibold text-white">UA</div>
          <button
            type="button"
            onClick={logout}
            className="h-10 rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-700 hover:bg-gray-50"
          >
            Вийти
          </button>
        </div>
      </header>
    </>
  );
}
