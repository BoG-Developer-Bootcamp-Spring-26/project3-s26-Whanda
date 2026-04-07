import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import sidebar from "../components/Sidebar";
import useCurrentUser from "../components/useCurrentUser";
import SearchBar from "../components/SearchBar";

const Sidebar = sidebar;

const LOGO_SRC = "/images/appLogo.png";
const PEN_SRC = "/images/activeTrainingLogo.png";
const PLUS_SRC = "/images/createNewLogo.png";

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

type Animal = {
  _id: string;
  name: string;
  breed: string;
  ownerId: string | { _id: string };
};

export default function DashboardTraining() {
  const router = useRouter();
  const { user, loading } = useCurrentUser();

  const [logs, setLogs] = useState<TrainingLog[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleDelete = async (trainingId: string) => {
    if (!confirm("Are you sure you want to delete this training log?")) return;

    try {
      const res = await fetch("/api/training", {
        method: "DELETE",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({id: trainingId}),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to delete training log.");
        return;
      }

      setLogs((prevLogs) => prevLogs.filter((log) => log._id !== trainingId));
    } catch {
      setError("Server error while deleting training log.");
    }
  };
  

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      if (!user) {
        return;
      }

      try {
        const [trainingRes, animalRes] = await Promise.all([
          fetch("/api/training"),
          fetch("/api/animal"),
        ]);

        const trainingData = await trainingRes.json();
        const animalData = await animalRes.json();

        if (!trainingRes.ok) {
          setError(trainingData.error || "Failed to fetch training logs.");
          return;
        }

        if (!animalRes.ok) {
          setError(animalData.error || "Failed to fetch animals.");
          return;
        }

        const ownedAnimals = (Array.isArray(animalData) ? animalData : []).filter(
          (animal: Animal) => {
            if (typeof animal.ownerId === "string") {
              return animal.ownerId === user.id;
            }
            return animal.ownerId?._id === user.id;
          }
        );

        const ownedLogs = (Array.isArray(trainingData) ? trainingData : [])
          .filter((log: TrainingLog) => log.userId?._id === user.id)
          .sort(
            (a: TrainingLog, b: TrainingLog) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
          );

        setAnimals(ownedAnimals);
        setLogs(ownedLogs);
      } catch {
        setError("Server error while loading training logs.");
      } finally {
        setPageLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
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
  const filtered = formattedLogs.filter((log) =>
    log.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#efefef]">
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

          <span className="text-[26px] font-extrabold leading-none text-black">
            Progress
          </span>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2">
          <SearchBar onSearch={setSearchQuery} />
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-64px)]">
        <Sidebar />

        <main className="flex-1">
          <div className="flex items-center justify-between border-b border-gray-300 px-8 py-5">
            <h1 className="text-[19px] font-semibold text-[#6c625d]">
              Training logs
            </h1>

            <button
              onClick={() => {
                if (animals.length === 0) {
                  router.push("/create-animal");
                } else {
                  router.push("/create-training");
                }
              }}
              className="flex items-center gap-2 text-[15px] font-medium text-[#6c625d] hover:text-black"
            >
              <Image
                src={PLUS_SRC}
                alt="Create new"
                width={14}
                height={14}
              />
              <span>Create new</span>
            </button>
          </div>

          <div className="px-8 py-7">
            {error && <p className="mb-4 text-red-600">{error}</p>}

            {pageLoading ? (
              <p>Loading...</p>
            ) : animals.length === 0 ? (
              <div className="rounded-[18px] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <p className="mb-4 text-[16px] text-[#3e3e3e]">
                  You need to create an animal before you can add a training log.
                </p>
                <button
                  onClick={() => router.push("/create-animal")}
                  className="rounded-[12px] bg-[#e60f0f] px-4 py-2 text-white hover:bg-[#cf0d0d]"
                >
                  Create Animal First
                </button>
              </div>
            ) : formattedLogs.length === 0 ? (
              <div className="rounded-[18px] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <p className="mb-4 text-[16px] text-[#3e3e3e]">
                  You do not have any training logs yet.
                </p>
                <button
                  onClick={() => router.push("/create-training")}
                  className="rounded-[12px] bg-[#e60f0f] px-4 py-2 text-white hover:bg-[#cf0d0d]"
                >
                  Create Your First Training Log
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {filtered.map((log) => (
                  <div
                    key={log._id}
                    className="flex overflow-hidden rounded-[16px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
                  >
                    <div className="flex w-[84px] flex-col items-center justify-center bg-[#2f317e] px-2 py-5 text-white">
                      <div className="text-[24px] font-extrabold leading-none">
                        {log.day}
                      </div>
                      <div className="mt-2 text-[11px] font-medium uppercase tracking-[0.5px]">
                        {log.monthYear}
                      </div>
                    </div>

                    <div className="flex flex-1 items-center justify-between px-5 py-4">
                      <div className="pr-4">
                        <div className="flex items-baseline gap-2">
                          <h2 className="text-[18px] font-extrabold text-[#2d1212]">
                            {log.title}
                          </h2>
                          <span className="text-[15px] text-[#8a8a8a]">
                            • {log.hours} {log.hours === 1 ? "hour" : "hours"}
                          </span>
                        </div>

                        <p className="mt-1 text-[14px] text-[#9a9a9a]">
                          {log.userId?.name ?? "Unknown"} - {log.animalId?.breed ?? "Unknown"} - {log.animalId?.name ?? "Unknown"}
                        </p>

                        <p className="mt-3 text-[15px] text-[#222222]">
                          {log.description}
                        </p>
                      </div>

                      <button
                        onClick={() => router.push(`/create-training?id=${log._id}`)}
                        className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-[#e60f0f] hover:bg-[#cf0d0d]"
                        aria-label="Edit training log"
                        title="Edit training log"
                      >
                        <Image
                          src={PEN_SRC}
                          alt="Edit"
                          width={18}
                          height={18}
                        />
                      </button>
                    </div>
                    <button
                      onClick={() => handleDelete(log._id)}
                      className="ml-auto text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
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