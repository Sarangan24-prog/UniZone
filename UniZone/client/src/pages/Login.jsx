import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
    <PageShell title="Welcome Back" subtitle="Sign in to your UniZone account">
      <div className="mx-auto max-w-md">
        <Card>
          <form className="space-y-5" onSubmit={onSubmit}>
            <div className="space-y-1">
              <Input label="Email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="space-y-1">
              <Input label="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="••••••" />
            </div>
            {err && <div className="rounded-xl bg-red-50 border border-red-200 p-3"><p className="text-sm font-medium text-red-700">{err}</p></div>}
            <Button className="w-full" type="submit">Sign In</Button>
          </form>
        </Card>
      </div>
    </PageShell>
  );
}
