import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", form);
      const user = res.data.user;

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(user));

      // ⭐ ROLE BASED REDIRECTION ⭐
      switch (user.role) {
        case "admin":
        case "org_admin":
          navigate("/admin/dashboard");
          break;

        case "hr":
          navigate("/hr/dashboard");
          break;

        case "account":
        case "accounts":
          navigate("/account/dashboard");
          break;

        case "employee":
          navigate("/employee/dashboard");
          break;

        default:
          navigate("/dashboard");
          break;
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Invalid credentials or server error."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center relative overflow-hidden">
      {/* fancy background */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -top-32 -left-20 h-72 w-72 rounded-full bg-emerald-500 blur-3xl" />
        <div className="absolute -bottom-32 -right-10 h-72 w-72 rounded-full bg-indigo-500 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Brand */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/70 border border-slate-700 mb-3">
            <span className="text-xs text-emerald-400 font-semibold">
              HRMS
            </span>
            <span className="w-1 h-1 rounded-full bg-emerald-400" />
            <span className="text-[11px] text-slate-300">
              Smart Attendance & HR
            </span>
          </div>

          <h1 className="text-2xl font-bold text-white">
            Welcome back 👋
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Sign in to access your dashboard.
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-950/70 backdrop-blur border border-slate-800 rounded-2xl shadow-xl px-6 py-6">
          {error && (
            <div className="mb-4 rounded-lg border border-rose-500/60 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-200">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={onChange}
                  className="w-full bg-slate-900/70 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-200 flex justify-between">
                <span>Password</span>
                <button
                  type="button"
                  className="text-[11px] text-slate-400 hover:text-slate-200"
                >
                  {/* future: forgot password route */}
                  Forgot?
                </button>
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={onChange}
                  className="w-full bg-slate-900/70 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute inset-y-0 right-2 flex items-center text-slate-400 hover:text-slate-100 text-xs"
                >
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Remember + etc (optional) */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-3 w-3 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                />
                <span>Remember me</span>
              </label>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium py-2.5 shadow-lg shadow-emerald-500/20 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {loading && (
                <span className="h-4 w-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
              )}
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-4 text-center text-[12px] text-slate-400">
            New here?{" "}
            <Link
              to="/signup"
              className="text-emerald-400 hover:text-emerald-300 font-medium"
            >
              Create an account
            </Link>
          </p>
        </div>

        <p className="mt-4 text-center text-[11px] text-slate-500">
          © {new Date().getFullYear()} HRMS • All rights reserved.
        </p>
      </div>
    </div>
  );
}
