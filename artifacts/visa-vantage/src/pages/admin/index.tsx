import { useGetAdminStats, useListAdminUsers } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Users, Briefcase, Building2, FileText, AlertTriangle, TrendingUp, Shield } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const stagger = { show: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const ROLE_STYLES: Record<string, string> = {
  ADMIN: "bg-rose-500/15 text-rose-400 border-rose-500/20",
  EMPLOYER: "bg-violet-500/15 text-violet-400 border-violet-500/20",
  STUDENT: "bg-blue-500/15 text-blue-400 border-blue-500/20",
};

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetAdminStats({});
  const [page] = useState(1);
  const { data: usersData, isLoading: usersLoading } = useListAdminUsers({ page });

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, emoji: "👥", color: "from-violet-500 to-purple-600" },
    { label: "Students", value: stats?.totalStudents ?? 0, emoji: "🎓", color: "from-blue-500 to-cyan-500" },
    { label: "Employers", value: stats?.totalEmployers ?? 0, emoji: "🏢", color: "from-pink-500 to-rose-500" },
    { label: "Active Jobs", value: stats?.totalJobs ?? 0, emoji: "💼", color: "from-emerald-500 to-teal-500" },
    { label: "Applications", value: stats?.totalApplications ?? 0, emoji: "📬", color: "from-amber-500 to-orange-500" },
    { label: "Unverified", value: stats?.unverifiedEmployers ?? 0, emoji: "⚠️", color: "from-rose-500 to-red-600", alert: true },
  ];

  return (
    <Layout>
      {/* Header */}
      <div className="relative overflow-hidden py-10 px-4 border-b border-white/[0.05]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-[-60%] left-[-10%] w-[400px] h-[400px] rounded-full bg-rose-600/8 blur-[80px]" />
        </div>
        <div className="relative container mx-auto">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-3xl md:text-4xl">
                Admin <span className="gradient-text">Panel</span>
              </h1>
              <p className="text-muted-foreground mt-0.5">Platform stats, users, and moderation.</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats grid */}
        {statsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-28 bg-white/[0.04] rounded-2xl" />
            ))}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            {statCards.map((s) => (
              <motion.div
                key={s.label}
                variants={fadeUp}
                className={`glass-card p-5 ${s.alert && (stats?.unverifiedEmployers ?? 0) > 0 ? "border-rose-500/30" : ""}`}
              >
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-lg mb-3`}>
                  {s.emoji}
                </div>
                <div className="text-2xl font-extrabold mb-0.5">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Users table */}
        <div>
          <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> All Users
          </h2>
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left px-5 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Name</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Email</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Role</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Joined</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {usersLoading && (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">
                        <div className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                          Loading users...
                        </div>
                      </td>
                    </tr>
                  )}
                  {usersData?.users?.map((user) => (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5 font-medium">{user.name}</td>
                      <td className="px-5 py-3.5 text-muted-foreground text-sm">{user.email}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${ROLE_STYLES[user.role] || ROLE_STYLES.STUDENT}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground text-sm">
                        {new Date(user.createdAt).toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-5 py-3.5">
                        {user.role === "EMPLOYER" && (
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            user.employerProfile?.isVerified
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                              : "bg-amber-500/15 text-amber-400 border-amber-500/20"
                          }`}>
                            {user.employerProfile?.isVerified ? "✓ Verified" : "Pending"}
                          </span>
                        )}
                        {user.role === "STUDENT" && (
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            user.studentProfile?.isVerified
                              ? "bg-blue-500/15 text-blue-400 border-blue-500/20"
                              : "bg-white/[0.06] text-muted-foreground border-white/[0.08]"
                          }`}>
                            {user.studentProfile?.isVerified ? "✓ Verified" : "Pending"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!usersLoading && (!usersData?.users || usersData.users.length === 0) && (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {usersData && (
              <div className="px-5 py-3 border-t border-white/[0.05] text-xs text-muted-foreground">
                Showing {usersData.users?.length ?? 0} of {usersData.total} users
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
