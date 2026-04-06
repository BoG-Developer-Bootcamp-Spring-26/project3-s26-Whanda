import { useEffect } from "react";
import { useRouter } from "next/router";
import useCurrentUser from "../components/useCurrentUser";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useCurrentUser();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (user) {
      router.replace("/dashboard-animals");
    } else {
      router.replace("/login");
    }
  }, [loading, user, router]);

  return null;
}
