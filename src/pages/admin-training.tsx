import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import sidebar from "../components/Sidebar";
import useCurrentUser from "../components/useCurrentUser";

const Sidebar = sidebar;

type AdminTrainingLog = {
  _id: string;
  title: string;
  description: string;
  hours: number;
  date: string;
  userId: {
    _id: string;
    name: string;
  };
  animalId: {
    _id: string;
    name: string;
    breed: string;
  };
};

export default function AdminTraining() {
  const router = useRouter();
  const { user, loading } = useCurrentUser();

  const [logs, setLogs] = useState<AdminTrainingLog[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    const fetchLogs = async () => {
      if (!user) {
        return;
      }

      if (!user.isAdmin) {
        setError("Access denied: admins only.");
        setPageLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/admin/training?userId=${user.id}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to fetch training logs.");
          return;
        }

        const sortedLogs = (data as AdminTrainingLog[]).sort(
          (a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setLogs(sortedLogs);
      } catch {
        setError("Server error while loading training logs.");
      } finally {
        setPageLoading(false);
      }
    };

    if (user) {
      fetchLogs();
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">All Training Logs</h1>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        {pageLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log._id} className="rounded bg-white p-4 shadow">
                <div className="flex items-start justify-between">
                  <h2 className="text-xl font-semibold">{log.title}</h2>
                  <span className="text-sm text-gray-500">
                    {new Date(log.date).toLocaleDateString()}
                  </span>
                </div>

                <p className="mt-2 text-gray-700">{log.description}</p>

                <div className="mt-3 text-sm text-gray-600 space-y-1">
                  <p>User: {log.userId?.name}</p>
                  <p>
                    Animal: {log.animalId?.name} ({log.animalId?.breed})
                  </p>
                  <p>Hours: {log.hours}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}