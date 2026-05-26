import { useState } from "react";
import { useListJobs, ListJobsVisaType, ListJobsJobType } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { JobCard } from "@/components/job-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";

export default function JobsList() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [visaType, setVisaType] = useState<ListJobsVisaType | "ALL">("ANY");
  const [jobType, setJobType] = useState<ListJobsJobType | "ALL">("ALL");
  const [isRemote, setIsRemote] = useState<boolean>(false);

  // Debounce search slightly
  // In a real app we'd use useDebounce hook, but timeout is fine here
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(search);
  };

  const { data, isLoading } = useListJobs(
    {
      search: debouncedSearch || undefined,
      visaType: visaType !== "ALL" ? visaType as ListJobsVisaType : undefined,
      jobType: jobType !== "ALL" ? jobType as ListJobsJobType : undefined,
      isRemote: isRemote || undefined,
      limit: 50,
    },
    {
      query: {
        queryKey: ["jobs", debouncedSearch, visaType, jobType, isRemote],
      }
    }
  );

  return (
    <Layout>
      <div className="bg-primary/5 py-12 border-b">
        <div className="container mx-auto px-4">
          <h1 className="font-serif text-4xl font-bold text-primary mb-4">Find your next opportunity</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mb-8">
            Browse jobs from vetted employers that understand your visa restrictions.
          </p>
          
          <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Job title, keywords, or company..." 
                className="pl-10 h-12 text-base bg-background"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button type="submit" size="lg" className="h-12 px-8">Search</Button>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 grid md:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 font-serif font-bold text-lg border-b pb-2">
            <SlidersHorizontal className="w-5 h-5" />
            Filters
          </div>

          <div className="space-y-3">
            <Label>My Visa Type</Label>
            <Select value={visaType} onValueChange={(val) => setVisaType(val as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Any Visa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ANY">Any Visa</SelectItem>
                <SelectItem value="STAMP_2">Stamp 2 (Student)</SelectItem>
                <SelectItem value="STAMP_1G">Stamp 1G (Graduate)</SelectItem>
                <SelectItem value="STUDENT_VISA">UK Student Visa</SelectItem>
                <SelectItem value="GRADUATE_VISA">UK Graduate Visa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Job Type</Label>
            <Select value={jobType} onValueChange={(val) => setJobType(val as any)}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="PART_TIME">Part Time</SelectItem>
                <SelectItem value="FULL_TIME">Full Time</SelectItem>
                <SelectItem value="INTERNSHIP">Internship</SelectItem>
                <SelectItem value="FREELANCE">Freelance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="remote-switch" className="cursor-pointer">Remote Only</Label>
            <Switch 
              id="remote-switch" 
              checked={isRemote} 
              onCheckedChange={setIsRemote} 
            />
          </div>
        </div>

        {/* Job Listings */}
        <div className="md:col-span-3">
          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : !data || data.jobs.length === 0 ? (
            <div className="text-center py-24 bg-muted/20 rounded-xl border border-dashed">
              <h3 className="font-serif text-2xl font-bold text-muted-foreground mb-2">No jobs found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
              <Button variant="outline" className="mt-6" onClick={() => {
                setSearch("");
                setDebouncedSearch("");
                setVisaType("ANY");
                setJobType("ALL");
                setIsRemote(false);
              }}>
                Clear all filters
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground pb-2">
                Showing <span className="font-medium text-foreground">{data.total}</span> jobs
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {data.jobs.map((job) => (
                  <JobCard key={job.id} job={job as any} linkTo={`/jobs/${job.id}`} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
