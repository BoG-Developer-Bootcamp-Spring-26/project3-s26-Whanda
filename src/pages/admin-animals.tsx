import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import sidebar from "../components/Sidebar";
import useCurrentUser from "../components/useCurrentUser";

const Sidebar = sidebar;

type AdminAnimal = {
  _id: string;
  name: string;
  breed: string;
  hoursTrained: number;
  imageUrl?: string;
  ownerId: {
    _id: string;
    name: string;
    email: string;
  };
};

export default function AdminAnimals() {
  const router = useRouter();
  const { user, loading } = useCurrentUser();

  const [animals, setAnimals] = useState<AdminAnimal[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
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

      if (!user.isAdmin) {
        setError("Access denied: admins only.");
        setPageLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/admin/animals?userId=${user.id}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to fetch animals.");
          return;
        }

        setAnimals(data as AdminAnimal[]);
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

  if (loading || !user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">All Animals</h1>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        {pageLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {animals.map((animal) => (
              <div key={animal._id} className="rounded bg-white p-4 shadow">
                {animal.imageUrl ? (
                  <img
                    src={animal.imageUrl}
                    alt={animal.name}
                    className="mb-3 h-48 w-full rounded object-cover"
                  />
                ) : (
                  <div className="mb-3 h-48 w-full rounded bg-gray-200 flex items-center justify-center text-gray-500">
                    No Image
                  </div>
                )}

                <h2 className="text-xl font-semibold">{animal.name}</h2>
                <p>Breed: {animal.breed}</p>
                <p>Hours Trained: {animal.hoursTrained}</p>
                <p className="text-sm text-gray-600 mt-2">
                  Owner: {animal.ownerId?.name}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}