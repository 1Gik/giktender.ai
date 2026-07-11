"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/companies", label: "Companies" },
  { href: "/tenders", label: "Tenders" },
  { href: "/generated", label: "Generated" },
  { href: "/settings", label: "Subscription" },
  { href: "/admin", label: "Admin" },
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
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-semibold text-gray-900">
          GikTender AI
        </Link>
        <nav className="flex flex-wrap gap-2 text-sm text-gray-700">
          {links.map((link) => {
            const isActive = pathname?.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-1.5 transition ${
                  isActive ? "bg-gray-900 text-white" : "hover:bg-gray-100"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={logout}
          className="ml-auto rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
