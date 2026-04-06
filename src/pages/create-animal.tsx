import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/router";
import sidebar from "../components/Sidebar";
import useCurrentUser from "../components/useCurrentUser";

const Sidebar = sidebar;

export default function CreateAnimal() {
  const router = useRouter();
  const { user, loading } = useCurrentUser();

  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [hoursTrained, setHoursTrained] = useState(0);
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) {
      setError("You must be logged in.");
      return;
    }

    if (!name.trim() || !breed.trim()) {
      setError("Name and breed are required.");
      return;
    }

    if (hoursTrained < 0) {
      setError("Hours trained cannot be negative.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/animal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          breed: breed.trim(),
          hoursTrained,
          imageUrl: imageUrl.trim(),
          ownerId: user.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create animal.");
        return;
      }

      setSuccess("Animal created successfully.");

      setTimeout(() => {
        router.push("/dashboard-animals");
      }, 400);
    } catch {
      setError("Server error while creating animal.");
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
        <h1 className="text-3xl font-bold mb-6">Create Animal</h1>

        <form
          onSubmit={handleSubmit}
          className="max-w-xl rounded bg-white p-6 shadow space-y-4"
        >
          {error && <p className="text-red-600">{error}</p>}
          {success && <p className="text-green-600">{success}</p>}

          <div>
            <label className="block mb-1 font-medium">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded border px-3 py-2"
              placeholder="Buddy"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Breed</label>
            <input
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              className="w-full rounded border px-3 py-2"
              placeholder="Golden Retriever"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Hours Trained</label>
            <input
              type="number"
              min="0"
              value={hoursTrained}
              onChange={(e) => setHoursTrained(Number(e.target.value))}
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Profile Picture URL</label>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full rounded border px-3 py-2"
              placeholder="https://..."
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
            >
              {saving ? "Creating..." : "Create Animal"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/dashboard-animals")}
              className="rounded border px-4 py-2 hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}