import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import useCurrentUser from "../components/useCurrentUser";

const LOGO_SRC = "/images/appLogo.png"; 

export default function Login() {
  const router = useRouter();
  const { user, loading, login } = useCurrentUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard-trainingz");
    }
  }, [loading, user, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/user/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed.");
        return;
      }

      login({
        id: data.userId || data._id,
        name: data.name,
        isAdmin: data.isAdmin,
      });

      router.push("/dashboard-animals");
    } catch {
      setError("Server error while logging in.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#efefef]">
      <header className="h-[60px] border-b border-gray-300 bg-[#e9e9e9] shadow-[0_2px_4px_rgba(0,0,0,0.12)]">
        <div className="flex h-full items-center pl-8">
          <div className="flex items-center gap-3">
            <div className="relative h-[30px] w-[44px] overflow-hidden rounded-[8px] bg-[#ff1d17]">
              <Image
                src={LOGO_SRC}
                alt="Progress logo"
                fill
                className="object-contain"
                sizes="44px"
              />
            </div>
            <span className="text-[26px] font-extrabold leading-none text-black">
              Progress
            </span>
          </div>
        </div>
      </header>

      <div className="absolute bottom-0 left-0 h-[150px] w-[150px] rounded-tr-full bg-[#ff2020]" />

      <main className="flex min-h-[calc(100vh-60px)] items-center justify-center px-6">
        <div className="w-full max-w-[420px] -translate-y-8">
          <h1 className="mb-10 text-center text-[38px] font-extrabold text-black">
            Login
          </h1>

          <form onSubmit={handleSubmit} className="space-y-7">
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-[15px] font-normal text-[#4b4b4b]"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-0 border-b-2 border-[#eb1c1c] bg-transparent px-0 pb-1 pt-0 text-[16px] text-black outline-none placeholder:text-transparent focus:ring-0"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-[15px] font-normal text-[#4b4b4b]"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-0 border-b-2 border-[#eb1c1c] bg-transparent px-0 pb-1 pt-0 text-[16px] text-black outline-none placeholder:text-transparent focus:ring-0"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="h-[42px] w-full rounded-[13px] bg-[#e60f0f] text-[18px] font-bold text-white transition hover:bg-[#cf0d0d] disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {submitting ? "Logging in..." : "Log in"}
              </button>
            </div>

            {error && (
              <p className="pt-1 text-center text-[14px] text-red-600">
                {error}
              </p>
            )}

            <div className="pt-1 text-center text-[15px] text-[#333333]">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => router.push("/create-account")}
                className="font-bold text-black hover:underline"
              >
                Sign up
              </button>
            </div>
          </form>
        </div>
      </main>

      <footer className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-[14px] text-[#555555]">
        <p>Made with ♡ by Team Whanda</p>
        <p>© 2026 BOG Developer Bootcamp. All rights reserved.</p>
      </footer>
    </div>
  );
}