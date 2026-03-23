# UniZone — Tailwind + Vite + React COMPLETE Frontend (CRUD UI + Search + Filters + Sort)

This is a **single copy/paste** Markdown file that gives you:
- Tailwind setup for **Vite + React**
- Clean, responsive UI
- Full UI pages for UniZone modules
- **FULL CRUD UI** (Create/Read/Update/Delete) for Courses / Events / Sports
- **Search + Filters + Sort** in UI (client-side) + optional server-side query param snippets
- Works with backend endpoints:
  - `/api/auth/*`
  - `/api/courses/*`
  - `/api/events/*`
  - `/api/sports/*`
  - `/api/services/*`

> University-level: clean, understandable, easy to run. Not enterprise.

---

## 0) Create React App (Vite)

```bash
npm create vite@latest client -- --template react
cd client
npm install
npm install axios react-router-dom
```

---

## 1) Install Tailwind

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## 2) Configure Tailwind

### 2.1 `tailwind.config.js`
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: { extend: {} },
  plugins: []
};
```

### 2.2 `src/index.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 2.3 `src/main.jsx`
```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## 3) Environment Variable

Create `client/.env.example`:
```bash
VITE_API_URL=http://localhost:5000/api
```

Create `client/.env`:
```bash
VITE_API_URL=http://localhost:5000/api
```

---

## 4) Frontend Structure

```
client/src/
  api/
    client.js
  auth/
    AuthContext.jsx
  routes/
    ProtectedRoute.jsx
    RoleRoute.jsx
  components/
    TopBar.jsx
    PageShell.jsx
    Card.jsx
    Input.jsx
    TextArea.jsx
    Select.jsx
    Badge.jsx
    Button.jsx
    Modal.jsx
    Table.jsx
    EmptyState.jsx
    Loading.jsx
  pages/
    Login.jsx
    Register.jsx
    Dashboard.jsx
    Courses.jsx
    Events.jsx
    Sports.jsx
    Services.jsx
    AdminRequests.jsx
    NotFound.jsx
  App.jsx
```

---

# 5) Code (Copy/Paste File by File)

## 5.1 API Client

### `src/api/client.js`
```js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

---

## 5.2 Auth Context

### `src/auth/AuthContext.jsx`
```jsx
import { createContext, useContext, useMemo, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });

  const isAuthed = !!localStorage.getItem("token");

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  const register = async ({ name, email, password, role = "student", roleCreateKey = "" }) => {
    const res = await api.post("/auth/register", { name, email, password, role, roleCreateKey });
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const value = useMemo(() => ({ user, isAuthed, login, register, logout }), [user, isAuthed]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
```

---

## 5.3 Route Guards

### `src/routes/ProtectedRoute.jsx`
```jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthed } = useAuth();
  if (!isAuthed) return <Navigate to="/login" replace />;
  return children;
}
```

### `src/routes/RoleRoute.jsx`
```jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function RoleRoute({ roles, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}
```

---

# 6) UI Components (Tailwind)

### `src/components/Button.jsx`
```jsx
export default function Button({ variant = "primary", className = "", ...props }) {
  const base = "inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold transition";
  const styles = {
    primary: "bg-gray-900 text-white hover:bg-gray-800",
    outline: "border border-gray-300 text-gray-800 hover:bg-gray-50",
    danger: "bg-red-600 text-white hover:bg-red-500"
  };
  return <button className={`${base} ${styles[variant]} ${className}`} {...props} />;
}
```

### `src/components/Badge.jsx`
```jsx
export default function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
      {children}
    </span>
  );
}
```

### `src/components/Card.jsx`
```jsx
export default function Card({ children }) {
  return <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">{children}</div>;
}
```

### `src/components/Input.jsx`
```jsx
export default function Input({ label, ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>}
      <input
        {...props}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-900"
      />
    </label>
  );
}
```

### `src/components/Select.jsx`
```jsx
export default function Select({ label, children, ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>}
      <select
        {...props}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-900"
      >
        {children}
      </select>
    </label>
  );
}
```

### `src/components/TextArea.jsx`
```jsx
export default function TextArea({ label, ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>}
      <textarea
        {...props}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-900"
      />
    </label>
  );
}
```

### `src/components/PageShell.jsx`
```jsx
export default function PageShell({ title, subtitle, right, children }) {
  return (
    <div className="min-h-[calc(100vh-56px)] bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
          </div>
          {right && <div className="flex flex-wrap gap-2">{right}</div>}
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
```

### `src/components/Loading.jsx`
```jsx
export default function Loading({ label = "Loading..." }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-700">
      {label}
    </div>
  );
}
```

### `src/components/EmptyState.jsx`
```jsx
export default function EmptyState({ title="No data", subtitle="Try adjusting filters or add a new item." }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6">
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
    </div>
  );
}
```

### `src/components/Modal.jsx`
```jsx
export default function Modal({ open, title, onClose, children, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="rounded-lg px-2 py-1 text-gray-600 hover:bg-gray-100">✕</button>
        </div>
        <div className="p-4">{children}</div>
        {footer && <div className="border-t border-gray-200 p-4">{footer}</div>}
      </div>
    </div>
  );
}
```

### `src/components/Table.jsx`
```jsx
export default function Table({ columns, rows }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-600">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="px-4 py-3">{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {rows.map((r, idx) => (
            <tr key={r._id || idx} className="hover:bg-gray-50">
              {columns.map((c) => (
                <td key={c.key} className="px-4 py-3 text-gray-800">
                  {c.render ? c.render(r) : r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### `src/components/TopBar.jsx`
```jsx
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import Badge from "./Badge";
import Button from "./Button";

export default function TopBar() {
  const { user, isAuthed, logout } = useAuth();
  const nav = useNavigate();

  const onLogout = () => {
    logout();
    nav("/login");
  };

  return (
    <header className="h-14 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link to="/" className="font-semibold text-gray-900">UniZone</Link>

        <nav className="flex flex-wrap items-center gap-3 text-sm">
          {!isAuthed ? (
            <>
              <Link className="text-gray-700 hover:text-gray-900" to="/login">Login</Link>
              <Link className="text-gray-700 hover:text-gray-900" to="/register">Register</Link>
            </>
          ) : (
            <>
              <Link className="text-gray-700 hover:text-gray-900" to="/courses">Courses</Link>
              <Link className="text-gray-700 hover:text-gray-900" to="/events">Events</Link>
              <Link className="text-gray-700 hover:text-gray-900" to="/sports">Sports</Link>
              <Link className="text-gray-700 hover:text-gray-900" to="/services">Services</Link>
              {(user?.role === "admin" || user?.role === "staff") && (
                <Link className="text-gray-700 hover:text-gray-900" to="/admin/requests">All Requests</Link>
              )}
              <Badge>{user?.role}</Badge>
              <Button variant="outline" onClick={onLogout}>Logout</Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
```

---

# 7) Search + Filter + Sort (How it works)

## Client-side approach (default in this UI)
- Load list from API once
- Search & filter on the frontend
- Best for university size data (fast & simple)

Each module page includes:
- Search box (q)
- Filter dropdown (module-specific)
- Sort dropdown

## Optional server-side approach (query params)
If you want backend search/filter, update list API to accept:
- `q` (search)
- `sort` (e.g. `createdAt_desc`)
- `department` / `status` etc.

Example request:
```js
api.get("/courses", { params: { q, department, sort } })
```

---

# 8) Pages (CRUD + Search/Filter/Sort)

## 8.1 Login

### `src/pages/Login.jsx`
```jsx
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
    <PageShell title="Login" subtitle="Access UniZone with your account">
      <div className="mx-auto max-w-md">
        <Card>
          <form className="space-y-4" onSubmit={onSubmit}>
            <Input label="Email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" />
            <Input label="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="••••••" />
            {err && <p className="text-sm text-red-600">{err}</p>}
            <Button className="w-full" type="submit">Login</Button>
          </form>
        </Card>
      </div>
    </PageShell>
  );
}
```

---

## 8.2 Register

### `src/pages/Register.jsx`
```jsx
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
    } catch (e) {
      setErr(e.response?.data?.message || "Register failed");
    }
  };

  return (
    <PageShell title="Register" subtitle="Create a UniZone account">
      <div className="mx-auto max-w-md">
        <Card>
          <form className="space-y-4" onSubmit={onSubmit}>
            <Input label="Full Name" value={name} onChange={(e)=>setName(e.target.value)} />
            <Input label="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
            <Input label="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />

            <Select label="Role" value={role} onChange={(e)=>setRole(e.target.value)}>
              <option value="student">student</option>
              <option value="staff">staff</option>
              <option value="admin">admin</option>
            </Select>

            <Input label="Role Create Key (only for staff/admin)" value={roleCreateKey} onChange={(e)=>setRoleCreateKey(e.target.value)} />

            {err && <p className="text-sm text-red-600">{err}</p>}
            <Button className="w-full" type="submit">Create Account</Button>
          </form>
        </Card>
      </div>
    </PageShell>
  );
}
```

---

## 8.3 Dashboard

### `src/pages/Dashboard.jsx`
```jsx
import PageShell from "../components/PageShell";
import Card from "../components/Card";
import { useAuth } from "../auth/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <PageShell title="Dashboard" subtitle="Welcome to UniZone">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-sm text-gray-600">User</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">{user?.name}</p>
          <p className="mt-2 text-sm text-gray-700">Role: <b>{user?.role}</b></p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600">Modules</p>
          <ul className="mt-2 list-disc pl-5 text-sm text-gray-800">
            <li>Courses</li>
            <li>Events</li>
            <li>Sports</li>
            <li>Services</li>
          </ul>
        </Card>
      </div>
    </PageShell>
  );
}
```

---

# 8.4 Courses (FULL CRUD + Search + Filter + Sort)

> API needed:
- GET `/courses`
- POST `/courses` (admin/staff)
- PUT `/courses/:id` (admin/staff)
- DELETE `/courses/:id` (admin/staff)
- POST `/courses/:id/enroll` (student)
- POST `/courses/:id/drop` (student)

### `src/pages/Courses.jsx`
```jsx
import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import PageShell from "../components/PageShell";
import Card from "../components/Card";
import Input from "../components/Input";
import Select from "../components/Select";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Table from "../components/Table";
import EmptyState from "../components/EmptyState";
import Loading from "../components/Loading";
import { useAuth } from "../auth/AuthContext";

export default function Courses() {
  const { user } = useAuth();

  const isStaff = user?.role === "admin" || user?.role === "staff";
  const isStudent = user?.role === "student";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // search/filter/sort
  const [q, setQ] = useState("");
  const [department, setDepartment] = useState("all");
  const [sort, setSort] = useState("created_desc");

  // create/edit modal
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({ title:"", code:"", department:"CSE", schedule:"", capacity:50, description:"" });

  const load = async () => {
    setLoading(true);
    const res = await api.get("/courses");
    setItems(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => setForm({ title:"", code:"", department:"CSE", schedule:"", capacity:50, description:"" });

  const onCreate = () => {
    resetForm();
    setEditing(null);
    setErr("");
    setOpen(true);
  };

  const onEdit = (row) => {
    setEditing(row);
    setForm({
      title: row.title || "",
      code: row.code || "",
      department: row.department || "CSE",
      schedule: row.schedule || "",
      capacity: row.capacity || 50,
      description: row.description || ""
    });
    setErr("");
    setOpen(true);
  };

  const save = async () => {
    try {
      setErr("");
      if (editing) {
        await api.put(`/courses/${editing._id}`, form);
      } else {
        await api.post("/courses", form);
      }
      setOpen(false);
      load();
    } catch (e) {
      setErr(e.response?.data?.message || "Save failed");
    }
  };

  const del = async (id) => {
    if (!confirm("Delete this course?")) return;
    await api.delete(`/courses/${id}`);
    load();
  };

  const enroll = async (id) => { await api.post(`/courses/${id}/enroll`); load(); };
  const drop = async (id) => { await api.post(`/courses/${id}/drop`); load(); };

  const filtered = useMemo(() => {
    let out = [...items];

    // filter by department
    if (department !== "all") out = out.filter(x => (x.department || "") === department);

    // search by title/code
    if (q.trim()) {
      const qq = q.toLowerCase();
      out = out.filter(x =>
        (x.title || "").toLowerCase().includes(qq) ||
        (x.code || "").toLowerCase().includes(qq)
      );
    }

    // sort
    out.sort((a,b) => {
      if (sort === "created_desc") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === "created_asc") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sort === "title_asc") return (a.title||"").localeCompare(b.title||"");
      if (sort === "title_desc") return (b.title||"").localeCompare(a.title||"");
      return 0;
    });

    return out;
  }, [items, q, department, sort]);

  const columns = [
    { key: "code", header: "Code" },
    { key: "title", header: "Title" },
    { key: "department", header: "Dept" },
    { key: "capacity", header: "Capacity", render: (r) => `${r.enrolledStudents?.length || 0}/${r.capacity || 0}` },
    { key: "actions", header: "Actions", render: (r) => (
      <div className="flex flex-wrap gap-2">
        {isStudent && (
          <>
            <Button onClick={() => enroll(r._id)}>Enroll</Button>
            <Button variant="outline" onClick={() => drop(r._id)}>Drop</Button>
          </>
        )}
        {isStaff && (
          <>
            <Button variant="outline" onClick={() => onEdit(r)}>Edit</Button>
            <Button variant="danger" onClick={() => del(r._id)}>Delete</Button>
          </>
        )}
      </div>
    )}
  ];

  return (
    <PageShell
      title="Courses"
      subtitle="Search, filter, sort, and manage courses"
      right={isStaff && (
        <Button onClick={onCreate}>New Course</Button>
      )}
    >
      <Card>
        <div className="grid gap-3 sm:grid-cols-3">
          <Input label="Search (title/code)" value={q} onChange={(e)=>setQ(e.target.value)} placeholder="e.g. DBMS, CSE101" />
          <Select label="Department" value={department} onChange={(e)=>setDepartment(e.target.value)}>
            <option value="all">All</option>
            <option value="CSE">CSE</option>
            <option value="EEE">EEE</option>
            <option value="MECH">MECH</option>
            <option value="CIVIL">CIVIL</option>
          </Select>
          <Select label="Sort" value={sort} onChange={(e)=>setSort(e.target.value)}>
            <option value="created_desc">Newest</option>
            <option value="created_asc">Oldest</option>
            <option value="title_asc">Title A→Z</option>
            <option value="title_desc">Title Z→A</option>
          </Select>
        </div>
      </Card>

      <div className="mt-4">
        {loading ? (
          <Loading />
        ) : filtered.length === 0 ? (
          <EmptyState title="No courses found" subtitle="Try another search or change filters." />
        ) : (
          <Table columns={columns} rows={filtered} />
        )}
      </div>

      <Modal
        open={open}
        title={editing ? "Edit Course" : "Create Course"}
        onClose={()=>setOpen(false)}
        footer={(
          <div className="flex items-center justify-between">
            {err && <p className="text-sm text-red-600">{err}</p>}
            <div className="flex gap-2">
              <Button variant="outline" onClick={()=>setOpen(false)}>Cancel</Button>
              <Button onClick={save}>Save</Button>
            </div>
          </div>
        )}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Title" value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} />
          <Input label="Code" value={form.code} onChange={(e)=>setForm({...form,code:e.target.value})} />
          <Select label="Department" value={form.department} onChange={(e)=>setForm({...form,department:e.target.value})}>
            <option value="CSE">CSE</option>
            <option value="EEE">EEE</option>
            <option value="MECH">MECH</option>
            <option value="CIVIL">CIVIL</option>
          </Select>
          <Input label="Capacity" type="number" value={form.capacity} onChange={(e)=>setForm({...form,capacity:+e.target.value})} />
          <Input label="Schedule" value={form.schedule} onChange={(e)=>setForm({...form,schedule:e.target.value})} placeholder="Mon 10-12" />
          <div className="sm:col-span-2">
            <TextArea label="Description" rows={3} value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} />
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}
```

---

# 8.5 Events (FULL CRUD + Search + Filter + Sort)

### `src/pages/Events.jsx`
```jsx
import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import PageShell from "../components/PageShell";
import Card from "../components/Card";
import Input from "../components/Input";
import Select from "../components/Select";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Table from "../components/Table";
import EmptyState from "../components/EmptyState";
import Loading from "../components/Loading";
import TextArea from "../components/TextArea";
import { useAuth } from "../auth/AuthContext";

export default function Events() {
  const { user } = useAuth();
  const isStaff = user?.role === "admin" || user?.role === "staff";
  const isStudent = user?.role === "student";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [month, setMonth] = useState("all");
  const [sort, setSort] = useState("date_asc");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({ title:"", location:"", dateTime:"", capacity:100, description:"" });

  const load = async () => {
    setLoading(true);
    const res = await api.get("/events");
    setItems(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => setForm({ title:"", location:"", dateTime:"", capacity:100, description:"" });

  const onCreate = () => { resetForm(); setEditing(null); setErr(""); setOpen(true); };

  const onEdit = (row) => {
    setEditing(row);
    setForm({
      title: row.title || "",
      location: row.location || "",
      dateTime: row.dateTime ? new Date(row.dateTime).toISOString().slice(0,16) : "",
      capacity: row.capacity || 100,
      description: row.description || ""
    });
    setErr("");
    setOpen(true);
  };

  const save = async () => {
    try {
      setErr("");
      const payload = { ...form, dateTime: new Date(form.dateTime) };
      if (editing) await api.put(`/events/${editing._id}`, payload);
      else await api.post("/events", payload);
      setOpen(false);
      load();
    } catch (e) {
      setErr(e.response?.data?.message || "Save failed");
    }
  };

  const del = async (id) => {
    if (!confirm("Delete this event?")) return;
    await api.delete(`/events/${id}`);
    load();
  };

  const reg = async (id) => { await api.post(`/events/${id}/register`); load(); };
  const unreg = async (id) => { await api.post(`/events/${id}/unregister`); load(); };

  const filtered = useMemo(() => {
    let out = [...items];

    if (q.trim()) {
      const qq = q.toLowerCase();
      out = out.filter(x =>
        (x.title || "").toLowerCase().includes(qq) ||
        (x.location || "").toLowerCase().includes(qq)
      );
    }

    if (month !== "all") {
      out = out.filter(x => {
        const m = new Date(x.dateTime).getMonth()+1;
        return String(m) === month;
      });
    }

    out.sort((a,b) => {
      if (sort === "date_asc") return new Date(a.dateTime) - new Date(b.dateTime);
      if (sort === "date_desc") return new Date(b.dateTime) - new Date(a.dateTime);
      if (sort === "title_asc") return (a.title||"").localeCompare(b.title||"");
      if (sort === "title_desc") return (b.title||"").localeCompare(a.title||"");
      return 0;
    });

    return out;
  }, [items, q, month, sort]);

  const columns = [
    { key: "title", header: "Title" },
    { key: "location", header: "Location" },
    { key: "dateTime", header: "Date", render: (r) => new Date(r.dateTime).toLocaleString() },
    { key: "capacity", header: "Capacity", render: (r) => `${r.registeredUsers?.length || 0}/${r.capacity || 0}` },
    { key: "actions", header: "Actions", render: (r) => (
      <div className="flex flex-wrap gap-2">
        {isStudent && (
          <>
            <Button onClick={() => reg(r._id)}>Register</Button>
            <Button variant="outline" onClick={() => unreg(r._id)}>Unregister</Button>
          </>
        )}
        {isStaff && (
          <>
            <Button variant="outline" onClick={() => onEdit(r)}>Edit</Button>
            <Button variant="danger" onClick={() => del(r._id)}>Delete</Button>
          </>
        )}
      </div>
    ) }
  ];

  return (
    <PageShell
      title="Events"
      subtitle="Search, filter by month, and manage events"
      right={isStaff && <Button onClick={onCreate}>New Event</Button>}
    >
      <Card>
        <div className="grid gap-3 sm:grid-cols-3">
          <Input label="Search (title/location)" value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Sports day..." />
          <Select label="Month" value={month} onChange={(e)=>setMonth(e.target.value)}>
            <option value="all">All</option>
            <option value="1">Jan</option><option value="2">Feb</option><option value="3">Mar</option>
            <option value="4">Apr</option><option value="5">May</option><option value="6">Jun</option>
            <option value="7">Jul</option><option value="8">Aug</option><option value="9">Sep</option>
            <option value="10">Oct</option><option value="11">Nov</option><option value="12">Dec</option>
          </Select>
          <Select label="Sort" value={sort} onChange={(e)=>setSort(e.target.value)}>
            <option value="date_asc">Upcoming first</option>
            <option value="date_desc">Latest first</option>
            <option value="title_asc">Title A→Z</option>
            <option value="title_desc">Title Z→A</option>
          </Select>
        </div>
      </Card>

      <div className="mt-4">
        {loading ? <Loading/> : filtered.length === 0 ? (
          <EmptyState title="No events found" subtitle="Try a different search or month filter."/>
        ) : (
          <Table columns={columns} rows={filtered}/>
        )}
      </div>

      <Modal
        open={open}
        title={editing ? "Edit Event" : "Create Event"}
        onClose={()=>setOpen(false)}
        footer={(
          <div className="flex items-center justify-between">
            {err && <p className="text-sm text-red-600">{err}</p>}
            <div className="flex gap-2">
              <Button variant="outline" onClick={()=>setOpen(false)}>Cancel</Button>
              <Button onClick={save}>Save</Button>
            </div>
          </div>
        )}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Title" value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})}/>
          <Input label="Location" value={form.location} onChange={(e)=>setForm({...form,location:e.target.value})}/>
          <Input label="Date & Time" type="datetime-local" value={form.dateTime} onChange={(e)=>setForm({...form,dateTime:e.target.value})}/>
          <Input label="Capacity" type="number" value={form.capacity} onChange={(e)=>setForm({...form,capacity:+e.target.value})}/>
          <div className="sm:col-span-2">
            <TextArea label="Description" rows={3} value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})}/>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}
```

---

# 8.6 Sports (FULL CRUD + Search + Filter + Sort)

### `src/pages/Sports.jsx`
```jsx
import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import PageShell from "../components/PageShell";
import Card from "../components/Card";
import Input from "../components/Input";
import Select from "../components/Select";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Table from "../components/Table";
import EmptyState from "../components/EmptyState";
import Loading from "../components/Loading";
import TextArea from "../components/TextArea";
import { useAuth } from "../auth/AuthContext";

export default function Sports() {
  const { user } = useAuth();
  const isStaff = user?.role === "admin" || user?.role === "staff";
  const isStudent = user?.role === "student";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [size, setSize] = useState("all");
  const [sort, setSort] = useState("created_desc");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({ name:"", maxPlayers:30, description:"" });

  const load = async () => {
    setLoading(true);
    const res = await api.get("/sports");
    setItems(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const onCreate = () => { setForm({ name:"", maxPlayers:30, description:"" }); setEditing(null); setErr(""); setOpen(true); };

  const onEdit = (row) => {
    setEditing(row);
    setForm({ name: row.name || "", maxPlayers: row.maxPlayers || 30, description: row.description || "" });
    setErr("");
    setOpen(true);
  };

  const save = async () => {
    try {
      setErr("");
      if (editing) await api.put(`/sports/${editing._id}`, form);
      else await api.post("/sports", form);
      setOpen(false);
      load();
    } catch (e) {
      setErr(e.response?.data?.message || "Save failed");
    }
  };

  const del = async (id) => {
    if (!confirm("Delete this sport?")) return;
    await api.delete(`/sports/${id}`);
    load();
  };

  const join = async (id) => { await api.post(`/sports/${id}/join`); load(); };
  const leave = async (id) => { await api.post(`/sports/${id}/leave`); load(); };

  const filtered = useMemo(() => {
    let out = [...items];

    if (q.trim()) {
      const qq = q.toLowerCase();
      out = out.filter(x => (x.name || "").toLowerCase().includes(qq));
    }

    if (size !== "all") {
      out = out.filter(x => {
        const mp = x.maxPlayers || 0;
        if (size === "small") return mp <= 15;
        if (size === "medium") return mp > 15 && mp <= 30;
        if (size === "large") return mp > 30;
        return true;
      });
    }

    out.sort((a,b) => {
      if (sort === "created_desc") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === "created_asc") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sort === "name_asc") return (a.name||"").localeCompare(b.name||"");
      if (sort === "name_desc") return (b.name||"").localeCompare(a.name||"");
      return 0;
    });

    return out;
  }, [items, q, size, sort]);

  const columns = [
    { key: "name", header: "Sport" },
    { key: "maxPlayers", header: "Max Players" },
    { key: "players", header: "Current", render: (r) => `${r.players?.length || 0}/${r.maxPlayers || 0}` },
    { key: "actions", header: "Actions", render: (r) => (
      <div className="flex flex-wrap gap-2">
        {isStudent && (
          <>
            <Button onClick={()=>join(r._id)}>Join</Button>
            <Button variant="outline" onClick={()=>leave(r._id)}>Leave</Button>
          </>
        )}
        {isStaff && (
          <>
            <Button variant="outline" onClick={()=>onEdit(r)}>Edit</Button>
            <Button variant="danger" onClick={()=>del(r._id)}>Delete</Button>
          </>
        )}
      </div>
    ) }
  ];

  return (
    <PageShell
      title="Sports"
      subtitle="Search, filter by team size, and manage sports"
      right={isStaff && <Button onClick={onCreate}>New Sport</Button>}
    >
      <Card>
        <div className="grid gap-3 sm:grid-cols-3">
          <Input label="Search (name)" value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Cricket, Football..." />
          <Select label="Team Size" value={size} onChange={(e)=>setSize(e.target.value)}>
            <option value="all">All</option>
            <option value="small">Small (≤ 15)</option>
            <option value="medium">Medium (16–30)</option>
            <option value="large">Large (30+)</option>
          </Select>
          <Select label="Sort" value={sort} onChange={(e)=>setSort(e.target.value)}>
            <option value="created_desc">Newest</option>
            <option value="created_asc">Oldest</option>
            <option value="name_asc">Name A→Z</option>
            <option value="name_desc">Name Z→A</option>
          </Select>
        </div>
      </Card>

      <div className="mt-4">
        {loading ? <Loading/> : filtered.length === 0 ? (
          <EmptyState title="No sports found" subtitle="Try a different search or filter."/>
        ) : (
          <Table columns={columns} rows={filtered}/>
        )}
      </div>

      <Modal
        open={open}
        title={editing ? "Edit Sport" : "Create Sport"}
        onClose={()=>setOpen(false)}
        footer={(
          <div className="flex items-center justify-between">
            {err && <p className="text-sm text-red-600">{err}</p>}
            <div className="flex gap-2">
              <Button variant="outline" onClick={()=>setOpen(false)}>Cancel</Button>
              <Button onClick={save}>Save</Button>
            </div>
          </div>
        )}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Sport Name" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})}/>
          <Input label="Max Players" type="number" value={form.maxPlayers} onChange={(e)=>setForm({...form,maxPlayers:+e.target.value})}/>
          <div className="sm:col-span-2">
            <TextArea label="Description" rows={3} value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})}/>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}
```

---

# 8.7 Services (Student + Staff/Admin)

### `src/pages/Services.jsx`
```jsx
import { useEffect, useState } from "react";
import api from "../api/client";
import PageShell from "../components/PageShell";
import Card from "../components/Card";
import Select from "../components/Select";
import TextArea from "../components/TextArea";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import Loading from "../components/Loading";
import { useAuth } from "../auth/AuthContext";

export default function Services() {
  const { user } = useAuth();
  const isStudent = user?.role === "student";

  const [loading, setLoading] = useState(true);
  const [mine, setMine] = useState([]);
  const [form, setForm] = useState({ category: "IT", description: "" });
  const [err, setErr] = useState("");

  const load = async () => {
    setLoading(true);
    if (isStudent) {
      const res = await api.get("/services/mine");
      setMine(res.data);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    setErr("");
    try {
      await api.post("/services", form);
      setForm({ category: "IT", description: "" });
      load();
    } catch (e) {
      setErr(e.response?.data?.message || "Submit failed");
    }
  };

  if (!isStudent) {
    return (
      <PageShell title="Services" subtitle="Students submit requests. Staff/Admin view All Requests.">
        <Card>
          <p className="text-sm text-gray-700">Go to <b>All Requests</b> to manage requests.</p>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell title="My Service Requests" subtitle="Submit and track your requests">
      <Card>
        <div className="grid gap-3 sm:grid-cols-2">
          <Select label="Category" value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})}>
            <option value="IT">IT</option>
            <option value="Library">Library</option>
            <option value="Housing">Housing</option>
            <option value="Finance">Finance</option>
          </Select>
        </div>

        <div className="mt-3">
          <TextArea label="Description" rows={4} value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})}/>
        </div>

        {err && <p className="mt-2 text-sm text-red-600">{err}</p>}

        <Button className="mt-3" onClick={create}>Submit Request</Button>
      </Card>

      <div className="mt-4">
        {loading ? <Loading/> : mine.length === 0 ? (
          <EmptyState title="No requests" subtitle="Create your first request above."/>
        ) : (
          <div className="grid gap-3">
            {mine.map(r => (
              <Card key={r._id}>
                <p className="text-sm text-gray-600">{r.category}</p>
                <p className="text-sm font-semibold text-gray-900">{r.status}</p>
                <p className="mt-2 text-sm text-gray-700">{r.description}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
```

---

### `src/pages/AdminRequests.jsx` (Staff/Admin, with search + status filter)

```jsx
import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import PageShell from "../components/PageShell";
import Card from "../components/Card";
import Input from "../components/Input";
import Select from "../components/Select";
import Button from "../components/Button";
import Table from "../components/Table";
import EmptyState from "../components/EmptyState";
import Loading from "../components/Loading";

export default function AdminRequests() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("created_desc");

  const load = async () => {
    setLoading(true);
    const res = await api.get("/services");
    setItems(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const update = async (id, newStatus) => {
    await api.put(`/services/${id}`, { status: newStatus });
    load();
  };

  const filtered = useMemo(() => {
    let out = [...items];

    if (q.trim()) {
      const qq = q.toLowerCase();
      out = out.filter(x =>
        (x.category || "").toLowerCase().includes(qq) ||
        (x.description || "").toLowerCase().includes(qq) ||
        (x.status || "").toLowerCase().includes(qq)
      );
    }

    if (status !== "all") out = out.filter(x => x.status === status);

    out.sort((a,b) => {
      if (sort === "created_desc") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === "created_asc") return new Date(a.createdAt) - new Date(b.createdAt);
      return 0;
    });

    return out;
  }, [items, q, status, sort]);

  const columns = [
    { key: "category", header: "Category" },
    { key: "status", header: "Status" },
    { key: "description", header: "Description" },
    { key: "actions", header: "Actions", render: (r) => (
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => update(r._id, "in_progress")}>In Progress</Button>
        <Button onClick={() => update(r._id, "closed")}>Close</Button>
      </div>
    )}
  ];

  return (
    <PageShell title="All Service Requests" subtitle="Staff/Admin: search, filter, and update status">
      <Card>
        <div className="grid gap-3 sm:grid-cols-3">
          <Input label="Search" value={q} onChange={(e)=>setQ(e.target.value)} placeholder="IT, finance, description..." />
          <Select label="Status" value={status} onChange={(e)=>setStatus(e.target.value)}>
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="closed">Closed</option>
          </Select>
          <Select label="Sort" value={sort} onChange={(e)=>setSort(e.target.value)}>
            <option value="created_desc">Newest</option>
            <option value="created_asc">Oldest</option>
          </Select>
        </div>
      </Card>

      <div className="mt-4">
        {loading ? <Loading/> : filtered.length === 0 ? (
          <EmptyState title="No requests found" subtitle="Try different filters/search."/>
        ) : (
          <Table columns={columns} rows={filtered}/>
        )}
      </div>
    </PageShell>
  );
}
```

---

## 8.8 Not Found

### `src/pages/NotFound.jsx`
```jsx
import PageShell from "../components/PageShell";
import Card from "../components/Card";

export default function NotFound() {
  return (
    <PageShell title="404" subtitle="Page not found">
      <Card>
        <p className="text-sm text-gray-700">The requested page does not exist.</p>
      </Card>
    </PageShell>
  );
}
```

---

# 9) App Routing

## `src/App.jsx`
```jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";
import TopBar from "./components/TopBar";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import Events from "./pages/Events";
import Sports from "./pages/Sports";
import Services from "./pages/Services";
import AdminRequests from "./pages/AdminRequests";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <TopBar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
          <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
          <Route path="/sports" element={<ProtectedRoute><Sports /></ProtectedRoute>} />
          <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />

          <Route
            path="/admin/requests"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["admin", "staff"]}>
                  <AdminRequests />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

---

# 10) Run Frontend

```bash
npm run dev
```

Open:
- `http://localhost:5173`

---

# 11) OPTIONAL: Backend Query Param Search/Filter (Snippet)

If you want server-side search/filter, update backend list endpoints like:

### Courses list example
- Accept: `q`, `department`, `sort`
- Use Mongo regex search

Pseudo:
```js
const filter = {};
if (q) filter.$or = [{ title: /q/i }, { code: /q/i }];
if (department) filter.department = department;
const sortObj = sort === "created_desc" ? { createdAt: -1 } : { createdAt: 1 };
Course.find(filter).sort(sortObj);
```

---

✅ END OF COMPLETE TAILWIND FRONTEND (CRUD + SEARCH + FILTER + SORT)
