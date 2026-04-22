import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import PageShell from "../components/PageShell";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await login(email, password);
      nav("/");
    } catch (e) {
      setErr(e.response?.data?.message || "Login failed");
    }
  };

  return (
    <PageShell title="Welcome Back" subtitle="Sign in to your digital campus workspace">
      <div className="mx-auto max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex justify-center mb-8 animate-in zoom-in-90 duration-1000">
          <img src="/logo.png" alt="UniZone Logo" className="w-24 h-24 object-contain filter drop-shadow-2xl" />
        </div>
        <Card glass className="border-4 border-white/20 shadow-2xl">
          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="space-y-4">
              <Input
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                className="bg-white/5 backdrop-blur-md border-2 border-white/10 focus:border-blue-500 rounded-2xl p-4 font-bold text-white placeholder:text-slate-500"
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="bg-white/5 backdrop-blur-md border-2 border-white/10 focus:border-blue-500 rounded-2xl p-4 font-bold text-white placeholder:text-slate-500"
              />
            </div>

            {err && (
              <div className="rounded-2xl bg-red-500/10 border-2 border-red-500/20 p-4">
                <p className="text-sm font-black text-red-400">{err}</p>
              </div>
            )}

            <div className="space-y-4">
              <Button
                className="w-full bg-gradient-to-br from-blue-500 to-indigo-700 hover:from-blue-600 hover:to-indigo-800 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-500/20 transform active:scale-95 transition-all text-lg"
                type="submit"
              >
                Sign In
              </Button>

              <div className="text-center">
                <p className="text-sm font-bold text-slate-400">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="text-blue-400 hover:text-blue-300 font-black underline underline-offset-4 decoration-2 decoration-blue-400/30 hover:decoration-blue-400 transition-all"
                  >
                    Register Now
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </PageShell>
  );
}
