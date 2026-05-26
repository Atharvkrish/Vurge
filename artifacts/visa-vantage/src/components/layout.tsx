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
import { User, LayoutDashboard, FileText, Briefcase, LogOut, Plus, Shield } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, setToken } = useAuth();
  const [location] = useLocation();

  const handleLogout = () => {
    setToken(null);
    window.location.href = "/";
  };

  const isActive = (path: string) =>
    location === path ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground";

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <header className="border-b bg-background sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="font-serif font-bold text-xl text-primary shrink-0">
            VisaVantage
          </Link>

          <nav className="hidden md:flex gap-6 items-center text-sm font-medium">
            <Link href="/jobs" className={`transition-colors ${isActive("/jobs")}`}>Jobs</Link>
            <Link href="/micro-internships" className={`transition-colors ${isActive("/micro-internships")}`}>Micro-Internships</Link>
          </nav>

          <div className="flex gap-3 items-center">
            {!isLoading && !user && (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Sign up free</Link>
                </Button>
              </>
            )}
            {!isLoading && user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-3 h-3 text-primary" />
                    </div>
                    <span className="hidden sm:inline max-w-[120px] truncate">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <div className="px-2 py-1.5 text-xs text-muted-foreground">
                    <div className="font-medium text-foreground truncate">{user.name}</div>
                    <div className="truncate">{user.email}</div>
                  </div>
                  <DropdownMenuSeparator />
                  {user.role === "STUDENT" && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/student/dashboard" className="flex items-center gap-2 cursor-pointer">
                          <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/applications" className="flex items-center gap-2 cursor-pointer">
                          <FileText className="w-4 h-4" /> My Applications
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {user.role === "EMPLOYER" && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/employer/dashboard" className="flex items-center gap-2 cursor-pointer">
                          <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/employer/post-job" className="flex items-center gap-2 cursor-pointer">
                          <Plus className="w-4 h-4" /> Post a Job
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/applications" className="flex items-center gap-2 cursor-pointer">
                          <Briefcase className="w-4 h-4" /> Applications
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {user.role === "ADMIN" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center gap-2 cursor-pointer">
                        <Shield className="w-4 h-4" /> Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                      <User className="w-4 h-4" /> My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <footer className="border-t bg-muted/30 py-10 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4">
          <p className="font-semibold text-foreground mb-1">VisaVantage</p>
          <p>Connecting international students with compliant part-time opportunities in Ireland & the UK</p>
          <p className="mt-3">© {new Date().getFullYear()} VisaVantage. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
