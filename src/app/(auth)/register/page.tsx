"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email, password }),
    });

    if (!response.ok) {
      setLoading(false);
      setError("Не удалось создать аккаунт. Проверьте данные или попробуйте другой email.");
      return;
    }

    router.push("/companies");
    router.refresh();
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-10">
      <form onSubmit={onSubmit} className="w-full rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h1 className="text-2xl font-semibold text-gray-900">Регистрация</h1>
        <p className="mt-2 text-sm text-gray-600">Создайте аккаунт и начните вести пакет документов компаний.</p>

        <label className="mt-4 block text-sm font-medium text-gray-700">ФИО</label>
        <input
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          minLength={2}
          required
        />

        <label className="mt-4 block text-sm font-medium text-gray-700">Email</label>
        <input
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <label className="mt-4 block text-sm font-medium text-gray-700">Пароль</label>
        <input
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={8}
          required
        />

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-60"
        >
          {loading ? "Создание..." : "Создать аккаунт"}
        </button>

        <p className="mt-4 text-sm text-gray-600">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="font-medium text-gray-900 underline">
            Войти
          </Link>
        </p>
      </form>
    </main>
  );
}
