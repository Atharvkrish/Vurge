import { useAuth } from "@/lib/auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LayoutDashboard, FileText, Briefcase, LogOut, Plus, Shield, Bell, Sun, Moon, Menu, X, Zap } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useListNotifications } from "@workspace/api-client-react";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-9 h-9 rounded-xl glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}

function NotificationBell() {
  const { user } = useAuth();
  const { data } = useListNotifications(
    { unreadOnly: true, limit: 5 },
    {
      query: {
        enabled: !!user,
        refetchInterval: 30000,
        queryKey: ["notifications-count", user?.id],
      }
    }
  );
  const count = data?.total ?? 0;

  if (!user) return null;

  return (
    <Link href="/notifications">
      <button className="relative w-9 h-9 rounded-xl glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
        <Bell className="w-4 h-4" />
        {count > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full gradient-purple-pink text-white text-[10px] font-bold flex items-center justify-center"
          >
            {count > 9 ? "9+" : count}
          </motion.span>
        )}
      </button>
    </Link>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, setToken } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    setToken(null);
    window.location.href = "/";
  };

  const isActive = (path: string) =>
    location === path
      ? "text-foreground font-semibold"
      : "text-muted-foreground hover:text-foreground";

  return (
    <div className="min-h-[100dvh] flex flex-col mesh-bg">
      <header className="glass sticky top-0 z-50 border-b border-white/[0.07]">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-8 h-8 rounded-xl gradient-purple-pink flex items-center justify-center glow-purple transition-all group-hover:scale-110">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight gradient-text" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Vurge
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex gap-1 items-center text-sm font-medium">
            <Link href="/jobs" className={`px-4 py-2 rounded-xl transition-all ${isActive("/jobs")} hover:bg-white/[0.05]`}>
              Jobs
            </Link>
            <Link href="/micro-internships" className={`px-4 py-2 rounded-xl transition-all ${isActive("/micro-internships")} hover:bg-white/[0.05]`}>
              Micro-Internships
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex gap-2 items-center">
            <ThemeToggle />
            <NotificationBell />

            {!isLoading && !user && (
              <>
                <Button variant="ghost" size="sm" className="hidden sm:flex rounded-xl" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button size="sm" className="btn-gradient rounded-xl px-4 hidden sm:flex" asChild>
                  <Link href="/register">Sign up free</Link>
                </Button>
              </>
            )}

            {!isLoading && user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-2 rounded-xl glass hover:border-primary/30 transition-all text-sm font-medium">
                    <div className="w-6 h-6 rounded-lg gradient-purple-pink flex items-center justify-center text-white text-xs font-bold">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <span className="hidden sm:inline max-w-[120px] truncate">{user.name}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass-card border-white/[0.08] bg-card/95 backdrop-blur-xl mt-2">
                  <div className="px-3 py-2">
                    <div className="font-semibold text-sm truncate">{user.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                    <div className="mt-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full gradient-purple-pink text-white font-medium uppercase tracking-wide">
                        {user.role}
                      </span>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-white/[0.06]" />
                  {user.role === "STUDENT" && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/student/dashboard" className="flex items-center gap-2 cursor-pointer rounded-lg">
                          <LayoutDashboard className="w-4 h-4 text-primary" /> Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/applications" className="flex items-center gap-2 cursor-pointer rounded-lg">
                          <FileText className="w-4 h-4 text-primary" /> My Applications
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {user.role === "EMPLOYER" && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/employer/dashboard" className="flex items-center gap-2 cursor-pointer rounded-lg">
                          <LayoutDashboard className="w-4 h-4 text-primary" /> Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/employer/post-job" className="flex items-center gap-2 cursor-pointer rounded-lg">
                          <Plus className="w-4 h-4 text-primary" /> Post a Job
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/applications" className="flex items-center gap-2 cursor-pointer rounded-lg">
                          <Briefcase className="w-4 h-4 text-primary" /> Applications
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {user.role === "ADMIN" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center gap-2 cursor-pointer rounded-lg">
                        <Shield className="w-4 h-4 text-primary" /> Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2 cursor-pointer rounded-lg">
                      <User className="w-4 h-4 text-primary" /> My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/[0.06]" />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer rounded-lg">
                    <LogOut className="w-4 h-4 mr-2" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden w-9 h-9 rounded-xl glass flex items-center justify-center text-muted-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/[0.07] overflow-hidden"
            >
              <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
                <Link href="/jobs" className="px-4 py-3 rounded-xl glass text-sm font-medium" onClick={() => setMobileOpen(false)}>
                  🔍 Jobs
                </Link>
                <Link href="/micro-internships" className="px-4 py-3 rounded-xl glass text-sm font-medium" onClick={() => setMobileOpen(false)}>
                  ⚡ Micro-Internships
                </Link>
                {!user && (
                  <>
                    <Link href="/login" className="px-4 py-3 rounded-xl glass text-sm font-medium" onClick={() => setMobileOpen(false)}>
                      Log in
                    </Link>
                    <Link href="/register" className="px-4 py-3 rounded-xl btn-gradient text-sm font-medium text-center" onClick={() => setMobileOpen(false)}>
                      Sign up free
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <footer className="border-t border-white/[0.06] py-12 mt-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg gradient-purple-pink flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-lg gradient-text" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Vurge</span>
            </div>
            <p className="text-muted-foreground text-sm text-center">
              Connecting international students with visa-compliant opportunities in Ireland & the UK
            </p>
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} Vurge. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
