import { useGetEmployerDashboard, getGetEmployerDashboardQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Users, Briefcase, Plus, FileText, ArrowRight, Star } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const stagger = { show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  SHORTLISTED: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  HIRED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  REJECTED: "bg-rose-500/15 text-rose-400 border-rose-500/20",
};

function DashboardSkeleton() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 space-y-8 animate-pulse">
        <div className="h-28 bg-white/[0.04] rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-28 bg-white/[0.04] rounded-2xl" />)}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-80 bg-white/[0.04] rounded-2xl" />
          <div className="h-80 bg-white/[0.04] rounded-2xl" />
        </div>
      </div>
    </Layout>
  );
}

export default function EmployerDashboard() {
  const { data: dashboard, isLoading } = useGetEmployerDashboard({
    query: { queryKey: getGetEmployerDashboardQueryKey() },
  });

  if (isLoading) return <DashboardSkeleton />;
  if (!dashboard) return null;

  const stats = [
    { label: "Active Jobs", value: dashboard.activeJobs, sub: `of ${dashboard.totalJobs} total`, color: "from-violet-500 to-purple-600", emoji: "💼" },
    { label: "Total Applications", value: dashboard.totalApplications, sub: "all time", color: "from-pink-500 to-rose-500", emoji: "📬" },
    { label: "Pending Review", value: dashboard.pendingApplications ?? 0, sub: "need attention", color: "from-amber-500 to-orange-500", emoji: "⏳" },
  ];

  return (
    <Layout>
      {/* Header */}
      <div className="relative overflow-hidden py-10 px-4 border-b border-white/[0.05]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-[-60%] right-[-10%] w-[400px] h-[400px] rounded-full bg-pink-600/8 blur-[80px]" />
        </div>
        <div className="relative container mx-auto">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="font-extrabold text-3xl md:text-4xl">
                  Employer <span className="gradient-text">Dashboard</span>
                </h1>
                <p className="text-muted-foreground mt-1.5">Manage your job postings and review applications.</p>
              </div>
              <div className="flex gap-3">
                <Button className="glass border-white/[0.1] rounded-xl gap-2" variant="outline" asChild>
                  <Link href="/micro-internships/new"><Plus className="w-4 h-4" /> Micro-Internship</Link>
                </Button>
                <Button className="btn-gradient rounded-xl gap-2" asChild>
                  <Link href="/employer/post-job"><Plus className="w-4 h-4" /> Post Job</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 gap-4"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {stats.map((stat) => (
            <motion.div key={stat.label} variants={fadeUp} className="glass-card p-5">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-xl mb-3`}>
                {stat.emoji}
              </div>
              <div className="text-3xl font-extrabold mb-0.5">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5 opacity-60">{stat.sub}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tables */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent applications */}
          <div className="glass-card overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" /> Recent Applications
              </h2>
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 text-xs" asChild>
                <Link href="/applications">View all →</Link>
              </Button>
            </div>
            <div className="divide-y divide-white/[0.05]">
              {dashboard.recentApplications && dashboard.recentApplications.length > 0 ? (
                dashboard.recentApplications.map((app) => (
                  <div key={app.id} className="p-4 hover:bg-white/[0.03] transition-colors">
                    <div className="flex justify-between items-start mb-1.5 gap-2">
                      <div className="font-medium text-sm">{app.student?.name || "Unknown Applicant"}</div>
                      <span className={`shrink-0 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${STATUS_STYLES[app.status] || STATUS_STYLES.PENDING}`}>
                        {app.status}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mb-1">
                      Applied for:{" "}
                      <Link href={`/jobs/${app.job?.id}`} className="text-foreground hover:text-primary transition-colors">
                        {app.job?.title}
                      </Link>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {app.student?.university}
                      {app.student?.visaType && (
                        <span className="ml-1.5 px-1.5 py-0.5 rounded-sm bg-white/[0.05] text-[10px]">
                          {app.student.visaType.replace(/_/g, " ")}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-sm text-muted-foreground">
                  <div className="text-3xl mb-2">📬</div>
                  No recent applications yet.
                </div>
              )}
            </div>
          </div>

          {/* Active postings */}
          <div className="glass-card overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" /> Active Postings
              </h2>
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 text-xs" asChild>
                <Link href="/employer/jobs">Manage →</Link>
              </Button>
            </div>
            <div className="divide-y divide-white/[0.05]">
              {dashboard.topJobs && dashboard.topJobs.length > 0 ? (
                dashboard.topJobs.map((job) => (
                  <div key={job.id} className="p-4 hover:bg-white/[0.03] transition-colors flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <Link href={`/jobs/${job.id}`} className="font-medium text-sm hover:text-primary transition-colors line-clamp-1">
                        {job.title}
                      </Link>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Posted {new Date(job.createdAt).toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>
                    <span className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                      job.status === "ACTIVE"
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                        : "bg-white/[0.06] text-muted-foreground border-white/[0.08]"
                    }`}>
                      {job.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-sm text-muted-foreground">
                  <div className="text-3xl mb-2">📋</div>
                  No active job postings.{" "}
                  <Link href="/employer/post-job" className="text-primary hover:underline">Post one →</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
