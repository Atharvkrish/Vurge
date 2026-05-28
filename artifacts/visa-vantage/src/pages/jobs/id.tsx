import { useGetJob, useApplyToJob, getGetJobQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { Layout } from "@/components/layout";
import { VisaStatusBadge } from "@/components/job-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2, Clock, MapPin, Briefcase, Calendar, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function JobDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [coverLetter, setCoverLetter] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: job, isLoading, error } = useGetJob(id, {
    query: {
      enabled: !!id,
      queryKey: getGetJobQueryKey(id),
    }
  });

  const applyMutation = useApplyToJob();

  const handleApply = () => {
    applyMutation.mutate(
      { id, data: { coverLetter } },
      {
        onSuccess: () => {
          toast({
            title: "Application Submitted",
            description: "You have successfully applied for this position.",
          });
          setIsDialogOpen(false);
          // Invalidate job to refresh hasApplied state
          queryClient.invalidateQueries({ queryKey: getGetJobQueryKey(id) });
        },
        onError: (err) => {
          toast({
            title: "Application Failed",
            description: err.data?.error || "Could not submit application.",
            variant: "destructive",
          });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-32 bg-muted rounded-xl w-full max-w-4xl" />
            <div className="h-64 bg-muted rounded-xl w-full max-w-4xl" />
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !job) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h2 className="text-2xl font-serif font-bold text-destructive mb-4">Job Not Found</h2>
          <p className="text-muted-foreground mb-8">The job you are looking for does not exist or has been removed.</p>
          <Button asChild>
            <Link href="/jobs">Browse all jobs</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const formatPay = () => {
    if (!job.payRate) return "Pay unlisted";
    return `€${job.payRate} / ${job.payPeriod?.toLowerCase() || 'hr'}`;
  };

  const isStudent = user?.role === "STUDENT";
  const canApply = isStudent && !job.hasApplied && job.status === "ACTIVE";

  return (
    <Layout>
      <div className="bg-primary/5 py-12 border-b">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3">
                <VisaStatusBadge status={job.visaEligibilityStatus ?? undefined} hours={job.hoursPerWeek} />
                {job.isFeatured && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                    Featured
                  </span>
                )}
              </div>
              <h1 className="font-serif text-3xl md:text-5xl font-bold text-primary leading-tight">
                {job.title}
              </h1>
              <div className="flex items-center gap-2 text-xl text-muted-foreground font-medium">
                <Building2 className="w-5 h-5" />
                <span>{job.employer?.companyName || "Unknown Company"}</span>
                {job.employer?.isVerified && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" aria-label="Verified Employer" />
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 min-w-[200px] shrink-0">
              {job.hasApplied ? (
                <Button size="lg" className="w-full" disabled variant="secondary">
                  Applied
                </Button>
              ) : canApply ? (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="w-full text-lg">Apply Now</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Apply for {job.title}</DialogTitle>
                      <DialogDescription>
                        Submit your application to {job.employer?.companyName}. Your verified profile and CV will be included automatically.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Cover Letter (Optional)</label>
                        <Textarea 
                          placeholder="Introduce yourself and explain why you're a great fit..." 
                          className="min-h-[150px]"
                          value={coverLetter}
                          onChange={(e) => setCoverLetter(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button onClick={handleApply} disabled={applyMutation.isPending}>
                        {applyMutation.isPending ? "Submitting..." : "Submit Application"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : !user ? (
                <Button size="lg" className="w-full text-lg" asChild>
                  <Link href="/login">Login to Apply</Link>
                </Button>
              ) : (
                <Button size="lg" className="w-full text-lg" disabled variant="secondary">
                  {job.status !== "ACTIVE" ? "Position Closed" : "Cannot Apply"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <section className="space-y-4">
              <h2 className="font-serif text-2xl font-bold">About the Role</h2>
              <div className="prose prose-slate max-w-none text-muted-foreground whitespace-pre-wrap">
                {job.description || "No detailed description provided."}
              </div>
            </section>

            {job.visaEligible && job.visaEligible.length > 0 && (
              <section className="space-y-4">
                <h2 className="font-serif text-2xl font-bold">Visa Requirements</h2>
                <Card className="border-emerald-100 bg-emerald-50/30 shadow-none">
                  <CardContent className="p-6">
                    <p className="font-medium text-emerald-900 mb-2">This employer welcomes candidates with the following visa types:</p>
                    <ul className="list-disc pl-5 text-emerald-800 space-y-1">
                      {job.visaEligible.map((visa, idx) => (
                        <li key={idx}>{visa.replace('_', ' ')}</li>
                      ))}
                    </ul>
                    {job.hoursPerWeek && job.hoursPerWeek <= 20 && (
                      <p className="mt-4 text-sm text-emerald-700 bg-emerald-100/50 p-3 rounded-md">
                        <strong>Compliance Note:</strong> This role is {job.hoursPerWeek} hours/week, making it fully compliant with term-time working limits for Stamp 2 / Student Visas.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </section>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm text-muted-foreground">Job Type</div>
                    <div className="font-medium">{job.jobType.replace('_', ' ')}</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm text-muted-foreground">Location</div>
                    <div className="font-medium">{job.isRemote ? "Remote" : job.location || "Not specified"}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm text-muted-foreground">Compensation</div>
                    <div className="font-medium">{formatPay()}</div>
                  </div>
                </div>

                {job.hoursPerWeek && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-sm text-muted-foreground">Hours</div>
                      <div className="font-medium">{job.hoursPerWeek} hours per week</div>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm text-muted-foreground">Posted On</div>
                    <div className="font-medium">{new Date(job.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {job.employer && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">About the Employer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="font-bold text-lg">{job.employer.companyName}</div>
                    {job.employer.sector && (
                      <div className="text-sm text-muted-foreground">{job.employer.sector}</div>
                    )}
                  </div>
                  {job.employer.trustScore && (
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium">Trust Score:</div>
                      <div className="bg-primary text-primary-foreground px-2 py-0.5 rounded text-xs font-bold">
                        {job.employer.trustScore}/100
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
