import { useState } from "react";
import { useListJobs, ListJobsVisaType, ListJobsJobType } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { JobCard, JobCardSkeleton } from "@/components/job-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { motion } from "framer-motion";

export default function JobsList() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [visaType, setVisaType] = useState<ListJobsVisaType | "ANY">("ANY");
  const [jobType, setJobType] = useState<ListJobsJobType | "ALL">("ALL");
  const [isRemote, setIsRemote] = useState<boolean>(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(search);
  };

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setVisaType("ANY");
    setJobType("ALL");
    setIsRemote(false);
  };

  const hasFilters = debouncedSearch || visaType !== "ANY" || jobType !== "ALL" || isRemote;

  const { data, isLoading } = useListJobs(
    {
      search: debouncedSearch || undefined,
      visaType: visaType !== "ANY" ? (visaType as ListJobsVisaType) : undefined,
      jobType: jobType !== "ALL" ? (jobType as ListJobsJobType) : undefined,
      isRemote: isRemote || undefined,
      limit: 50,
    },
    {
      query: {
        queryKey: ["jobs", debouncedSearch, visaType, jobType, isRemote],
      },
    }
  );

  return (
    <Layout>
      {/* Hero banner */}
      <div className="relative overflow-hidden py-14 px-4 border-b border-white/[0.05]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-[-60%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/8 blur-[100px]" />
          <div className="absolute bottom-[-60%] right-[10%] w-[400px] h-[400px] rounded-full bg-pink-600/6 blur-[80px]" />
        </div>
        <div className="relative container mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-extrabold text-4xl md:text-5xl mb-2">
              Find your next{" "}
              <span className="gradient-text">opportunity</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mb-8">
              Browse jobs from vetted employers that understand your visa restrictions.
            </p>

            <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Job title, keywords, or company..."
                  className="pl-10 h-12 text-base glass border-white/[0.1] rounded-xl focus:border-primary/50 bg-transparent"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button type="submit" size="lg" className="btn-gradient h-12 px-8 rounded-xl font-semibold">
                Search
              </Button>
            </form>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 grid md:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <motion.div
          className="space-y-5"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="glass-card p-5 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-base">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                Filters
              </div>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Visa Type</Label>
              <Select value={visaType} onValueChange={(val) => setVisaType(val as ListJobsVisaType | "ANY")}>
                <SelectTrigger className="glass border-white/[0.08] rounded-xl h-10">
                  <SelectValue placeholder="Any Visa" />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/[0.08] bg-card/95 backdrop-blur-xl">
                  <SelectItem value="ANY">🌍 Any Visa</SelectItem>
                  <SelectItem value="STAMP_2">🇮🇪 Stamp 2 (20h/wk)</SelectItem>
                  <SelectItem value="STAMP_1G">🇮🇪 Stamp 1G (Full-time)</SelectItem>
                  <SelectItem value="STUDENT_VISA">🇬🇧 UK Student Visa</SelectItem>
                  <SelectItem value="GRADUATE_VISA">🇬🇧 UK Graduate Visa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Job Type</Label>
              <Select value={jobType} onValueChange={(val) => setJobType(val as ListJobsJobType | "ALL")}>
                <SelectTrigger className="glass border-white/[0.08] rounded-xl h-10">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/[0.08] bg-card/95 backdrop-blur-xl">
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="PART_TIME">Part Time</SelectItem>
                  <SelectItem value="FULL_TIME">Full Time</SelectItem>
                  <SelectItem value="INTERNSHIP">Internship</SelectItem>
                  <SelectItem value="FREELANCE">Freelance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between py-1">
              <Label htmlFor="remote-switch" className="cursor-pointer text-sm font-medium">Remote Only</Label>
              <Switch
                id="remote-switch"
                checked={isRemote}
                onCheckedChange={setIsRemote}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </div>

          {/* Visa eligibility legend */}
          <div className="glass-card p-4 space-y-2.5">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Visa Badges</div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> <span className="text-muted-foreground">Eligible for your visa</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> <span className="text-muted-foreground">Check hour limits</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-rose-400" /> <span className="text-muted-foreground">Not eligible</span>
            </div>
          </div>
        </motion.div>

        {/* Job Listings */}
        <div className="md:col-span-3">
          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)}
            </div>
          ) : !data || data.jobs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card text-center py-20 px-8"
            >
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="font-bold text-xl mb-2">No jobs found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your filters or search terms.</p>
              <Button variant="outline" className="glass border-white/[0.1] rounded-xl" onClick={clearFilters}>
                Clear all filters
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{data.total}</span> jobs
                {hasFilters && <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-primary/15 text-primary">Filtered</span>}
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {data.jobs.map((job, i) => (
                  <JobCard key={job.id} job={job as any} linkTo={`/jobs/${job.id}`} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
