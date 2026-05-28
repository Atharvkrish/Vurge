import { useState } from "react";
import { useListJobs, ListJobsJobType } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { JobCard, JobCardSkeleton } from "@/components/job-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

const INDUSTRIES = ["All Industries", "Technology", "Marketing", "Finance", "Healthcare", "Education", "Other"];

export default function PlacementsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [jobType, setJobType] = useState<ListJobsJobType | "ALL">("ALL");
  const [industry, setIndustry] = useState("All Industries");

  const hasFilters = debouncedSearch || jobType !== "ALL" || industry !== "All Industries";

  const { data, isLoading } = useListJobs(
    {
      search: debouncedSearch || undefined,
      jobType: jobType !== "ALL" ? (jobType as ListJobsJobType) : "INTERNSHIP",
      limit: 50,
    },
    { query: { queryKey: ["placements", debouncedSearch, jobType, industry] } }
  );

  const filtered = data?.jobs?.filter((job) => {
    if (industry !== "All Industries" && job.category !== industry) return false;
    return true;
  });

  return (
    <Layout>
      <div className="relative overflow-hidden py-14 px-4 border-b border-white/[0.05]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-[-60%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/8 blur-[100px]" />
        </div>
        <div className="relative container mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-semibold text-blue-400 mb-4">
              <GraduationCap className="w-3.5 h-3.5" /> Work Placements
            </div>
            <h1 className="font-extrabold text-4xl md:text-5xl mb-2">
              Find Your Own <span className="gradient-text">Placement</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl">
              Internships and placements you can apply to independently — on your timeline.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <form
            onSubmit={(e) => { e.preventDefault(); setDebouncedSearch(search); }}
            className="flex gap-2 flex-1"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search placements..."
                className="pl-9 glass border-white/[0.1] rounded-xl h-11 bg-transparent"
              />
            </div>
            <Button type="submit" className="btn-gradient rounded-xl px-5">Search</Button>
          </form>

          <Select value={jobType} onValueChange={(v) => setJobType(v as any)}>
            <SelectTrigger className="glass border-white/[0.1] rounded-xl h-11 bg-transparent w-[160px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="glass-card border-white/[0.08] bg-card/95 backdrop-blur-xl">
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="INTERNSHIP">Internship</SelectItem>
              <SelectItem value="PART_TIME">Part-Time</SelectItem>
              <SelectItem value="FULL_TIME">Full-Time</SelectItem>
            </SelectContent>
          </Select>

          <Select value={industry} onValueChange={setIndustry}>
            <SelectTrigger className="glass border-white/[0.1] rounded-xl h-11 bg-transparent w-[180px]">
              <SelectValue placeholder="Industry" />
            </SelectTrigger>
            <SelectContent className="glass-card border-white/[0.08] bg-card/95 backdrop-blur-xl">
              {INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button
              variant="ghost"
              size="icon"
              className="glass rounded-xl h-11 w-11 shrink-0"
              onClick={() => {
                setSearch(""); setDebouncedSearch(""); setJobType("ALL"); setIndustry("All Industries");
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)}
          </div>
        ) : filtered && filtered.length > 0 ? (
          <>
            <div className="text-sm text-muted-foreground mb-4">
              <span className="font-semibold text-foreground">{filtered?.length}</span> placements found
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered!.map((job, i) => (
                <JobCard key={job.id} job={job as any} linkTo={`/jobs/${job.id}`} index={i} />
              ))}
            </div>
          </>
        ) : (
          <div className="glass-card py-20 text-center max-w-md mx-auto">
            <GraduationCap className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
            <h3 className="font-bold text-lg mb-2">No placements found</h3>
            <p className="text-muted-foreground text-sm">Try adjusting your filters or check back soon.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
