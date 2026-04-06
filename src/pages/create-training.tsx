import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/router";
import sidebar from "../components/Sidebar";
import useCurrentUser from "../components/useCurrentUser";

const Sidebar = sidebar;

type Animal = {
  _id: string;
  name: string;
  breed: string;
  ownerId: string | { _id: string };
};

export default function CreateTraining() {
  const router = useRouter();
  const { user, loading } = useCurrentUser();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [hours, setHours] = useState(1);
  const [animalId, setAnimalId] = useState("");
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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

    if (!title.trim() || !description.trim()) {
      setError("Title and description are required.");
      return;
    }

    if (hours <= 0) {
      setError("Hours must be greater than 0.");
      return;
    }

    if (!animalId) {
      setError("Please select an animal.");
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
          description: description.trim(),
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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-8">
        <h1 className="mb-6 text-3xl font-bold">Create Training Log</h1>

        {pageLoading ? (
          <p>Loading...</p>
        ) : animals.length === 0 ? (
          <div className="rounded bg-white p-6 shadow">
            <p className="mb-4">
              You must create an animal before creating a training log.
            </p>
            <button
              onClick={() => router.push("/create-animal")}
              className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              Create Animal First
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="max-w-xl space-y-4 rounded bg-white p-6 shadow"
          >
            {error && <p className="text-red-600">{error}</p>}

            <div>
              <label className="mb-1 block font-medium">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded border px-3 py-2"
                placeholder="Sit Training"
              />
            </div>

            <div>
              <label className="mb-1 block font-medium">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded border px-3 py-2"
                rows={4}
                placeholder="Practiced sit command..."
              />
            </div>

            <div>
              <label className="mb-1 block font-medium">Hours</label>
              <input
                type="number"
                min="1"
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="w-full rounded border px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block font-medium">Animal</label>
              <select
                value={animalId}
                onChange={(e) => setAnimalId(e.target.value)}
                className="w-full rounded border px-3 py-2"
              >
                {animals.map((animal) => (
                  <option key={animal._id} value={animal._id}>
                    {animal.name} ({animal.breed})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
              >
                {saving ? "Creating..." : "Create Training Log"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/dashboard-training")}
                className="rounded border px-4 py-2 hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}