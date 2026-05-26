import { useGetAdminStats, useListAdminUsers } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Briefcase, Building2, FileText, AlertTriangle, TrendingUp } from "lucide-react";
import { useState } from "react";

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetAdminStats({});
  const [page] = useState(1);
  const { data: usersData, isLoading: usersLoading } = useListAdminUsers({ page });

  if (statsLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 animate-pulse space-y-8">
          <div className="h-10 bg-muted rounded w-64" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-28 bg-muted rounded-xl" />)}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-primary/5 py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-primary" />
            <div>
              <h1 className="font-serif text-3xl font-bold text-primary">Admin Panel</h1>
              <p className="text-muted-foreground">Manage users, jobs, and platform data</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.totalUsers ?? 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats?.totalStudents ?? 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" /> Employers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{stats?.totalEmployers ?? 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" /> Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">{stats?.totalJobs ?? 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats?.totalApplications ?? 0}</div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-amber-700 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Unverified
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">{stats?.unverifiedEmployers ?? 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Users table */}
        <div>
          <h2 className="font-serif text-xl font-bold mb-4">Recent Users</h2>
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Joined</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {usersLoading && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Loading...</td>
                  </tr>
                )}
                {usersData?.users?.map(user => (
                  <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium">{user.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={user.role === "ADMIN" ? "destructive" : user.role === "EMPLOYER" ? "default" : "secondary"}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString("en-IE")}
                    </td>
                    <td className="px-4 py-3">
                      {user.role === "EMPLOYER" && (
                        <Badge variant={user.employerProfile?.isVerified ? "default" : "outline"} className={user.employerProfile?.isVerified ? "bg-emerald-600" : "text-amber-600 border-amber-300"}>
                          {user.employerProfile?.isVerified ? "Verified" : "Unverified"}
                        </Badge>
                      )}
                      {user.role === "STUDENT" && (
                        <Badge variant={user.studentProfile?.isVerified ? "default" : "outline"} className={user.studentProfile?.isVerified ? "bg-blue-600" : ""}>
                          {user.studentProfile?.isVerified ? "Verified" : "Pending"}
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
                {!usersLoading && (!usersData?.users || usersData.users.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {usersData && (
            <p className="text-xs text-muted-foreground mt-2 text-right">
              Showing {usersData.users?.length ?? 0} of {usersData.total} users
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
}
