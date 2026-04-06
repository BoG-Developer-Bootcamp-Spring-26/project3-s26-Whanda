import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import sidebar from "../components/Sidebar";
import useCurrentUser from "../components/useCurrentUser";
import SearchBar from "../components/SearchBar";

const Sidebar = sidebar;
const LOGO_SRC = "/images/appLogo.png";

type AdminAnimal = {
  _id: string;
  name: string;
  breed: string;
  hoursTrained: number;
  imageUrl?: string;
  ownerId: {
    _id: string;
    name: string;
  };
};

export default function AdminAnimals() {
  const router = useRouter();
  const { user, loading } = useCurrentUser();

  const [animals, setAnimals] = useState<AdminAnimal[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const filtered = animals.filter((animal) => 
    animal.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (animalId: string) => {
    if (!confirm("Are you sure you want to delete this animal?")) return;

    try {
      const res = await fetch("/api/animal", {
        method: "DELETE",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({id: animalId}),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to delete animal.");
        return;
      }

      setAnimals((prev) => prev.filter((a) => a._id !== animalId));
    } catch {
      setError("Server error while deleting animal.");
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    const fetchAnimals = async () => {
      if (!user) return;

      if (!user.isAdmin) {
        setError("Admin access only.");
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

        setAnimals(Array.isArray(data) ? data : []);
      } catch {
        setError("Server error while loading animals.");
      } finally {
        setPageLoading(false);
      }
    };

    if (user) fetchAnimals();
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
              All animals
            </h1>
          </div>

          {/* GRID */}
          <div className="px-8 py-7">
            {error && <p className="mb-4 text-red-600">{error}</p>}

            {pageLoading ? (
              <p>Loading...</p>
            ) : animals.length === 0 ? (
              <div className="rounded-[18px] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <p>No animals found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-6">
                {filtered.map((animal) => {
                  const initial =
                    animal.name?.charAt(0).toUpperCase() || "A";

                  return (
                    <div
                      key={animal._id}
                      className="overflow-hidden rounded-[16px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
                    >
                      {/* IMAGE */}
                      {animal.imageUrl ? (
                        <img
                          src={animal.imageUrl}
                          alt={animal.name}
                          className="h-[180px] w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-[180px] w-full items-center justify-center bg-gray-200">
                          No Image
                        </div>
                      )}

                      {/* CARD INFO */}
                      <div className="flex items-center gap-3 px-4 py-4">
                        <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#e60f0f] text-white font-bold">
                          {initial}
                        </div>

                        <div>
                          <div className="text-[16px] font-semibold text-[#2d1212]">
                            {animal.name} - {animal.breed}
                          </div>

                          <div className="text-[13px] text-[#8a8a8a]">
                            {animal.ownerId?.name} • Trained: {animal.hoursTrained} hours
                          </div>
                        </div>
                        <button                                                                                                               
                          onClick={() => handleDelete(animal._id)}
                          className="ml-auto text-[13px] text-red-500 hover:text-red-700"
                        >                                                                                                                     
                          Delete
                        </button>
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