import PageShell from "../components/PageShell";
import Card from "../components/Card";

export default function NotFound() {
  return (
    <PageShell title="404" subtitle="Page not found">
      <Card glass>
        <p className="text-sm text-gray-700">The requested page does not exist.</p>
      </Card>
    </PageShell>
  );
}
