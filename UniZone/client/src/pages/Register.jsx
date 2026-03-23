import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
      console.error("Error response:", error.response);
      
      let errorMessage = "Register failed";
      
      if (!error.response) {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
        const baseUrl = apiUrl.replace('/api', '');
        errorMessage = `Cannot connect to server. Please make sure the backend is running on ${baseUrl}`;
      } else if (error.response.data) {
        errorMessage = error.response.data.message || 
                       error.response.data.error || 
                       error.response.data.msg ||
                       `Error: ${error.response.status} ${error.response.statusText}`;
      } else {
        errorMessage = `Error: ${error.response.status} ${error.response.statusText}`;
      }
      
      setErr(errorMessage);
    }
  };

  return (
    <PageShell title="Get Started" subtitle="Create your UniZone account">
      <div className="mx-auto max-w-md">
        <Card>
          <form className="space-y-5" onSubmit={onSubmit}>
            <Input label="Full Name" value={name} onChange={(e)=>setName(e.target.value)} placeholder="John Doe" />
            <Input label="Email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="john@example.com" />
            <Input label="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="••••••" />

            <Select label="Role" value={role} onChange={(e)=>setRole(e.target.value)}>
              <option value="student">Student</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </Select>

            {(role === "admin" || role === "staff") && (
              <div>
                <Input 
                  label="Role Create Key (required for admin/staff)" 
                  value={roleCreateKey} 
                  onChange={(e)=>setRoleCreateKey(e.target.value)} 
                  placeholder="Enter admin/staff key" 
                  required
                />
                <p className="mt-1 text-xs text-gray-500">You need a valid key to create an admin or staff account.</p>
              </div>
            )}

            {err && <div className="rounded-xl bg-red-50 border border-red-200 p-3"><p className="text-sm font-medium text-red-700">{err}</p></div>}
            <Button className="w-full" type="submit">Create Account</Button>
          </form>
        </Card>
      </div>
    </PageShell>
  );
}
