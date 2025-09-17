// src/app/utils/cookies.js
import Cookies from "js-cookie";

// Simpan session (default 30 menit)
export const setSession = (data, expireMinutes = 30) => {
  Cookies.set("session", JSON.stringify(data), {
    expires: expireMinutes / (24 * 60),
  });
};

// Ambil session
export const getSession = () => {
  const session = Cookies.get("session");
  return session ? JSON.parse(session) : null;
};

// Hapus session
export const clearSession = () => {
  Cookies.remove("session");
};
