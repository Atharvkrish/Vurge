import { useGetStudentDashboard, getGetStudentDashboardQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { JobCard } from "@/components/job-card";
import { FileText, Briefcase, Clock, CheckCircle2, ArrowRight, TrendingUp } from "lucide-react";
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
  WITHDRAWN: "bg-white/[0.06] text-muted-foreground border-white/[0.08]",
};

function DashboardSkeleton() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 space-y-8 animate-pulse">
        <div className="h-28 bg-white/[0.04] rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 bg-white/[0.04] rounded-2xl" />)}
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 h-80 bg-white/[0.04] rounded-2xl" />
          <div className="h-80 bg-white/[0.04] rounded-2xl" />
        </div>
      </div>
    </Layout>
  );
}

export default function StudentDashboard() {
  const { data: dashboard, isLoading } = useGetStudentDashboard({
    query: { queryKey: getGetStudentDashboardQueryKey() },
  });

  if (isLoading) return <DashboardSkeleton />;
  if (!dashboard) return null;

  const stats = [
    { label: "Total Applied", value: dashboard.totalApplications, icon: Briefcase, color: "from-violet-500 to-purple-600", emoji: "💼" },
    { label: "Pending", value: dashboard.pendingApplications ?? 0, icon: Clock, color: "from-blue-500 to-cyan-500", emoji: "⏳" },
    { label: "Shortlisted", value: dashboard.shortlistedApplications ?? 0, icon: CheckCircle2, color: "from-amber-500 to-orange-500", emoji: "⭐" },
    {
      label: "CV Score",
      value: dashboard.cvScore != null ? `${dashboard.cvScore}/100` : "N/A",
      icon: FileText,
      color: "from-emerald-500 to-teal-500",
      emoji: "📄",
      link: dashboard.cvScore == null ? "/cv-builder" : undefined,
      linkLabel: "Build CV",
    },
  ];

  return (
    <Layout>
      {/* Header */}
      <div className="relative overflow-hidden py-10 px-4 border-b border-white/[0.05]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-[-60%] left-[-10%] w-[400px] h-[400px] rounded-full bg-violet-600/8 blur-[80px]" />
        </div>
        <div className="relative container mx-auto">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="font-extrabold text-3xl md:text-4xl">
                  Student <span className="gradient-text">Dashboard</span>
                </h1>
                <p className="text-muted-foreground mt-1.5">Track your applications and explore visa-matched opportunities.</p>
              </div>
              <div className="flex gap-3">
                <Button className="glass border-white/[0.1] rounded-xl" variant="outline" asChild>
                  <Link href="/applications">All Applications</Link>
                </Button>
                <Button className="btn-gradient rounded-xl" asChild>
                  <Link href="/jobs">Find Jobs <ArrowRight className="w-4 h-4 ml-1.5" /></Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
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
              {stat.link && (
                <Link href={stat.link} className="text-xs text-primary hover:underline mt-1 block">
                  {stat.linkLabel} →
                </Link>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Main content */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Matching jobs */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-xl flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" /> Matching Jobs
              </h2>
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80" asChild>
                <Link href="/jobs">View all →</Link>
              </Button>
            </div>

            {dashboard.matchingJobs && dashboard.matchingJobs.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {dashboard.matchingJobs.slice(0, 4).map((job, i) => (
                  <JobCard key={job.id} job={job as any} linkTo={`/jobs/${job.id}`} index={i} />
                ))}
              </div>
            ) : (
              <div className="glass-card py-14 text-center text-muted-foreground">
                <div className="text-4xl mb-3">🔍</div>
                No matching jobs found right now. Check back later!
              </div>
            )}
          </div>

          {/* Recent applications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-xl">Recent Apps</h2>
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80" asChild>
                <Link href="/applications">View all →</Link>
              </Button>
            </div>

            <div className="glass-card overflow-hidden">
              {dashboard.recentApplications && dashboard.recentApplications.length > 0 ? (
                <div className="divide-y divide-white/[0.05]">
                  {dashboard.recentApplications.map((app) => (
                    <div key={app.id} className="p-4 hover:bg-white/[0.03] transition-colors">
                      <div className="flex justify-between items-start mb-1.5 gap-2">
                        <Link
                          href={`/jobs/${app.job?.id}`}
                          className="font-medium text-sm hover:text-primary transition-colors line-clamp-1"
                        >
                          {app.job?.title}
                        </Link>
                        <span className={`shrink-0 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${STATUS_STYLES[app.status] || STATUS_STYLES.PENDING}`}>
                          {app.status}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {app.job?.employer?.companyName} · {new Date(app.appliedAt).toLocaleDateString("en-IE", { day: "numeric", month: "short" })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center text-sm text-muted-foreground">
                  <div className="text-3xl mb-2">📝</div>
                  You haven't applied to any jobs yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
