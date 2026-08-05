"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import { useAdminAuth } from "@/lib/AdminAuthContext";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const { login } = useAdminAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success("Welcome back");
      router.replace("/");
    } catch (err: unknown) {
      const ax = err as {
        code?: string;
        message?: string;
        response?: { status?: number; data?: { message?: string } };
      };
      const status = ax.response?.status;
      const offline =
        ax.code === "ERR_NETWORK" ||
        ax.message?.includes("Network Error") ||
        !ax.response ||
        status === 502 ||
        status === 503 ||
        status === 504 ||
        (status === 500 && !ax.response?.data?.message);
      const msg = offline
        ? "Cannot reach API server. Start the server on port 5000 (cd server && npm run start)."
        : ax.response?.data?.message || "Invalid email or password";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#E8EAED] shadow-sm p-8">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-full bg-[#1A2332] flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-lg tracking-wide">TRUSTPRIME</p>
            <p className="text-xs text-[#6B7280]">Admin Panel · Thailand Kitchen</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4" autoComplete="off">
          <div>
            <label className="block text-xs font-semibold text-[#5C6370] mb-1.5 uppercase tracking-wide">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              className="w-full rounded-lg border border-[#E2E5EA] bg-[#F9FAFB] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A2332]/20 focus:border-[#1A2332]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#5C6370] mb-1.5 uppercase tracking-wide">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full rounded-lg border border-[#E2E5EA] bg-[#F9FAFB] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A2332]/20 focus:border-[#1A2332]"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 rounded-lg bg-[#1A2332] text-white py-2.5 text-sm font-semibold hover:bg-[#243044] disabled:opacity-60 transition-colors"
          >
            {submitting ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
