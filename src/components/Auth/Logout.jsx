"use client";

import { useRouter } from "next/navigation";
import { clearSession } from "@/app/utils/cookies";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    clearSession(); // hapus cookie session
    router.push("/login"); // redirect ke halaman login
  };

  return (
    <Button
      onClick={handleLogout}
      className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg"
    >
      Logout
    </Button>
  );
}
