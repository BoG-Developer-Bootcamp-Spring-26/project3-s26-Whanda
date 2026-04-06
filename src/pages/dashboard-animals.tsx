import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import sidebar from "../components/Sidebar";
import useCurrentUser from "../components/useCurrentUser";

const Sidebar = sidebar;

// change filenames if needed
const LOGO_SRC = "/images/appLogo.png";
const PLUS_SRC = "/images/createNewLogo.png";

type Animal = {
  _id: string;
  name: string;
  breed: string;
  hoursTrained: number;
  imageUrl?: string;
  ownerId: string | { _id: string };
};

export default function DashboardAnimals() {
  const router = useRouter();
  const { user, loading } = useCurrentUser();

  const [animals, setAnimals] = useState<Animal[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    const fetchAnimals = async () => {
      if (!user) return;

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
      </header>

      <div className="flex min-h-[calc(100vh-64px)]">
        <Sidebar />

        {/* MAIN */}
        <main className="flex-1">
          {/* SECTION HEADER */}
          <div className="flex items-center justify-between border-b border-gray-300 px-8 py-5">
            <h1 className="text-[19px] font-semibold text-[#6c625d]">
              Animals
            </h1>

            <button
              onClick={() => router.push("/create-animal")}
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

          {/* CONTENT */}
          <div className="px-8 py-7">
            {error && <p className="mb-4 text-red-600">{error}</p>}

            {pageLoading ? (
              <p>Loading...</p>
            ) : animals.length === 0 ? (
              <div className="rounded-[18px] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <p className="mb-4 text-[16px] text-[#3e3e3e]">
                  You have not created any animals yet.
                </p>

                <button
                  onClick={() => router.push("/create-animal")}
                  className="rounded-[12px] bg-[#e60f0f] px-4 py-2 text-white hover:bg-[#cf0d0d]"
                >
                  Create Your First Animal
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-6">
                {animals.map((animal) => {
                  const initial = animal.name?.charAt(0).toUpperCase();

                  return (
                    <div
                      key={animal._id}
                      className="overflow-hidden rounded-[16px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
                    >
                      {/* IMAGE */}
                      {animal.imageUrl ? (
                        <div className="relative h-[180px] w-full">
                          <img
                            src={animal.imageUrl}
                            alt={animal.name}
                            className="h-[180px] w-full object-cover"
                            />
                        </div>
                      ) : (
                        <div className="h-[180px] w-full bg-gray-200 flex items-center justify-center">
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
                            {user.name} · Trained: {animal.hoursTrained} hours
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