import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import sidebar from "../components/Sidebar";
import useCurrentUser from "../components/useCurrentUser";

const Sidebar = sidebar;

const LOGO_SRC = "/images/appLogo.png";

type TrainingLog = {
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

  const [logs, setLogs] = useState<TrainingLog[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    const fetchLogs = async () => {
      if (!user) return;

      if (!user.isAdmin) {
        setError("Admin access only.");
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

        const sortedLogs = (Array.isArray(data) ? data : []).sort(
          (a: TrainingLog, b: TrainingLog) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setLogs(sortedLogs);
      } catch {
        setError("Server error while loading training logs.");
      } finally {
        setPageLoading(false);
      }
    };

    if (user) fetchLogs();
  }, [loading, user, router]);

  const formattedLogs = useMemo(() => {
    return logs.map((log) => {
      const d = new Date(log.date);

      return {
        ...log,
        day: d.getDate().toString(),
        monthYear: d.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
      };
    });
  }, [logs]);

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
      </header>

      <div className="flex min-h-[calc(100vh-64px)]">
        <Sidebar />

        {/* MAIN */}
        <main className="flex-1">
          {/* PAGE TITLE */}
          <div className="border-b border-gray-300 px-8 py-5">
            <h1 className="text-[19px] font-semibold text-[#6c625d]">
              All training logs
            </h1>
          </div>

          {/* CONTENT */}
          <div className="px-8 py-8">
            {error && <p className="mb-4 text-red-600">{error}</p>}

            {pageLoading ? (
              <p>Loading...</p>
            ) : formattedLogs.length === 0 ? (
              <div className="rounded-[18px] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <p>No training logs found.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {formattedLogs.map((log) => (
                  <div
                    key={log._id}
                    className="flex overflow-hidden rounded-[16px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
                  >
                    {/* DATE BLOCK */}
                    <div className="flex w-[84px] flex-col items-center justify-center bg-[#2f317e] px-2 py-5 text-white">
                      <div className="text-[24px] font-extrabold leading-none">
                        {log.day}
                      </div>

                      <div className="mt-2 text-[11px] font-medium uppercase tracking-[0.5px]">
                        {log.monthYear}
                      </div>
                    </div>

                    {/* CARD CONTENT */}
                    <div className="flex flex-1 items-center px-5 py-4">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <h2 className="text-[18px] font-extrabold text-[#2d1212]">
                            {log.title}
                          </h2>

                          <span className="text-[15px] text-[#8a8a8a]">
                            • {log.hours} {log.hours === 1 ? "hour" : "hours"}
                          </span>
                        </div>

                        <p className="mt-1 text-[14px] text-[#9a9a9a]">
                          {log.userId?.name} - {log.animalId?.breed} -{" "}
                          {log.animalId?.name}
                        </p>

                        <p className="mt-3 text-[15px] text-[#222222]">
                          {log.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}