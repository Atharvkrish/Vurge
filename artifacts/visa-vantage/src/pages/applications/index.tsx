import { useListApplications, useUpdateApplication } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { Building2, Calendar, Briefcase, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  VIEWED: "bg-violet-500/15 text-violet-400 border-violet-500/20",
  SHORTLISTED: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  HIRED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  REJECTED: "bg-rose-500/15 text-rose-400 border-rose-500/20",
  WITHDRAWN: "bg-white/[0.06] text-muted-foreground border-white/[0.08]",
};

const employerActions: Record<string, { label: string; status: string; style: string }[]> = {
  PENDING: [
    { label: "Mark Viewed", status: "VIEWED", style: "glass border-white/[0.1] hover:border-violet-500/30" },
    { label: "Shortlist", status: "SHORTLISTED", style: "glass border-amber-500/30 text-amber-400 hover:bg-amber-500/10" },
    { label: "Reject", status: "REJECTED", style: "glass border-rose-500/30 text-rose-400 hover:bg-rose-500/10" },
  ],
  VIEWED: [
    { label: "Shortlist", status: "SHORTLISTED", style: "glass border-amber-500/30 text-amber-400 hover:bg-amber-500/10" },
    { label: "Reject", status: "REJECTED", style: "glass border-rose-500/30 text-rose-400 hover:bg-rose-500/10" },
  ],
  SHORTLISTED: [
    { label: "✓ Hire", status: "HIRED", style: "gradient-purple-pink text-white border-0 hover:opacity-90" },
    { label: "Reject", status: "REJECTED", style: "glass border-rose-500/30 text-rose-400 hover:bg-rose-500/10" },
  ],
};

export default function ApplicationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: applications, isLoading } = useListApplications({});
  const updateMutation = useUpdateApplication();

  const handleStatusChange = (appId: number, status: string) => {
    updateMutation.mutate(
      { id: appId, data: { status: status as Parameters<typeof updateMutation.mutate>[0]["data"]["status"] } },
      {
        onSuccess: () => {
          toast({ title: "Status updated ✓", description: `Changed to ${status}` });
          queryClient.invalidateQueries({ queryKey: ["listApplications"] });
        },
        onError: () => {
          toast({ title: "Error", description: "Could not update status.", variant: "destructive" });
        },
      }
    );
  };

  const isStudent = user?.role === "STUDENT";

  return (
    <Layout>
      {/* Header */}
      <div className="relative overflow-hidden py-10 px-4 border-b border-white/[0.05]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-[-60%] right-[-10%] w-[400px] h-[400px] rounded-full bg-violet-600/8 blur-[80px]" />
        </div>
        <div className="relative container mx-auto">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-extrabold text-3xl md:text-4xl">
              {isStudent ? "My " : "Received "}<span className="gradient-text">Applications</span>
            </h1>
            <p className="text-muted-foreground mt-1.5">
              {isStudent
                ? "Track the status of all your job applications"
                : "Review and manage candidates who applied to your jobs"}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-white/[0.04] rounded-2xl" />
            ))}
          </div>
        ) : !applications || applications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card text-center py-20 px-8 max-w-lg mx-auto"
          >
            <div className="text-5xl mb-4">📭</div>
            <h2 className="font-bold text-xl mb-2">No applications yet</h2>
            <p className="text-muted-foreground mb-6">
              {isStudent
                ? "Start applying to jobs that match your skills and visa."
                : "Post a job to start receiving applications."}
            </p>
            <Button className="btn-gradient rounded-xl" asChild>
              <Link href={isStudent ? "/jobs" : "/employer/post-job"}>
                {isStudent ? "Browse Jobs" : "Post a Job"} <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              <span className="font-semibold text-foreground">{applications.length}</span> applications
            </div>
            {applications.map((app, i) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-5"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    {isStudent ? (
                      <>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>{(app.job as { employer?: { companyName?: string } } | null)?.employer?.companyName ?? "Unknown Company"}</span>
                        </div>
                        <h3 className="font-bold text-lg">
                          <Link href={`/jobs/${app.jobId}`} className="hover:text-primary transition-colors">
                            {(app.job as { title?: string } | null)?.title ?? "Unknown Job"}
                          </Link>
                        </h3>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Briefcase className="w-3.5 h-3.5" />
                          <span>{(app.job as { title?: string } | null)?.title ?? "Unknown Job"}</span>
                        </div>
                        <h3 className="font-bold text-lg">
                          {(app.student as { name?: string } | null)?.name ?? "Unknown Candidate"}
                        </h3>
                        {(app.student as { university?: string; visaType?: string } | null)?.university && (
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            {(app.student as { university?: string } | null)?.university}
                            {(app.student as { visaType?: string } | null)?.visaType && (
                              <span className="px-2 py-0.5 rounded-full text-[11px] glass border-white/[0.08] text-muted-foreground">
                                {(app.student as { visaType?: string } | null)?.visaType?.replace(/_/g, " ")}
                              </span>
                            )}
                          </p>
                        )}
                      </>
                    )}

                    {app.coverLetter && (
                      <p className="text-sm text-muted-foreground line-clamp-2 italic">"{app.coverLetter}"</p>
                    )}

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      Applied {new Date(app.appliedAt).toLocaleDateString("en-IE", { dateStyle: "medium" })}
                    </div>
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLES[app.status] ?? STATUS_STYLES.PENDING}`}>
                      {app.status}
                    </span>

                    {!isStudent && employerActions[app.status] && (
                      <div className="flex flex-wrap gap-2">
                        {employerActions[app.status].map((action) => (
                          <Button
                            key={action.status}
                            size="sm"
                            variant="outline"
                            className={`text-xs h-8 rounded-lg ${action.style}`}
                            onClick={() => handleStatusChange(app.id, action.status)}
                            disabled={updateMutation.isPending}
                          >
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    )}

                    {isStudent && app.status === "PENDING" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-8 rounded-lg glass border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                        onClick={() => handleStatusChange(app.id, "WITHDRAWN")}
                        disabled={updateMutation.isPending}
                      >
                        Withdraw
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
