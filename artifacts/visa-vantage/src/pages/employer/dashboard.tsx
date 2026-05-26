import { useGetEmployerDashboard, getGetEmployerDashboardQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, Plus, FileText } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function EmployerDashboard() {
  const { data: dashboard, isLoading } = useGetEmployerDashboard({
    query: {
      queryKey: getGetEmployerDashboardQueryKey(),
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
        <div className="container mx-auto px-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-primary">Employer Dashboard</h1>
            <p className="text-muted-foreground mt-2">Manage your job postings and review applications.</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/micro-internships/new"><Plus className="w-4 h-4 mr-2" /> Post Micro-Internship</Link>
            </Button>
            <Button asChild>
              <Link href="/jobs/new"><Plus className="w-4 h-4 mr-2" /> Post Job</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Active Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dashboard.activeJobs}</div>
              <div className="text-xs text-muted-foreground mt-1">Out of {dashboard.totalJobs} total postings</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" /> Total Apps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dashboard.totalApplications}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FileText className="w-4 h-4" /> Pending Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">{dashboard.pendingApplications || 0}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-serif text-xl">Recent Applications</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/employer/applications">View All</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {dashboard.recentApplications && dashboard.recentApplications.length > 0 ? (
                  dashboard.recentApplications.map(app => (
                    <div key={app.id} className="p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-medium">{app.student?.name || "Unknown Applicant"}</div>
                        <Badge variant="outline" className="shrink-0 text-xs">{app.status}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Applied for: <span className="font-medium text-foreground">{app.job?.title}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {app.student?.university} • {app.student?.visaType?.replace('_', ' ')}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    No recent applications.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-serif text-xl">Active Postings</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/employer/jobs">Manage All</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {dashboard.topJobs && dashboard.topJobs.length > 0 ? (
                  dashboard.topJobs.map(job => (
                    <div key={job.id} className="p-4 hover:bg-muted/50 transition-colors flex justify-between items-center">
                      <div>
                        <Link href={`/jobs/${job.id}`} className="font-medium hover:text-primary hover:underline">
                          {job.title}
                        </Link>
                        <div className="text-xs text-muted-foreground mt-1">
                          Posted {new Date(job.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge variant={job.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {job.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    No active job postings.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
