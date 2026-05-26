import { useGetStudentDashboard, getGetStudentDashboardQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JobCard } from "@/components/job-card";
import { FileText, Briefcase, Clock, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function StudentDashboard() {
  const { data: dashboard, isLoading } = useGetStudentDashboard({
    query: {
      queryKey: getGetStudentDashboardQueryKey(),
    }
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 space-y-8 animate-pulse">
          <div className="h-32 bg-muted rounded-xl" />
          <div className="grid md:grid-cols-4 gap-4">
            <div className="h-24 bg-muted rounded-xl" />
            <div className="h-24 bg-muted rounded-xl" />
            <div className="h-24 bg-muted rounded-xl" />
            <div className="h-24 bg-muted rounded-xl" />
          </div>
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      </Layout>
    );
  }

  if (!dashboard) return null;

  return (
    <Layout>
      <div className="bg-primary/5 py-8 border-b">
        <div className="container mx-auto px-4">
          <h1 className="font-serif text-3xl font-bold text-primary">Student Dashboard</h1>
          <p className="text-muted-foreground mt-2">Track your applications and explore opportunities matched to your visa.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Total Applied
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dashboard.totalApplications}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" /> Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dashboard.pendingApplications || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Shortlisted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">{dashboard.shortlistedApplications || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FileText className="w-4 h-4" /> CV Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-indigo-600">{dashboard.cvScore !== undefined && dashboard.cvScore !== null ? `${dashboard.cvScore}/100` : 'N/A'}</div>
              {dashboard.cvScore === null && (
                <Link href="/cv-builder" className="text-xs text-primary hover:underline">Build CV to get score</Link>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl font-bold">Matching Jobs</h2>
              <Button variant="outline" asChild size="sm">
                <Link href="/jobs">View all</Link>
              </Button>
            </div>
            
            {dashboard.matchingJobs && dashboard.matchingJobs.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {dashboard.matchingJobs.map(job => (
                  <JobCard key={job.id} job={job as any} linkTo={`/jobs/${job.id}`} />
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center text-muted-foreground">
                  No matching jobs found right now.
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl font-bold">Recent Apps</h2>
              <Button variant="outline" asChild size="sm">
                <Link href="/student/applications">View all</Link>
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-0 divide-y">
                {dashboard.recentApplications && dashboard.recentApplications.length > 0 ? (
                  dashboard.recentApplications.map(app => (
                    <div key={app.id} className="p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <Link href={`/jobs/${app.job?.id}`} className="font-medium hover:text-primary hover:underline line-clamp-1">
                          {app.job?.title}
                        </Link>
                        <Badge variant="outline" className="shrink-0 text-xs">{app.status}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {app.job?.employer?.companyName} • Applied {new Date(app.appliedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    You haven't applied to any jobs yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
