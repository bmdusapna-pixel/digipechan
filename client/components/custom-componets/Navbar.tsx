"use client";
import React, { useState, useEffect } from "react";
import {
  Menu,
  User,
  Mail,
  LogOut,
  ChevronDown,
  Settings,
  LayoutDashboard,
  Home,
  Star,
  CircleDollarSign,
  BadgeInfo,
  Phone,
  ScanQrCode,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import useAuthStore from "@/store/authStore";
import { UserRoles } from "@/common/constants/enum";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import Image from "next/image";
import { apiRequest } from "@/common/utils/apiClient";
import { API_METHODS } from "@/common/constants/apiMethods";
import { API_ENDPOINTS } from "@/common/constants/apiEndpoints";
import { toast } from "sonner";
import { SITE_MAP } from "@/common/constants/siteMap";
import { useCartStore } from "@/store/cartStore";

const NavItems = [
  { id: 1, title: "Home", path: "/", icon: Home },
  { id: 2, title: "Features", path: "/features", icon: Star },
  { id: 3, title: "Pricing", path: "/pricing", icon: CircleDollarSign },
  { id: 4, title: "About", path: "/about", icon: BadgeInfo },
  { id: 5, title: "Contact", path: "/contact", icon: Phone },
  { id: 6, title: "Check QR", path: SITE_MAP.CHECK_VALIDITY, icon: ScanQrCode },
];

const RoleIndicator = ({ role }: { role: UserRoles }) => {
  const roleStyles = {
    [UserRoles.ADMIN]: "bg-secondary/10 text-secondary",
    [UserRoles.BASIC_USER]: "bg-primary/10 text-primary",
    [UserRoles.SALESPERSON]: "bg-accent/10 text-accent",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${roleStyles[role] || "bg-muted text-muted-foreground"}`}
    >
      {role.split("_").join(" ")}
    </span>
  );
};

export default function Navbar() {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const { clearCart } = useCartStore();

  const handleLogout = async () => {
    try {
      await apiRequest(API_METHODS.GET, API_ENDPOINTS.logout);
      logout();
      setUserMenuOpen(false);
      toast.success("Logged out successfully.");
      clearCart();
      window.location.href = SITE_MAP.HOME;
    } catch (err) {
      toast.error("Logout failed. Please try again.");
      console.error("Logout error:", err);
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getUserInitials = (name: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const navLinkClasses =
    "text-sm font-medium text-muted-foreground transition-colors hover:text-primary";
  const mobileSheetLinkClasses =
    "flex w-full items-center rounded-md px-3 py-2.5 text-base font-medium text-muted-foreground hover:bg-muted hover:text-primary";
  const userAvatarGradient =
    "bg-gradient-to-br from-[var(--primary)] to-[var(--accent)]";
  const ctaButtonGradient =
    "bg-gradient-to-br from-[var(--primary)] to-[var(--accent)]";

  return (
    <header
      className={`fixed top-4 right-4 left-4 z-50 rounded-[0.5rem] border border-gray-300/60 bg-white/20 shadow-2xl backdrop-blur-xl transition-all duration-300 ${scrolled ? "bg-white/30" : "bg-white/20"} `}
      style={{
        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.18)",
        borderRadius: "0.5rem",
      }}
    >
      <div className="mx-auto max-w-7xl rounded-[0.5rem] bg-gradient-to-br from-white/40 via-white/10 to-white/5 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex shrink-0 items-center gap-2">
              {/* <QrCode size={32} className="text-primary h-8 w-8" /> */}
              <motion.div
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 1.8,
                  ease: "easeInOut",
                  repeat: Infinity,
                }}
              >
                <Image src="/logo.jpg" alt="Logo" width={80} height={80} />
              </motion.div>
              {/* <span className="text-foreground text-xl font-bold">DigiPehchan</span> */}
            </Link>
          </div>

          <nav className="hidden md:flex md:items-center md:gap-x-8">
            <ul className="flex items-center gap-x-6">
              {NavItems.map((item) => (
                <li key={item.id}>
                  <Link href={item.path} className={navLinkClasses}>
                    {item.title}
                  </Link>
                </li>
              ))}

              {isAuthenticated &&
                user?.roles?.includes(UserRoles.SALESPERSON) && (
                  <li>
                    <Link href="/salesman/dashboard" className={navLinkClasses}>
                      Sales Dashboard
                    </Link>
                  </li>
                )}
              {isAuthenticated &&
                !user?.roles?.includes(UserRoles.SALESPERSON) && (
                  <li>
                    <Link href="/dashboard" className={navLinkClasses}>
                      Dashboard
                    </Link>
                  </li>
                )}
              {isAuthenticated &&
                !user?.roles?.includes(UserRoles.SALESPERSON) && (
                  <li>
                    <Link href="/qr/generated" className={navLinkClasses}>
                      My QRs
                    </Link>
                  </li>
                )}
            </ul>

            {isAuthenticated && user ? (
              <div className="relative ml-4">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="hover:bg-muted focus-visible:ring-ring flex items-center gap-2 rounded-full p-1 pr-2 transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  <div
                    className={`text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${userAvatarGradient}`}
                  >
                    {user.name ? (
                      getUserInitials(user.name)
                    ) : (
                      <User size={16} />
                    )}
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-muted-foreground transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="bg-popover ring-border/50 absolute right-0 mt-2 w-64 origin-top-right rounded-xl p-4 shadow-lg ring-1"
                    >
                      <div className="border-border mb-3 flex items-center gap-3 border-b pb-3">
                        <div
                          className={`text-primary-foreground flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium ${userAvatarGradient}`}
                        >
                          {user.name ? (
                            getUserInitials(user.name)
                          ) : (
                            <User size={20} />
                          )}
                        </div>
                        <div>
                          <p className="text-popover-foreground truncate text-sm font-medium">
                            {user.name}
                          </p>
                          <p className="text-muted-foreground flex items-center gap-1 truncate text-xs">
                            <Mail size={12} /> {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="mb-3 flex flex-wrap gap-1.5">
                        {user.roles?.map((role) => (
                          <RoleIndicator key={role} role={role} />
                        ))}
                      </div>
                      {user?.roles?.includes(UserRoles.SALESPERSON) ? (
                        <Link
                          href="/salesman/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="text-popover-foreground hover:bg-muted flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm"
                        >
                          <LayoutDashboard size={16} /> Sales Dashboard
                        </Link>
                      ) : (
                        <Link
                          href="/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="text-popover-foreground hover:bg-muted flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm"
                        >
                          <LayoutDashboard size={16} /> Dashboard
                        </Link>
                      )}
                      <Link
                        href="/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="text-popover-foreground hover:bg-muted flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm"
                      >
                        <Settings size={16} /> Settings
                      </Link>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleLogout}
                        className={`mt-3 w-full ${ctaButtonGradient} text-primary-foreground hover:opacity-90`}
                      >
                        <LogOut size={14} className="mr-2" /> Sign Out
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="ml-4 flex items-center gap-3">
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">Log in</Link>
                </Button>
                <Button
                  asChild
                  className={`${ctaButtonGradient} text-primary-foreground hover:opacity-90`}
                >
                  <Link href="/auth/sign-up">Sign up</Link>
                </Button>
              </div>
            )}
          </nav>

          {/* Mobile Menu */}
          <div className="flex md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu size={24} />
                  <span className="sr-only">Open main menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="bg-background flex w-[300px] flex-col p-0 sm:w-[340px]"
              >
                <SheetHeader className="border-border border-b p-4">
                  <SheetTitle>
                    <Link href="/" className="flex shrink-0 items-center gap-2">
                      <SheetClose asChild>
                        <div className="flex gap-2">
                          <Image
                            src="/logo.jpg"
                            alt="Logo"
                            width={40}
                            height={40}
                          ></Image>
                          <span className="text-foreground text-lg font-semibold">
                            Digi Pehchan
                          </span>
                        </div>
                      </SheetClose>
                    </Link>
                  </SheetTitle>
                </SheetHeader>

                <nav className="flex-1 space-y-2 overflow-y-auto p-4">
                  {NavItems.map((item) => (
                    <SheetClose asChild key={item.id}>
                      <Link href={item.path} className={mobileSheetLinkClasses}>
                        <item.icon className="mr-2 h-5 w-5" />
                        {item.title}
                      </Link>
                    </SheetClose>
                  ))}

                  {isAuthenticated &&
                    user?.roles?.includes(UserRoles.ADMIN) && (
                      <SheetClose asChild>
                        <Link href="/admin" className={mobileSheetLinkClasses}>
                          Admin
                        </Link>
                      </SheetClose>
                    )}
                  {isAuthenticated &&
                    user?.roles?.includes(UserRoles.SALESPERSON) && (
                      <SheetClose asChild>
                        <Link
                          href="/salesman/dashboard"
                          className={mobileSheetLinkClasses}
                        >
                          Sales Dashboard
                        </Link>
                      </SheetClose>
                    )}
                  {isAuthenticated &&
                    !user?.roles?.includes(UserRoles.SALESPERSON) && (
                      <SheetClose asChild>
                        <Link
                          href="/qr/generated"
                          className={mobileSheetLinkClasses}
                        >
                          My QRs
                        </Link>
                      </SheetClose>
                    )}
                </nav>

                <div className="border-border mt-auto border-t p-4">
                  {isAuthenticated && user ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 rounded-lg p-2">
                        <div
                          className={`text-primary-foreground flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium ${userAvatarGradient}`}
                        >
                          {user.name ? (
                            getUserInitials(user.name)
                          ) : (
                            <User size={20} />
                          )}
                        </div>
                        <div>
                          <p className="text-foreground text-sm font-medium">
                            {user.name}
                          </p>
                          <p className="text-muted-foreground flex items-center gap-1 text-xs">
                            <Mail size={12} /> {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="ml-2 flex flex-wrap gap-1.5">
                        {user.roles?.map((role) => (
                          <RoleIndicator key={role} role={role} />
                        ))}
                      </div>
                      <SheetClose asChild>
                        <Link
                          href="/settings"
                          className={`${mobileSheetLinkClasses} mt-1`}
                        >
                          <Settings size={16} className="mr-2" /> Account
                          Settings
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button
                          variant="default"
                          onClick={handleLogout}
                          className={`w-full ${ctaButtonGradient} text-primary-foreground hover:opacity-90`}
                        >
                          <LogOut size={14} className="mr-2" /> Sign Out
                        </Button>
                      </SheetClose>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <SheetClose asChild>
                        <Button variant="outline" className="w-full" asChild>
                          <Link href="/auth/login">Log in</Link>
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button
                          className={`w-full ${ctaButtonGradient} text-primary-foreground hover:opacity-90`}
                          asChild
                        >
                          <Link href="/auth/sign-up">Sign up</Link>
                        </Button>
                      </SheetClose>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
