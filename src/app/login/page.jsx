"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { getSession, setSession } from "@/app/utils/cookies";

// Import komponen UI dan ikon
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, LogIn, User, KeyRound } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Cek session, jika sudah login redirect ke halaman utama
  useEffect(() => {
    const session = getSession();
    if (session) {
      router.push("/"); // redirect ke home jika sudah login
    }
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const q = query(collection(db, "users"), where("name", "==", name));
      const snapshot = await getDocs(q);

      if (snapshot.empty) throw new Error("Nama atau password salah.");

      const userData = snapshot.docs[0].data();

      if (userData.password !== password)
        throw new Error("Nama atau password salah.");

      if (!userData.active)
        throw new Error("Akun ini tidak aktif. Hubungi admin.");

      setSession({ name: userData.name, role: userData.role });
      router.push("/");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-slate-50 ">
      <div className="flex min-h-screen items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-0 shadow-xl shadow-slate-200">
            <CardContent className="p-8">
              <div className="mb-6 text-center">
                <h1 className="text-3xl font-bold tracking-tight text-slate-800">
                  CashFlowin
                </h1>
                <p className="mt-2 text-slate-500">
                  Kelola Keuangan, Rasakan Perubahan.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                {errorMsg && (
                  <div className="flex items-center gap-x-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <p>{errorMsg}</p>
                  </div>
                )}

                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama Pengguna"
                    required
                    className="pl-9"
                  />
                </div>

                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    className="pl-9"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 font-semibold text-white transition-all hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Login"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
