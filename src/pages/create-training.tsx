import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import sidebar from "../components/Sidebar";
import useCurrentUser from "../components/useCurrentUser";

const Sidebar = sidebar;

const LOGO_SRC = "/images/appLogo.png";

type Animal = {
  _id: string;
  name: string;
  breed: string;
  ownerId: string | { _id: string };
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function CreateTraining() {
  const router = useRouter();
  const { user, loading } = useCurrentUser();

  const [title, setTitle] = useState("");
  const [hours, setHours] = useState(1);
  const [note, setNote] = useState("");
  const [animalId, setAnimalId] = useState("");
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const today = useMemo(() => new Date(), []);
  const [month, setMonth] = useState(MONTHS[today.getMonth()]);
  const [day, setDay] = useState(today.getDate().toString());
  const [year, setYear] = useState(today.getFullYear().toString());

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    const fetchAnimals = async () => {
      if (!user) {
        return;
      }

      try {
        const res = await fetch("/api/animal");
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to fetch animals.");
          return;
        }

        const ownedAnimals = (Array.isArray(data) ? data : []).filter(
          (animal: Animal) => {
            if (typeof animal.ownerId === "string") {
              return animal.ownerId === user.id;
            }
            return animal.ownerId?._id === user.id;
          }
        );

        setAnimals(ownedAnimals);

        if (ownedAnimals.length > 0) {
          setAnimalId(ownedAnimals[0]._id);
        }
      } catch {
        setError("Server error while loading animals.");
      } finally {
        setPageLoading(false);
      }
    };

    if (user) {
      fetchAnimals();
    }
  }, [loading, user, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) {
      setError("You must be logged in.");
      return;
    }

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    if (!animalId) {
      setError("Please select an animal.");
      return;
    }

    if (hours <= 0) {
      setError("Total hours trained must be greater than 0.");
      return;
    }

    if (!note.trim()) {
      setError("Note is required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/training", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: note.trim(),
          hours,
          userId: user.id,
          animalId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create training log.");
        return;
      }

      router.push("/dashboard-training");
    } catch {
      setError("Server error while creating training log.");
    } finally {
      setSaving(false);
    }
  };

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

          <span className="text-[26px] font-extrabold text-black">
            Progress
          </span>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-64px)]">
        <Sidebar />

        <main className="flex-1">
          <div className="border-b border-gray-300 px-8 py-5">
            <h1 className="text-[19px] font-semibold text-[#6c625d]">
              Training logs
            </h1>
          </div>

          <div className="px-8 py-6">
            {pageLoading ? (
              <p>Loading...</p>
            ) : animals.length === 0 ? (
              <div className="rounded-[18px] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <p className="mb-4 text-[16px] text-[#3e3e3e]">
                  You must create an animal before creating a training log.
                </p>
                <button
                  onClick={() => router.push("/create-animal")}
                  className="rounded-[12px] bg-[#e60f0f] px-4 py-2 text-white hover:bg-[#cf0d0d]"
                >
                  Create Animal First
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="mx-auto max-w-[555px]"
              >
                {error && (
                  <p className="mb-4 text-[14px] text-red-600">{error}</p>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-[16px] font-bold text-[#2f2f2f]">
                      Title
                    </label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Title"
                      className="h-[48px] w-full rounded-[4px] border border-[#c9c9c9] bg-[#efefef] px-4 text-[16px] text-[#4a4a4a] outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[16px] font-bold text-[#2f2f2f]">
                      Select Animal
                    </label>
                    <select
                      value={animalId}
                      onChange={(e) => setAnimalId(e.target.value)}
                      className="h-[44px] w-full rounded-[4px] border border-[#c9c9c9] bg-[#efefef] px-4 text-[16px] font-semibold text-[#5a5a5a] outline-none"
                    >
                      {animals.map((animal) => (
                        <option key={animal._id} value={animal._id}>
                          {animal.name} - {animal.breed}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-[16px] font-bold text-[#2f2f2f]">
                      Total hours trained
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={hours}
                      onChange={(e) => setHours(Number(e.target.value))}
                      className="h-[46px] w-full rounded-[4px] border border-[#c9c9c9] bg-[#efefef] px-4 text-[16px] font-semibold text-[#5a5a5a] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-[1.2fr_0.8fr_1fr] gap-4">
                    <div>
                      <label className="mb-1 block text-[16px] font-bold text-[#2f2f2f]">
                        Month
                      </label>
                      <select
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="h-[44px] w-full rounded-[4px] border border-[#c9c9c9] bg-[#efefef] px-4 text-[16px] text-[#5a5a5a] outline-none"
                      >
                        {MONTHS.map((monthName) => (
                          <option key={monthName} value={monthName}>
                            {monthName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-[16px] font-bold text-[#2f2f2f]">
                        Date
                      </label>
                      <input
                        value={day}
                        onChange={(e) => setDay(e.target.value)}
                        className="h-[44px] w-full rounded-[4px] border border-[#c9c9c9] bg-[#efefef] px-4 text-[16px] text-[#8a8a8a] outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-[16px] font-bold text-[#2f2f2f]">
                        Year
                      </label>
                      <input
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="h-[44px] w-full rounded-[4px] border border-[#c9c9c9] bg-[#efefef] px-4 text-[16px] text-[#5a5a5a] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-[16px] font-bold text-[#2f2f2f]">
                      Note
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Note"
                      rows={7}
                      className="w-full rounded-[4px] border border-[#c9c9c9] bg-[#efefef] px-4 py-3 text-[16px] text-[#4a4a4a] outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="mt-8 flex gap-6">
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard-training")}
                    className="h-[36px] w-[114px] rounded-[4px] border border-[#e60f0f] bg-transparent text-[16px] font-medium text-[#e60f0f] hover:bg-red-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="h-[36px] w-[114px] rounded-[4px] bg-[#e60f0f] text-[16px] font-semibold text-white hover:bg-[#cf0d0d] disabled:bg-gray-400"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}