import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import PageShell from "../components/PageShell";
import Card from "../components/Card";
import Input from "../components/Input";
import Select from "../components/Select";
import Button from "../components/Button";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [role, setRole] = useState("student");
  const [roleCreateKey, setRoleCreateKey] = useState("");
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await register({ name, email, password, role, roleCreateKey });
      nav("/");
    } catch (error) {
      console.error("Registration error:", error);
      let errorMessage = "Registration failed";

      if (!error.response) {
        errorMessage = "Cannot connect to server. Please try again later.";
      } else if (error.response.data) {
        errorMessage = error.response.data.message || "Registration failed";
      }

      setErr(errorMessage);
    }
  };

  return (
    <PageShell title="Create Account" subtitle="Join the vibrant UniZone community">
      <div className="mx-auto max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex justify-center mb-8 animate-in zoom-in-90 duration-1000">
          <img src="/logo.png" alt="UniZone Logo" className="w-24 h-24 object-contain filter drop-shadow-2xl" />
        </div>
        <Card glass className="border-4 border-white/20 shadow-2xl">
          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="space-y-4">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="bg-white/5 backdrop-blur-md border-2 border-white/10 focus:border-emerald-500 rounded-2xl p-4 font-bold text-white placeholder:text-slate-500"
              / >
              <Input
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="bg-white/5 backdrop-blur-md border-2 border-white/10 focus:border-emerald-500 rounded-2xl p-4 font-bold text-white placeholder:text-slate-500"
              / >
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="bg-white/5 backdrop-blur-md border-2 border-white/10 focus:border-emerald-500 rounded-2xl p-4 font-bold text-white placeholder:text-slate-500"
              / >

              <Select
                label="Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="bg-white/50 backdrop-blur-sm border-2 border-emerald-100 focus:border-emerald-500 rounded-2xl p-4 font-bold"
              >
                <option value="student">Student</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </Select>

              {(role === "admin" || role === "staff") && (
                <div className="space-y-2 translate-y-2 animate-in fade-in slide-in-from-top-2">
                  <Input
                    label="Role Create Key"
                    value={roleCreateKey}
                    onChange={(e) => setRoleCreateKey(e.target.value)}
                    placeholder="Enter security key"
                    required
                    className="bg-orange-50 border-2 border-orange-200 focus:border-orange-500 rounded-2xl p-4 font-bold"
                  />
                  <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest px-2">Key required for higher roles</p>
                </div>
              )}
            </div>

            {err && (
              <div className="rounded-2xl bg-red-500/10 border-2 border-red-500/20 p-4">
                <p className="text-sm font-black text-red-400">{err}</p>
              </div>
            )}

            <div className="space-y-4 pt-2">
              <Button
                className="w-full bg-gradient-to-br from-emerald-500 to-teal-700 hover:from-emerald-600 hover:to-teal-800 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-500/20 transform active:scale-95 transition-all text-lg"
                type="submit"
              >
                Create Account
              </Button>

              <div className="text-center">
                <p className="text-sm font-bold text-slate-400">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-emerald-400 hover:text-emerald-300 font-black underline underline-offset-4 decoration-2 decoration-emerald-400/30 hover:decoration-emerald-400 transition-all"
                  >
                    Login Now
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
