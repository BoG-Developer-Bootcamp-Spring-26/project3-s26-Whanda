import Image from "next/image";
import { useRouter } from "next/router";
import useCurrentUser from "./useCurrentUser";


const TRAINING_ICON_ACTIVE = "/images/activeTrainingLogo.png";
const TRAINING_ICON_INACTIVE = "/images/inactiveTrainingLogo.png";

const ANIMALS_ICON_ACTIVE = "/images/activeAnimalsLogo.png";
const ANIMALS_ICON_INACTIVE = "/images/inactiveAnimalsLogo.png";

const ALL_TRAINING_ICON_ACTIVE = "/images/activeAllTrainingLogo.png";
const ALL_TRAINING_ICON_INACTIVE = "/images/inactiveAllTrainingLogo.png";

const ALL_ANIMALS_ICON_ACTIVE = "/images/activeAllAnimalsLogo.png";
const ALL_ANIMALS_ICON_INACTIVE = "/images/inactiveAllAnimalsLogo.png";

const ALL_USERS_ICON_ACTIVE = "/images/activeAllUsersLogo.png";
const ALL_USERS_ICON_INACTIVE = "/images/inactiveAllUsersLogo.png";

const LOGOUT_ICON = "/images/logoutLogo.png";

export default function Sidebar() {
  const router = useRouter();
  const { user, loading, logout } = useCurrentUser();

  if (loading || !user) {
    return null;
  }

  const pathname = router.pathname;
  const firstInitial = user.name?.charAt(0).toUpperCase() || "U";

  const isTrainingPage =
    pathname === "/dashboard-training" || pathname === "/create-training";

  const isAnimalsPage =
    pathname === "/dashboard-animals" || pathname === "/create-animal";

  const isAdminTrainingPage = pathname === "/admin-training";
  const isAdminAnimalsPage = pathname === "/admin-animals";
  const isAdminUsersPage = pathname === "/admin-users";

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const navButtonBase =
    "flex items-center gap-4 rounded-[12px] text-left transition";
  const navButtonSelected =
    "bg-[#e60f0f] text-white px-4 py-4";
  const navButtonUnselected =
    "bg-transparent text-[#666666] hover:bg-gray-200 px-4 py-4";

  const adminButtonBase =
    "flex items-center gap-4 rounded-[12px] text-left transition px-2 py-3";
  const adminButtonSelected = "bg-gray-200 text-black";
  const adminButtonUnselected = "text-[#666666] hover:bg-gray-200";

  return (
    <aside className="flex min-h-full w-[198px] flex-col justify-between border-r border-gray-300 bg-[#efefef]">
      <div className="px-3 pt-4">
        <nav className="flex flex-col">
          <button
            onClick={() => router.push("/dashboard-training")}
            className={`${navButtonBase} ${
              isTrainingPage ? navButtonSelected : navButtonUnselected
            }`}
          >
            <Image
              src={
                isTrainingPage
                  ? TRAINING_ICON_ACTIVE
                  : TRAINING_ICON_INACTIVE
              }
              alt="Training logs"
              width={22}
              height={22}
            />
            <span className="text-[16px] font-semibold">Training logs</span>
          </button>

          <button
            onClick={() => router.push("/dashboard-animals")}
            className={`mt-2 ${navButtonBase} ${
              isAnimalsPage ? navButtonSelected : navButtonUnselected
            }`}
          >
            <Image
              src={
                isAnimalsPage ? ANIMALS_ICON_ACTIVE : ANIMALS_ICON_INACTIVE
              }
              alt="Animals"
              width={22}
              height={22}
            />
            <span className="text-[16px] font-semibold">Animals</span>
          </button>

          <div className="mx-3 mt-5 border-t border-gray-300" />

          <div className="px-3 pt-5">
            <p className="mb-4 text-[18px] font-bold text-[#5b5b5b]">
              Admin access
            </p>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => router.push("/admin-training")}
                className={`${adminButtonBase} ${
                  isAdminTrainingPage
                    ? adminButtonSelected
                    : adminButtonUnselected
                }`}
              >
                <Image
                  src={
                    isAdminTrainingPage
                      ? ALL_TRAINING_ICON_ACTIVE
                      : ALL_TRAINING_ICON_INACTIVE
                  }
                  alt="All training"
                  width={24}
                  height={24}
                />
                <span className="text-[16px] font-medium">All training</span>
              </button>

              <button
                onClick={() => router.push("/admin-animals")}
                className={`${adminButtonBase} ${
                  isAdminAnimalsPage
                    ? adminButtonSelected
                    : adminButtonUnselected
                }`}
              >
                <Image
                  src={
                    isAdminAnimalsPage
                      ? ALL_ANIMALS_ICON_ACTIVE
                      : ALL_ANIMALS_ICON_INACTIVE
                  }
                  alt="All animals"
                  width={24}
                  height={24}
                />
                <span className="text-[16px] font-medium">All animals</span>
              </button>

              <button
                onClick={() => router.push("/admin-users")}
                className={`${adminButtonBase} ${
                  isAdminUsersPage
                    ? adminButtonSelected
                    : adminButtonUnselected
                }`}
              >
                <Image
                  src={
                    isAdminUsersPage
                      ? ALL_USERS_ICON_ACTIVE
                      : ALL_USERS_ICON_INACTIVE
                  }
                  alt="All users"
                  width={24}
                  height={24}
                />
                <span className="text-[16px] font-medium">All users</span>
              </button>
            </div>
          </div>
        </nav>
      </div>

      <div className="px-3 pb-5">
        <div className="mx-1 mb-5 border-t border-gray-300" />

        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-4">
            <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#e60f0f] text-[22px] font-bold text-white">
              {firstInitial}
            </div>

            <div>
              <p className="text-[17px] font-bold leading-tight text-[#4f4f4f]">
                {user.name}
              </p>
              <p className="text-[14px] text-[#666666]">
                {user.isAdmin ? "Admin" : "User"}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex h-[36px] w-[36px] items-center justify-center rounded hover:bg-gray-200"
            aria-label="Log out"
            title="Log out"
          >
            <Image
              src={LOGOUT_ICON}
              alt="Log out"
              width={24}
              height={24}
            />
          </button>
        </div>
      </div>
    </aside>
  );
}