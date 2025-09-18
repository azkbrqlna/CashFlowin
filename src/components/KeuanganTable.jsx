"use client";

import { useState, useEffect } from "react";
import { db } from "@/app/lib/firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Download, ArrowUpCircle, ArrowDownCircle } from "lucide-react";

import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  WidthType,
  TextRun,
  AlignmentType,
} from "docx";
import { saveAs } from "file-saver";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function KeuanganTable({ refresh }) {
  const [data, setData] = useState([]);
  const [saldo, setSaldo] = useState(0);
  const [saldoAwal, setSaldoAwal] = useState(0);

  const [selectedMonth, setSelectedMonth] = useState(
    String(new Date().getMonth() + 1)
  );
  const [selectedYear, setSelectedYear] = useState(
    String(new Date().getFullYear())
  );

  const SALDO_AWAL = 0;

  const fetchData = async () => {
    const q = query(collection(db, "keuangan"), orderBy("created_at", "asc"));
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })); // Filter transaksi bulan & tahun yang dipilih

    const filtered = docs.filter((item) => {
      if (!item.tanggal?.toDate) return false;
      const date = item.tanggal.toDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      return (
        month === parseInt(selectedMonth) && year === parseInt(selectedYear)
      );
    }); // Hitung saldo awal bulan

    const saldoSebelumnya = docs
      .filter((item) => {
        if (!item.tanggal?.toDate) return false;
        const date = item.tanggal.toDate();
        return (
          date.getFullYear() < parseInt(selectedYear) ||
          (date.getFullYear() === parseInt(selectedYear) &&
            date.getMonth() + 1 < parseInt(selectedMonth))
        );
      })
      .reduce(
        (sum, item) => sum + (item.pemasukan || 0) - (item.pengeluaran || 0),
        0
      );

    setSaldoAwal(SALDO_AWAL + saldoSebelumnya);

    const totalPemasukan = filtered.reduce(
      (sum, item) => sum + (item.pemasukan || 0),
      0
    );
    const totalPengeluaran = filtered.reduce(
      (sum, item) => sum + (item.pengeluaran || 0),
      0
    );

    setSaldo(SALDO_AWAL + saldoSebelumnya + totalPemasukan - totalPengeluaran);
    setData(filtered);
  };

  useEffect(() => {
    fetchData();
  }, [refresh, selectedMonth, selectedYear]);

  const formatRupiah = (number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(number);

  const downloadWord = () => {
    const header = [
      "No",
      "Tanggal",
      "Pemasukan",
      "Ket. Pemasukan",
      "Pengeluaran",
      "Ket. Pengeluaran",
      "Jumlah",
    ];

    const tableRows = [
      new TableRow({
        children: header.map(
          (text) =>
            new TableCell({
              width: { size: 14, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  children: [new TextRun({ text, bold: true })],
                }),
              ],
            })
        ),
      }),
    ];

    data.forEach((row, index) => {
      tableRows.push(
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(String(index + 1))] }),
            new TableCell({
              children: [
                new Paragraph(
                  row.tanggal?.toDate
                    ? row.tanggal.toDate().toLocaleDateString("id-ID", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : ""
                ),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph(
                  row.pemasukan ? formatRupiah(row.pemasukan) : "-"
                ),
              ],
            }),
            new TableCell({
              children: [new Paragraph(row.ket_pemasukan || "-")],
            }),
            new TableCell({
              children: [
                new Paragraph(
                  row.pengeluaran ? formatRupiah(row.pengeluaran) : "-"
                ),
              ],
            }),
            new TableCell({
              children: [new Paragraph(row.ket_pengeluaran || "-")],
            }),
            new TableCell({
              children: [
                new Paragraph(row.jumlah ? formatRupiah(row.jumlah) : "-"),
              ],
            }),
          ],
        })
      );
    }); // Tambah saldo awal & saldo akhir di Word

    tableRows.unshift(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph("Saldo Awal")],
            columnSpan: 6,
          }),
          new TableCell({ children: [new Paragraph(formatRupiah(saldoAwal))] }),
        ],
      })
    );

    tableRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph("Saldo Akhir")],
            columnSpan: 6,
          }),
          new TableCell({ children: [new Paragraph(formatRupiah(saldo))] }),
        ],
      })
    );

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "Laporan Keuangan by CashFlowin",
                  bold: true,
                  size: 32,
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `Periode: ${new Date(
                    selectedYear,
                    selectedMonth - 1
                  ).toLocaleString("id-ID", {
                    month: "long",
                    year: "numeric",
                  })}`,
                  size: 24,
                  italics: true,
                }),
              ],
            }),
            new Paragraph(" "),
            new Table({
              rows: tableRows,
              width: { size: 100, type: WidthType.PERCENTAGE },
            }),
          ],
        },
      ],
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, `laporan_keuangan_${selectedMonth}_${selectedYear}.docx`);
    });
  };

  return (
    <div className="space-y-6 mt-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">📊 Data Keuangan</h2>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-full flex-1 md:w-[120px]">
              <SelectValue placeholder="Bulan" />
            </SelectTrigger>
            <SelectContent>
              {[
                "Januari",
                "Februari",
                "Maret",
                "April",
                "Mei",
                "Juni",
                "Juli",
                "Agustus",
                "September",
                "Oktober",
                "November",
                "Desember",
              ].map((bulan, i) => (
                <SelectItem key={i} value={String(i + 1)}>
                  {bulan}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-full flex-1 md:w-[100px]">
              <SelectValue placeholder="Tahun" />
            </SelectTrigger>
            <SelectContent>
              {Array.from(
                { length: 6 },
                (_, i) => new Date().getFullYear() - i
              ).map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={downloadWord}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center gap-2 w-full md:w-auto"
          >
            <Download className="w-4 h-4" />
            Download Word
          </Button>
        </div>
      </div>

      <Card className="shadow-md border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-700">
            Riwayat Transaksi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto hidden md:block">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="px-4 py-2 border text-center">No</th>
                  <th className="px-4 py-2 border text-left">Tanggal</th>
                  <th className="px-4 py-2 border text-right">Pemasukan</th>
                  <th className="px-4 py-2 border text-left">Keterangan</th>
                  <th className="px-4 py-2 border text-right">Pengeluaran</th>
                  <th className="px-4 py-2 border text-left">Keterangan</th>
                  <th className="px-4 py-2 border text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-gray-500 py-6">
                      Tidak ada data transaksi
                    </td>
                  </tr>
                ) : (
                  data.map((row, index) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-blue-50`}
                    >
                      <td className="border px-4 py-2 text-center text-gray-700">
                        {index + 1}
                      </td>
                      <td className="border px-4 py-2 text-left">
                        {row.tanggal?.toDate
                          ? row.tanggal.toDate().toLocaleDateString("id-ID", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : ""}
                      </td>
                      <td className="border px-4 py-2 text-right">
                        {row.pemasukan > 0 ? (
                          <span className="inline-flex items-center text-green-600 font-semibold gap-1">
                            <ArrowUpCircle className="w-4 h-4" />
                            {formatRupiah(row.pemasukan)}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="border px-4 py-2 text-left">
                        {row.ket_pemasukan || "-"}
                      </td>
                      <td className="border px-4 py-2 text-right">
                        {row.pengeluaran > 0 ? (
                          <span className="inline-flex items-center text-red-600 font-semibold gap-1">
                            <ArrowDownCircle className="w-4 h-4" />
                            {formatRupiah(row.pengeluaran)}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="border px-4 py-2 text-left">
                        {row.ket_pengeluaran || "-"}
                      </td>
                      <td className="border px-4 py-2 text-right font-medium">
                        {formatRupiah(row.jumlah)}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 md:hidden">
            {data.length === 0 ? (
              <p className="text-center text-gray-500 py-6">
                Tidak ada data transaksi
              </p>
            ) : (
              data.map((row) => (
                <motion.div
                  key={row.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 bg-white shadow-sm"
                >
                  <div className="flex justify-between items-center mb-2 pb-2 border-b">
                    <span className="text-sm text-gray-600">
                      {row.tanggal?.toDate
                        ? row.tanggal.toDate().toLocaleDateString("id-ID", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })
                        : ""}
                    </span>
                    <span className="font-bold text-gray-800">
                      {formatRupiah(row.jumlah)}
                    </span>
                  </div>

                  {row.pemasukan > 0 && (
                    <div className="text-sm">
                      <p className="text-green-600 flex items-center gap-1 font-semibold">
                        <ArrowUpCircle className="w-4 h-4" />{" "}
                        {formatRupiah(row.pemasukan)}
                      </p>
                      <p className="text-gray-500 pl-5">{row.ket_pemasukan}</p>
                    </div>
                  )}

                  {row.pengeluaran > 0 && (
                    <div className="text-sm mt-2">
                      <p className="text-red-600 flex items-center gap-1 font-semibold">
                        <ArrowDownCircle className="w-4 h-4" />{" "}
                        {formatRupiah(row.pengeluaran)}
                      </p>
                      <p className="text-gray-500 pl-5">
                        {row.ket_pengeluaran}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
