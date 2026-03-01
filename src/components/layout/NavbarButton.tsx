import { useTranslations } from "next-intl";
import { useAuthToken, useAuthUser } from "@/store/authStore";
import { Link, usePathname } from "@/i18n/navigation";
import { Button } from "../ui/button";
import { openSignInModal } from "@/components/modals/SignInModalHandler";
import { useLogout } from "@/lib/auth-utils";
import { LogOut, LayoutDashboard } from "lucide-react";

const NavbarButton = () => {
  const token = useAuthToken();
  const user = useAuthUser();
  const pathname = usePathname();
  const t = useTranslations("navbar");
  const isSignInPage = pathname === "/sign-in";
  const logout = useLogout();

  // Determine dashboard path based on user role
  let dashboardPath = null;
  if (user && user.role) {
    if (user.role.toLowerCase() === "admin") dashboardPath = "/dashboard/admin";
    else if (user.role.toLowerCase() === "center")
      dashboardPath = "/dashboard/center";
    else if (user.role.toLowerCase() === "nursery")
      dashboardPath = "/dashboard/nursery";
    else if (user.role === "branch_admin")
      dashboardPath = user.center_id
        ? "/dashboard/center"
        : "/dashboard/nursery";
    else if (user.role.toLowerCase() === "parent")
      dashboardPath = "/dashboard/parent";
  }

  return (
    <div className="flex gap-4 items-center ltr:ml-2 rtl:mr-2">
      {!token ? (
        <>
          {pathname === "/sign-up" ||
          pathname === "/sign-up/center" ||
          pathname === "/sign-up/nursery" ||
          pathname === "/sign-up/parent" ? (
            <Button
              size={"sm"}
              className="font-semibold px-6"
              onClick={openSignInModal}
            >
              {t("buttons.sign-in")}
            </Button>
          ) : (
            <Button asChild size={"sm"} className="font-semibold px-6">
              <Link href="/sign-up">{t("buttons.sign-up")}</Link>
            </Button>
          )}
        </>
      ) : (
        <>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => logout()}
            title={t("buttons.logout")}
          >
            <LogOut className="size-4" />
            {/* {t("buttons.logout")} */}
          </Button>

          {dashboardPath && (
            <Button size="sm" variant="default" asChild>
              <Link href={dashboardPath} title={t("buttons.dashboard")}>
                <LayoutDashboard className="size-4" />
                {t("buttons.dashboard")}
              </Link>
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default NavbarButton;
