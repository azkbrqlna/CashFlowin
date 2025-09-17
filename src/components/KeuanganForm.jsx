"use client";

import { useState, useEffect } from "react";
import { db } from "@/app/lib/firebase";
import { collection, addDoc, Timestamp, getDocs } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { motion } from "framer-motion";
import { PlusCircle, Wallet } from "lucide-react";
import { useToast } from "./ui/toaster";

export default function KeuanganForm({ onAdd }) {
  const { toast } = useToast();
  const [tanggal, setTanggal] = useState("");
  const [pemasukan, setPemasukan] = useState("");
  const [ketPemasukan, setKetPemasukan] = useState("");
  const [pengeluaran, setPengeluaran] = useState("");
  const [ketPengeluaran, setKetPengeluaran] = useState("");
  const [saldo, setSaldo] = useState(0);
  const [loading, setLoading] = useState(false);

  const SALDO_AWAL = 0;

  // Fetch saldo dari database
  const fetchSaldo = async () => {
    const snapshot = await getDocs(collection(db, "keuangan"));
    const data = snapshot.docs.map((doc) => doc.data());

    const totalPemasukan = data.reduce(
      (sum, item) => sum + (item.pemasukan || 0),
      0
    );
    const totalPengeluaran = data.reduce(
      (sum, item) => sum + (item.pengeluaran || 0),
      0
    );

    setSaldo(SALDO_AWAL + totalPemasukan - totalPengeluaran);
  };

  useEffect(() => {
    fetchSaldo();
  }, []);

  // Simpan transaksi baru
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (parseFloat(pemasukan) > 20000000) {
      toast({
        title: "Batas Maksimal",
        description: "Pemasukan tidak boleh lebih dari Rp 20.000.000",
        variant: "error",
      });
      return;
    }

    if (parseFloat(pengeluaran) > 20000000) {
      toast({
        title: "Batas Maksimal",
        description: "Pengeluaran tidak boleh lebih dari Rp 20.000.000",
        variant: "error",
      });
      return;
    }

    setLoading(true);
    const jumlah =
      (parseFloat(pemasukan) || 0) - (parseFloat(pengeluaran) || 0);

    try {
      await addDoc(collection(db, "keuangan"), {
        tanggal: tanggal ? new Date(tanggal) : Timestamp.now(),
        pemasukan: parseFloat(pemasukan) || 0,
        ket_pemasukan: ketPemasukan,
        pengeluaran: parseFloat(pengeluaran) || 0,
        ket_pengeluaran: ketPengeluaran,
        jumlah,
        created_at: Timestamp.now(),
      });

      onAdd();
      fetchSaldo();
      setLoading(false);

      // Reset form
      setTanggal("");
      setPemasukan("");
      setKetPemasukan("");
      setPengeluaran("");
      setKetPengeluaran("");

      toast({
        title: "Berhasil Menyimpan",
        description: "Transaksi berhasil ditambahkan.",
        variant: "success",
      });
    } catch (error) {
      setLoading(false);
      toast({
        title: "Gagal Menyimpan",
        description: error.message,
        variant: "error",
      });
    }
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(number);
  };

  return (
    <div className="space-y-8">
      {/* Saldo saat ini */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-6 rounded-2xl shadow-lg max-w-4xl mx-auto"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Saldo Saat Ini</h2>
            <p className="text-2xl font-bold mt-1">{formatRupiah(saldo)}</p>
          </div>
          <Wallet className="w-12 h-12 opacity-80" />
        </div>
      </motion.div>

      {/* Form transaksi */}
      <Card className="shadow-md border border-gray-200 max-w-4xl w-full mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Tambah Transaksi</CardTitle>
          <p className="text-sm text-gray-500">
            Catat pemasukan dan pengeluaran dengan rapi untuk laporan keuangan.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Grid form */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Tanggal
                </label>
                <Input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  required
                  className="focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Pemasukan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Pemasukan
                  </label>
                  <Input
                    type="number"
                    placeholder="Masukkan jumlah pemasukan"
                    value={pemasukan}
                    onChange={(e) => setPemasukan(e.target.value)}
                    disabled={pengeluaran !== ""} // Disable jika pengeluaran diisi
                    max={20000000}
                    className="focus:ring-2 focus:ring-blue-500"
                  />
                  {pemasukan > 20000000 && (
                    <p className="text-red-500 text-sm mt-1">
                      Maksimal pemasukan adalah Rp 20.000.000
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Keterangan Pemasukan
                  </label>
                  <Input
                    placeholder="Contoh: Gaji bulan ini"
                    value={ketPemasukan}
                    onChange={(e) => setKetPemasukan(e.target.value)}
                    disabled={pengeluaran !== ""}
                    className="focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Pengeluaran */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Pengeluaran
                </label>
                <Input
                  type="number"
                  placeholder="Masukkan jumlah pengeluaran"
                  value={pengeluaran}
                  onChange={(e) => setPengeluaran(e.target.value)}
                  disabled={pemasukan !== ""} // Disable jika pemasukan diisi
                  max={20000000}
                  className="focus:ring-2 focus:ring-red-500"
                />
                {pengeluaran > 20000000 && (
                  <p className="text-red-500 text-sm mt-1">
                    Maksimal pengeluaran adalah Rp 20.000.000
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Keterangan Pengeluaran
                </label>
                <Input
                  placeholder="Contoh: Belanja bulanan"
                  value={ketPengeluaran}
                  onChange={(e) => setKetPengeluaran(e.target.value)}
                  disabled={pemasukan !== ""}
                  className="focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-lg py-3"
              disabled={loading}
            >
              {loading ? (
                "Menyimpan..."
              ) : (
                <>
                  <PlusCircle className="mr-2 w-5 h-5" /> Simpan
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
