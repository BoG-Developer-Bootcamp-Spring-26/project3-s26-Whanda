import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import sidebar from "../components/Sidebar";
import useCurrentUser from "../components/useCurrentUser";

const Sidebar = sidebar;

type AdminUser = {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
};

export default function AdminUsers() {
  const router = useRouter();
  const { user, loading } = useCurrentUser();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    const fetchUsers = async () => {
      if (!user) {
        return;
      }

      if (!user.isAdmin) {
        setError("Access denied: admins only.");
        setPageLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/admin/users?userId=${user.id}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to fetch users.");
          return;
        }

        setUsers(data as AdminUser[]);
      } catch {
        setError("Server error while loading users.");
      } finally {
        setPageLoading(false);
      }
    };

    if (user) {
      fetchUsers();
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">All Users</h1>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        {pageLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-4">
            {users.map((u) => (
              <div key={u._id} className="rounded bg-white p-4 shadow">
                <p className="font-semibold">{u.name}</p>
                <p>{u.email}</p>
                <p className="text-sm text-gray-600">
                  {u.isAdmin ? "Admin" : "User"}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}