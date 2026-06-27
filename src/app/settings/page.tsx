import { MainNav } from "@/components/main-nav";

export default function PlaceholderPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h1 className="text-2xl font-semibold text-gray-900">Раздел в разработке</h1>
          <p className="mt-2 text-sm text-gray-600">
            Архитектура и API подготовлены. Следующий этап — реализация анализа требований и генерации документов.
          </p>
        </div>
      </main>
    </div>
  );
}
