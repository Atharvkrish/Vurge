import { useListApplications, useUpdateApplication } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { Building2, Calendar, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  VIEWED: "bg-blue-50 text-blue-700 border-blue-200",
  SHORTLISTED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
  HIRED: "bg-purple-50 text-purple-700 border-purple-200",
  WITHDRAWN: "bg-gray-50 text-gray-600 border-gray-200",
};

const employerStatusLabels: Record<string, string[]> = {
  PENDING: ["VIEWED", "SHORTLISTED", "REJECTED", "HIRED"],
  VIEWED: ["SHORTLISTED", "REJECTED", "HIRED"],
  SHORTLISTED: ["HIRED", "REJECTED"],
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
          toast({ title: "Status updated", description: `Application status changed to ${status}` });
          queryClient.invalidateQueries({ queryKey: ["listApplications"] });
        },
        onError: () => {
          toast({ title: "Error", description: "Could not update status.", variant: "destructive" });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 space-y-4 animate-pulse">
          {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-muted rounded-xl" />)}
        </div>
      </Layout>
    );
  }

  const isStudent = user?.role === "STUDENT";

  return (
    <Layout>
      <div className="bg-primary/5 py-8 border-b">
        <div className="container mx-auto px-4">
          <h1 className="font-serif text-3xl font-bold text-primary">
            {isStudent ? "My Applications" : "Applications Received"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isStudent
              ? "Track the status of all your job applications"
              : "Review and manage candidates who have applied to your jobs"}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {(!applications || applications.length === 0) ? (
          <div className="text-center py-24">
            <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No applications yet</h2>
            <p className="text-muted-foreground mb-6">
              {isStudent ? "Start applying to jobs that match your skills and visa." : "Post a job to start receiving applications."}
            </p>
            <Button asChild>
              <Link href={isStudent ? "/jobs" : "/employer/post-job"}>
                {isStudent ? "Browse Jobs" : "Post a Job"}
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <Card key={app.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      {isStudent ? (
                        <>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Building2 className="w-4 h-4" />
                            <span>{(app.job as { employer?: { companyName?: string } } | null)?.employer?.companyName ?? "Unknown Company"}</span>
                          </div>
                          <h3 className="font-semibold text-lg">
                            <Link href={`/jobs/${app.jobId}`} className="hover:text-primary transition-colors">
                              {(app.job as { title?: string } | null)?.title ?? "Unknown Job"}
                            </Link>
                          </h3>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Briefcase className="w-4 h-4" />
                            <span>{(app.job as { title?: string } | null)?.title ?? "Unknown Job"}</span>
                          </div>
                          <h3 className="font-semibold text-lg">
                            {(app.student as { name?: string } | null)?.name ?? "Unknown Candidate"}
                          </h3>
                          {(app.student as { university?: string; visaType?: string } | null)?.university && (
                            <p className="text-sm text-muted-foreground">
                              {(app.student as { university?: string } | null)?.university}
                              {(app.student as { visaType?: string } | null)?.visaType && (
                                <span className="ml-2 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                                  {(app.student as { visaType?: string } | null)?.visaType?.replace("_", " ")}
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
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Applied {new Date(app.appliedAt).toLocaleDateString("en-IE", { dateStyle: "medium" })}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[app.status] ?? ""}`}>
                        {app.status}
                      </span>

                      {!isStudent && employerStatusLabels[app.status] && (
                        <div className="flex flex-wrap gap-2">
                          {employerStatusLabels[app.status].map(s => (
                            <Button
                              key={s}
                              size="sm"
                              variant="outline"
                              className="text-xs h-7"
                              onClick={() => handleStatusChange(app.id, s)}
                              disabled={updateMutation.isPending}
                            >
                              {s === "HIRED" ? "Mark Hired" : s === "SHORTLISTED" ? "Shortlist" : s === "REJECTED" ? "Reject" : s === "VIEWED" ? "Mark Viewed" : s}
                            </Button>
                          ))}
                        </div>
                      )}

                      {isStudent && app.status === "PENDING" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleStatusChange(app.id, "WITHDRAWN")}
                          disabled={updateMutation.isPending}
                        >
                          Withdraw
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
