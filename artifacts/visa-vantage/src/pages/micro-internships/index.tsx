import { useState } from "react";
import { useListMicroInternships } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Clock, Euro, Building2, Calendar, Zap } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

const stagger = {
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function MicroCardSkeleton() {
  return (
    <div className="glass-card p-6 animate-pulse">
      <div className="flex justify-between mb-4">
        <div className="h-6 w-16 bg-white/[0.07] rounded-full" />
        <div className="h-6 w-20 bg-white/[0.07] rounded-full" />
      </div>
      <div className="h-6 bg-white/[0.07] rounded-lg w-3/4 mb-2" />
      <div className="h-4 bg-white/[0.05] rounded-lg w-1/2 mb-4" />
      <div className="space-y-1.5">
        <div className="h-3 bg-white/[0.04] rounded w-full" />
        <div className="h-3 bg-white/[0.04] rounded w-4/5" />
        <div className="h-3 bg-white/[0.04] rounded w-2/3" />
      </div>
    </div>
  );
}

export default function MicroInternshipsList() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(search);
  };

  const { data, isLoading } = useListMicroInternships(
    {
      search: debouncedSearch || undefined,
      limit: 50,
    },
    {
      query: {
        queryKey: ["micro-internships", debouncedSearch],
      },
    }
  );

  return (
    <Layout>
      {/* Hero */}
      <div className="relative overflow-hidden py-20 px-4 border-b border-white/[0.05] text-center">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-[-40%] left-[20%] w-[500px] h-[500px] rounded-full bg-blue-600/8 blur-[100px]" />
          <div className="absolute bottom-[-40%] right-[10%] w-[400px] h-[400px] rounded-full bg-teal-600/6 blur-[80px]" />
        </div>
        <div className="relative container mx-auto max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-muted-foreground mb-6">
              <Zap className="w-4 h-4 text-blue-400" /> Short-term. Paid. Career-building.
            </div>
            <h1 className="font-extrabold text-4xl md:text-5xl mb-4">
              <span className="gradient-text-blue">Micro-Internships</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              3 days to 2 weeks. Fixed price. Build your CV without disrupting your studies or visa conditions.
            </p>

            <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  className="pl-10 h-12 text-base glass border-white/[0.1] rounded-xl bg-transparent"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-8 rounded-xl font-semibold btn-gradient">
                Search
              </Button>
            </form>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <MicroCardSkeleton key={i} />)}
          </div>
        ) : !data || data.items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card text-center py-20 px-8 max-w-3xl mx-auto"
          >
            <div className="text-5xl mb-4">⚡</div>
            <h3 className="font-bold text-xl mb-2">No projects found</h3>
            <p className="text-muted-foreground">Try adjusting your search terms.</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground mb-6">
              <span className="font-semibold text-foreground">{data.items.length}</span> projects available
            </div>
            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={stagger}
              initial="hidden"
              animate="show"
            >
              {data.items.map((project, i) => (
                <motion.div key={project.id} variants={fadeUp}>
                  <Link href={`/micro-internships/${project.id}`}>
                    <div className="glass-card p-6 h-full flex flex-col cursor-pointer group">
                      {/* Status + budget */}
                      <div className="flex justify-between items-center mb-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          project.status === "OPEN"
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                            : "bg-white/[0.05] text-muted-foreground border-white/[0.08]"
                        }`}>
                          {project.status === "OPEN" ? "● Open" : project.status.replace("_", " ")}
                        </span>
                        <div className="font-bold text-lg gradient-text flex items-center gap-1">
                          <Euro className="w-4 h-4" />
                          {project.budget}
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="font-bold text-lg leading-tight line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>

                      {/* Company */}
                      <div className="flex items-center gap-1.5 text-muted-foreground text-sm mb-4">
                        <Building2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{project.employer?.companyName || "Unknown Company"}</span>
                      </div>

                      {/* Description */}
                      <p className="line-clamp-3 text-sm text-muted-foreground flex-1 mb-4">
                        {project.description || "No description provided."}
                      </p>

                      {/* Skills */}
                      {project.skills && project.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {project.skills.slice(0, 3).map((skill) => (
                            <span key={skill} className="px-2 py-0.5 rounded-full text-xs glass text-muted-foreground">
                              {skill}
                            </span>
                          ))}
                          {project.skills.length > 3 && (
                            <span className="px-2 py-0.5 rounded-full text-xs glass text-muted-foreground">
                              +{project.skills.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{project.duration || "Flexible"}</span>
                        </div>
                        {project.deadline && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>By {new Date(project.deadline).toLocaleDateString("en-IE", { day: "numeric", month: "short" })}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}
      </div>
    </Layout>
  );
}
