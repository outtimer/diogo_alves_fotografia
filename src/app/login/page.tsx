"use client";

import { login } from "@/app/admin/actions";
import { useState, useTransition } from "react";
import { ArrowRight, Lock, ShieldCheck } from "lucide-react";
import Logo from "@/components/Logo";
import Link from "next/link";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="min-h-screen bg-[#fbfbf8] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <Link href="/" className="inline-block group mb-8">
            <Logo className="w-12 h-12 text-zinc-950 group-hover:scale-110 transition-transform duration-500 mx-auto" />
          </Link>
          <h1 className="font-display text-4xl text-zinc-950 italic">Acesso Restrito</h1>
          <p className="text-[10px] uppercase tracking-[0.4em] mt-4 opacity-40 font-medium">Área Administrativa</p>
        </div>

        <div className="bg-white border border-zinc-100 p-10 shadow-sm">
          <form action={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.4em] opacity-40 mb-4 font-bold flex items-center">
                <Lock size={12} className="mr-2" /> Senha de Acesso
              </label>
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full bg-zinc-50 border border-zinc-100 p-4 text-sm focus:outline-none focus:border-zinc-900 transition-colors tracking-widest"
              />
            </div>

            {error && (
              <p className="text-red-500 text-[10px] uppercase tracking-widest font-bold text-center">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-zinc-950 text-white text-[10px] uppercase tracking-[0.3em] py-5 hover:bg-zinc-800 transition-colors font-bold flex items-center justify-center group disabled:opacity-50"
            >
              {isPending ? "Validando..." : "Entrar no Dashboard"}
              {!isPending && <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>
        </div>

        <p className="mt-12 text-center text-[9px] uppercase tracking-[0.3em] opacity-30">
          Aura Portfolio © 2024
        </p>
      </div>
    </div>
  );
}
