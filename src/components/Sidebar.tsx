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

type SidebarItemProps = {
  label: string;
  active: boolean;
  activeIcon: string;
  inactiveIcon: string;
  onClick: () => void;
};

function SidebarItem({
  label,
  active,
  activeIcon,
  inactiveIcon,
  onClick,
}: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 rounded-[12px] px-4 py-4 text-left transition ${
        active
          ? "bg-[#e60f0f] text-white"
          : "bg-transparent text-[#666666] hover:bg-gray-200"
      }`}
    >
      <Image
        src={active ? activeIcon : inactiveIcon}
        alt={label}
        width={24}
        height={24}
      />
      <span className="text-[16px] font-semibold">{label}</span>
    </button>
  );
}

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

  return (
    <aside className="sticky top-[64px] flex h-[calc(100vh-64px)] w-[210px] shrink-0 flex-col justify-between border-r border-gray-300 bg-[#efefef]">
      <div className="px-3 pt-4">
        <nav className="flex flex-col">
          <SidebarItem
            label="Training logs"
            active={isTrainingPage}
            activeIcon={TRAINING_ICON_ACTIVE}
            inactiveIcon={TRAINING_ICON_INACTIVE}
            onClick={() => router.push("/dashboard-training")}
          />

          <div className="mt-2">
            <SidebarItem
              label="Animals"
              active={isAnimalsPage}
              activeIcon={ANIMALS_ICON_ACTIVE}
              inactiveIcon={ANIMALS_ICON_INACTIVE}
              onClick={() => router.push("/dashboard-animals")}
            />
          </div>

          {user.isAdmin && (
            <>
              <div className="mx-3 mt-5 border-t border-gray-300" />

              <div className="px-3 pt-5">
                <p className="mb-4 text-[18px] font-bold text-[#5b5b5b]">
                  Admin access
                </p>

                <div className="flex flex-col gap-2">
                  <SidebarItem
                    label="All training"
                    active={isAdminTrainingPage}
                    activeIcon={ALL_TRAINING_ICON_ACTIVE}
                    inactiveIcon={ALL_TRAINING_ICON_INACTIVE}
                    onClick={() => router.push("/admin-training")}
                  />

                  <SidebarItem
                    label="All animals"
                    active={isAdminAnimalsPage}
                    activeIcon={ALL_ANIMALS_ICON_ACTIVE}
                    inactiveIcon={ALL_ANIMALS_ICON_INACTIVE}
                    onClick={() => router.push("/admin-animals")}
                  />

                  <SidebarItem
                    label="All users"
                    active={isAdminUsersPage}
                    activeIcon={ALL_USERS_ICON_ACTIVE}
                    inactiveIcon={ALL_USERS_ICON_INACTIVE}
                    onClick={() => router.push("/admin-users")}
                  />
                </div>
              </div>
            </>
          )}
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