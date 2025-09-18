"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/app/utils/cookies";
import KeuanganForm from "@/components/KeuanganForm";
import KeuanganTable from "@/components/KeuanganTable";
import LogoutButton from "@/components/Auth/Logout";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [refresh, setRefresh] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const handleRefresh = () => setRefresh(!refresh);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push("/login"); // Redirect jika tidak ada session
    } else {
      setIsLoading(false); // Sesi ditemukan, berhenti loading
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">
              CashFlowin
            </h1>
            <p className="mt-1 text-slate-500">
              Kelola Keuangan, Rasakan Perubahan
            </p>
          </div>
          <LogoutButton />
        </div>

        <div>
          <KeuanganForm onAdd={handleRefresh} />
        </div>
        <div className="mt-6">
          <h2 className="mb-4 text-xl font-semibold text-slate-700">
            Riwayat Transaksi
          </h2>
          <KeuanganTable refresh={refresh} />
        </div>
      </div>

      <footer>
        <div className="mx-auto max-w-4xl px-4 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} All rights reserved | Azka Bariqlana
        </div>
      </footer>
    </main>
  );
}
