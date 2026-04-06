import { useState, type FormEvent, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import useCurrentUser from "../components/useCurrentUser";

const LOGO_SRC = "/images/appLogo.png"; 

export default function CreateAccount() {
  const router = useRouter();
  const { user, loading, login } = useCurrentUser();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard-animals");
    }
  }, [loading, user, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill out all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const createRes = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          isAdmin,
        }),
      });

      const createData = await createRes.json();

      if (!createRes.ok) {
        setError(createData.error || "Account creation failed.");
        return;
      }

      const verifyRes = await fetch("/api/user/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        setError(verifyData.error || "Account created, but automatic login failed.");
        return;
      }

      login({
        id: verifyData.userId || verifyData._id,
        name: verifyData.name || name.trim(),
        isAdmin: verifyData.isAdmin,
      });

      router.push("/dashboard-animals");
    } catch {
      setError("Server error while creating account.");
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
            <div className="relative h-[30px] w-[52px] overflow-hidden rounded-[8px]">
              <Image
                src={LOGO_SRC}
                alt="Progress logo"
                fill
                className="object-contain"
                sizes="52px"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="absolute bottom-0 left-0 h-[150px] w-[150px] rounded-tr-full bg-[#ff2020]" />

      <main className="flex min-h-[calc(100vh-60px)] items-center justify-center px-6">
        <div className="w-full max-w-[420px] -translate-y-8">
          <h1 className="mb-10 text-center text-[38px] font-extrabold text-black">
            Create Account
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="mb-1 block text-[15px] font-normal text-[#4b4b4b]"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border-0 border-b-2 border-[#eb1c1c] bg-transparent px-0 pb-1 pt-0 text-[16px] text-black outline-none placeholder:text-transparent focus:ring-0"
              />
            </div>

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

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1 block text-[15px] font-normal text-[#4b4b4b]"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border-0 border-b-2 border-[#eb1c1c] bg-transparent px-0 pb-1 pt-0 text-[16px] text-black outline-none placeholder:text-transparent focus:ring-0"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                id="isAdmin"
                type="checkbox"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                className="h-[18px] w-[18px] appearance-none rounded-none border border-[#eb1c1c] bg-transparent checked:bg-[#eb1c1c] checked:bg-none focus:outline-none focus:ring-0"
              />
              <label
                htmlFor="isAdmin"
                className="text-[15px] font-normal text-[#4b4b4b]"
              >
                Admin access
              </label>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={submitting}
                className="h-[42px] w-full rounded-[13px] bg-[#e60f0f] text-[18px] font-bold text-white transition hover:bg-[#cf0d0d] disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {submitting ? "Creating..." : "Sign up"}
              </button>
            </div>

            {error && (
              <p className="pt-1 text-center text-[14px] text-red-600">
                {error}
              </p>
            )}

            <div className="pt-1 text-center text-[15px] text-[#333333]">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="font-bold text-black hover:underline"
              >
                Sign in
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