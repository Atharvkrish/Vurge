import { useGetMicroInternship, useApplyToMicroInternship, getGetMicroInternshipQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2, Clock, Euro, Calendar, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function MicroInternshipDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [proposal, setProposal] = useState("");
  const [proposedBudget, setProposedBudget] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: project, isLoading, error } = useGetMicroInternship(id, {
    query: {
      enabled: !!id,
      queryKey: getGetMicroInternshipQueryKey(id),
    }
  });

  const applyMutation = useApplyToMicroInternship();

  const handleApply = () => {
    const budgetNum = proposedBudget ? parseFloat(proposedBudget) : undefined;
    
    applyMutation.mutate(
      { 
        id,
        data: { 
          proposal, 
          proposedBudget: budgetNum 
        } 
      },
      {
        onSuccess: () => {
          toast({
            title: "Proposal Submitted",
            description: "Your proposal has been successfully submitted.",
          });
          setIsDialogOpen(false);
          // Assuming an application changes project state or we just want fresh data
          queryClient.invalidateQueries({ queryKey: getGetMicroInternshipQueryKey(id) });
        },
        onError: (err) => {
          toast({
            title: "Submission Failed",
            description: (err.data as { error?: string } | null)?.error || "Could not submit proposal.",
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

  if (error || !project) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h2 className="text-2xl font-serif font-bold text-destructive mb-4">Project Not Found</h2>
          <p className="text-muted-foreground mb-8">This micro-internship does not exist or has been removed.</p>
          <Button asChild>
            <Link href="/micro-internships">Browse all projects</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const isStudent = user?.role === "STUDENT";
  const canApply = isStudent && project.status === "OPEN";

  return (
    <Layout>
      <div className="bg-primary/5 py-12 border-b">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3">
                <Badge variant={project.status === 'OPEN' ? 'default' : 'secondary'} className={project.status === 'OPEN' ? 'bg-emerald-600' : ''}>
                  {project.status.replace('_', ' ')}
                </Badge>
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Euro className="w-4 h-4" /> {project.budget} Fixed Budget
                </span>
              </div>
              <h1 className="font-serif text-3xl md:text-5xl font-bold text-primary leading-tight">
                {project.title}
              </h1>
              <div className="flex items-center gap-2 text-xl text-muted-foreground font-medium">
                <Building2 className="w-5 h-5" />
                <span>{project.employer?.companyName || "Unknown Company"}</span>
                {project.employer?.isVerified && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" aria-label="Verified Employer" />
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 min-w-[200px] shrink-0">
              {canApply ? (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="w-full text-lg">Submit Proposal</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Submit Proposal</DialogTitle>
                      <DialogDescription>
                        Explain how you will complete this project and optionally suggest a different budget.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                      <div className="space-y-2">
                        <Label>Proposal Letter</Label>
                        <Textarea 
                          placeholder="I can deliver this project by..." 
                          className="min-h-[150px]"
                          value={proposal}
                          onChange={(e) => setProposal(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Proposed Budget (€) - Optional</Label>
                        <Input 
                          type="number" 
                          placeholder={project.budget.toString()}
                          value={proposedBudget}
                          onChange={(e) => setProposedBudget(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">Leave blank to accept the original budget of €{project.budget}.</p>
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button 
                        onClick={handleApply} 
                        disabled={applyMutation.isPending || proposal.trim().length < 10}
                      >
                        {applyMutation.isPending ? "Submitting..." : "Submit Proposal"}
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
                  {project.status !== "OPEN" ? "Project Closed" : "Cannot Apply"}
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
              <h2 className="font-serif text-2xl font-bold">Project Overview</h2>
              <div className="prose prose-slate max-w-none text-muted-foreground whitespace-pre-wrap">
                {project.description || "No detailed description provided."}
              </div>
            </section>

            {project.skills && project.skills.length > 0 && (
              <section className="space-y-4">
                <h2 className="font-serif text-2xl font-bold">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {project.skills.map(skill => (
                    <Badge key={skill} variant="outline" className="text-sm px-3 py-1 bg-muted/30">{skill}</Badge>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Euro className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm text-muted-foreground">Fixed Budget</div>
                    <div className="font-medium font-bold text-lg">€{project.budget}</div>
                    <div className="text-xs text-muted-foreground mt-1">Platform fee: {project.platformFee}%</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm text-muted-foreground">Expected Duration</div>
                    <div className="font-medium">{project.duration || "Flexible"}</div>
                  </div>
                </div>

                {project.deadline && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-sm text-muted-foreground">Deadline</div>
                      <div className="font-medium text-rose-600 font-bold">{new Date(project.deadline).toLocaleDateString()}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {project.employer && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">About the Employer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="font-bold text-lg">{project.employer.companyName}</div>
                    {project.employer.sector && (
                      <div className="text-sm text-muted-foreground">{project.employer.sector}</div>
                    )}
                  </div>
                  {project.employer.trustScore && (
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium">Trust Score:</div>
                      <div className="bg-primary text-primary-foreground px-2 py-0.5 rounded text-xs font-bold">
                        {project.employer.trustScore}/100
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
