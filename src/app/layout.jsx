export const metadata = {
  title: "CashFlowin",
  description: "Aplikasi pencatatan keuangan",
};

import { ToastProvider } from "@/components/ui/toaster";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          {" "}
          <ToastProvider>{children}</ToastProvider>
        </div>
      </body>
    </html>
  );
}
