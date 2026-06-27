import Link from "next/link";
import { MainNav } from "@/components/main-nav";

const modules = [
  {
    title: "Авторизация",
    description: "Регистрация и вход пользователей с защищенной сессией.",
  },
  {
    title: "Управление компаниями",
    description: "Несколько профилей компаний с отдельными реквизитами и документами.",
  },
  {
    title: "Загрузка документов",
    description: "Загрузка пакета учредительных документов с отслеживанием сроков действия.",
  },
  {
    title: "Архитектура тендеров",
    description: "Подготовлены модели данных и API для анализа требований и генерации документов.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
          <h1 className="text-3xl font-semibold text-gray-900 sm:text-4xl">
            Автоматизация подготовки документов для тендеров
          </h1>
          <p className="mt-4 max-w-3xl text-gray-600">
            Платформа хранит базу документов компании, проверяет соответствие требованиям тендера и
            подготавливает данные для генерации недостающих документов.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
              Начать работу
            </Link>
            <Link href="/companies" className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100">
              Компании
            </Link>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          {modules.map((module) => (
            <article key={module.title} className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{module.title}</h2>
              <p className="mt-2 text-sm text-gray-600">{module.description}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
