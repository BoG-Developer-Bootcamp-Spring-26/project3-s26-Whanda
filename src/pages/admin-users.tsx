import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import sidebar from "../components/Sidebar";
import useCurrentUser from "../components/useCurrentUser";
import SearchBar from "../components/SearchBar";

const Sidebar = sidebar;
const LOGO_SRC = "/images/appLogo.png";

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

  const [searchQuery, setSearchQuery] = useState("");
  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    const fetchUsers = async () => {
      if (!user) return;

      if (!user.isAdmin) {
        setError("Admin access only.");
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

        setUsers(Array.isArray(data) ? data : []);
      } catch {
        setError("Server error while loading users.");
      } finally {
        setPageLoading(false);
      }
    };

    if (user) fetchUsers();
  }, [loading, user, router]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-[#efefef]">
      {/* HEADER */}
      <header className="flex h-[64px] items-center border-b border-gray-300 bg-[#e9e9e9] px-6 shadow-[0_2px_4px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-3">
          <div className="relative h-[30px] w-[52px] overflow-hidden rounded-[8px]">
            <Image
              src={LOGO_SRC}
              alt="Progress logo"
              fill
              className="object-contain"
              sizes="52px"
            />
          </div>

          <span className="text-[26px] font-extrabold text-black">
            Progress
          </span>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2">
          <SearchBar onSearch={setSearchQuery} />
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-64px)]">
        <Sidebar />

        {/* MAIN CONTENT */}
        <main className="flex-1">
          {/* PAGE TITLE */}
          <div className="border-b border-gray-300 px-8 py-5">
            <h1 className="text-[19px] font-semibold text-[#6c625d]">
              All users
            </h1>
          </div>

          {/* GRID */}
          <div className="px-8 py-7">
            {error && <p className="mb-4 text-red-600">{error}</p>}

            {pageLoading ? (
              <p>Loading...</p>
            ) : users.length === 0 ? (
              <div className="rounded-[18px] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <p>No users found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-6">
                {filtered.map((u) => {
                  const initial = u.name?.charAt(0).toUpperCase() || "U";

                  return (
                    <div
                      key={u._id}
                      className="rounded-[16px] bg-white px-4 py-4 shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#e60f0f] text-white font-bold">
                          {initial}
                        </div>

                        <div>
                          <div className="text-[16px] font-semibold text-[#2d1212]">
                            {u.name}
                          </div>

                          <div className="text-[13px] text-[#8a8a8a]">
                            {u.isAdmin ? "Admin" : "User"} • Atlanta, Georgia
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}