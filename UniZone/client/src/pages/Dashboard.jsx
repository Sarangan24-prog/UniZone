import PageShell from "../components/PageShell";
import Card from "../components/Card";
import { useAuth } from "../auth/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <PageShell title="Dashboard" subtitle={`Welcome back, ${user?.name || 'User'}`}>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center">
              <span className="text-white font-bold text-lg">{user?.name?.charAt(0)?.toUpperCase()}</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">User Profile</p>
              <p className="text-lg font-bold text-gray-900">{user?.name}</p>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-100">
            <span className="inline-flex items-center px-3 py-1 rounded-lg bg-gray-100 text-xs font-semibold text-gray-700">{user?.role}</span>
          </div>
        </Card>

        <Card>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Quick Access</p>
          <div className="grid grid-cols-2 gap-3">
            <a href="/courses" className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-200 transition-all duration-200 border border-blue-200/50">
              <p className="text-sm font-bold text-blue-900">Courses</p>
            </a>
            <a href="/events" className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 hover:from-purple-100 hover:to-purple-200 transition-all duration-200 border border-purple-200/50">
              <p className="text-sm font-bold text-purple-900">Events</p>
            </a>
            <a href="/sports" className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100/50 hover:from-green-100 hover:to-green-200 transition-all duration-200 border border-green-200/50">
              <p className="text-sm font-bold text-green-900">Sports</p>
            </a>
            <a href="/services" className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50 hover:from-orange-100 hover:to-orange-200 transition-all duration-200 border border-orange-200/50">
              <p className="text-sm font-bold text-orange-900">Services</p>
            </a>
          </div>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Platform Modules</p>
          <ul className="space-y-2">
            {["Courses", "Events", "Sports", "Services"].map((module) => (
              <li key={module} className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                {module}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </PageShell>
  );
}
