import { useState } from "react";
import { useCreateJob } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const VISA_TYPES = ["STAMP_2", "STAMP_1G", "GRADUATE_VISA", "STUDENT_VISA"];
const VISA_LABELS: Record<string, string> = {
  STAMP_2: "Stamp 2 (Student)",
  STAMP_1G: "Stamp 1G (Graduated)",
  GRADUATE_VISA: "Graduate Visa",
  STUDENT_VISA: "Student Visa",
};

export default function PostJobPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const createMutation = useCreateJob();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [jobType, setJobType] = useState<string>("PART_TIME");
  const [visaEligible, setVisaEligible] = useState<string[]>([]);
  const [hoursPerWeek, setHoursPerWeek] = useState("");
  const [payRate, setPayRate] = useState("");
  const [payPeriod, setPayPeriod] = useState("HOURLY");
  const [location, setLocation2] = useState("");
  const [isRemote, setIsRemote] = useState(false);

  const toggleVisa = (v: string) => {
    setVisaEligible(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !jobType) {
      toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    createMutation.mutate(
      {
        data: {
          title,
          description: description || undefined,
          category: category || undefined,
          jobType: jobType as "PART_TIME" | "FULL_TIME" | "INTERNSHIP" | "FREELANCE",
          visaEligible,
          hoursPerWeek: hoursPerWeek ? parseFloat(hoursPerWeek) : undefined,
          payRate: payRate ? parseFloat(payRate) : undefined,
          payPeriod: payPeriod as "HOURLY" | "WEEKLY" | "MONTHLY" | undefined,
          location: location || undefined,
          isRemote,
        },
      },
      {
        onSuccess: (job) => {
          toast({ title: "Job posted!", description: "Your job listing is now live." });
          setLocation(`/jobs/${(job as { id: number }).id}`);
        },
        onError: () => {
          toast({ title: "Error", description: "Could not post job. Please try again.", variant: "destructive" });
        },
      }
    );
  };

  return (
    <Layout>
      <div className="bg-primary/5 py-8 border-b">
        <div className="container mx-auto px-4">
          <h1 className="font-serif text-3xl font-bold text-primary">Post a Job</h1>
          <p className="text-muted-foreground mt-1">Reach international students across Ireland and the UK</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Job Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Job Title *</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Part-Time Barista, Junior Developer" required />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the role, responsibilities, and requirements..." className="min-h-[150px]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {["Technology", "Hospitality", "Marketing", "Retail", "Healthcare", "Finance", "Education", "Other"].map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Job Type *</Label>
                  <Select value={jobType} onValueChange={setJobType} required>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PART_TIME">Part-Time</SelectItem>
                      <SelectItem value="FULL_TIME">Full-Time</SelectItem>
                      <SelectItem value="INTERNSHIP">Internship</SelectItem>
                      <SelectItem value="FREELANCE">Freelance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Pay & Hours</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>Pay Rate (€)</Label>
                  <Input type="number" step="0.5" value={payRate} onChange={e => setPayRate(e.target.value)} placeholder="e.g. 14.50" />
                </div>
                <div className="space-y-1.5">
                  <Label>Per</Label>
                  <Select value={payPeriod} onValueChange={setPayPeriod}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HOURLY">Hour</SelectItem>
                      <SelectItem value="WEEKLY">Week</SelectItem>
                      <SelectItem value="MONTHLY">Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Hours/Week</Label>
                  <Input type="number" value={hoursPerWeek} onChange={e => setHoursPerWeek(e.target.value)} placeholder="e.g. 20" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground bg-blue-50 border border-blue-100 text-blue-700 p-3 rounded-lg">
                Stamp 2 students can work up to 20 hours/week during term time. Setting this correctly helps match eligible candidates.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Location</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Location</Label>
                <Input value={location} onChange={e => setLocation2(e.target.value)} placeholder="e.g. Dublin 2, Cork City" disabled={isRemote} />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="remote" checked={isRemote} onCheckedChange={(c) => setIsRemote(c === true)} />
                <Label htmlFor="remote" className="font-normal cursor-pointer">This is a remote position</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Visa Eligibility</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Select which visa holders can apply. Leave all unchecked to accept any visa type.</p>
              <div className="grid grid-cols-2 gap-3">
                {VISA_TYPES.map(v => (
                  <div key={v} className="flex items-center gap-2">
                    <Checkbox id={v} checked={visaEligible.includes(v)} onCheckedChange={() => toggleVisa(v)} />
                    <Label htmlFor={v} className="font-normal cursor-pointer">{VISA_LABELS[v]}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" size="lg" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Posting..." : "Post Job Listing"}
          </Button>
        </form>
      </div>
    </Layout>
  );
}
