import { useState } from "react";
import { useCreateJob } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

const VISA_TYPES = ["STAMP_2", "STAMP_1G", "GRADUATE_VISA", "STUDENT_VISA"];
const VISA_LABELS: Record<string, string> = {
  STAMP_2: "🇮🇪 Stamp 2 (Student, 20h/wk)",
  STAMP_1G: "🇮🇪 Stamp 1G (Graduate)",
  GRADUATE_VISA: "🇬🇧 Graduate Visa",
  STUDENT_VISA: "🇬🇧 Student Visa",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="px-6 py-4 border-b border-white/[0.06]">
        <h2 className="font-bold text-base">{title}</h2>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold text-muted-foreground">
        {label} {required && <span className="text-primary">*</span>}
      </Label>
      {children}
    </div>
  );
}

const inputCls = "glass border-white/[0.1] rounded-xl h-11 bg-transparent focus:border-primary/50";

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
    setVisaEligible((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
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
          toast({ title: "Job posted! 🚀", description: "Your listing is now live." });
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
      {/* Header */}
      <div className="relative overflow-hidden py-10 px-4 border-b border-white/[0.05]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-[-60%] left-[-10%] w-[400px] h-[400px] rounded-full bg-violet-600/8 blur-[80px]" />
        </div>
        <div className="relative container mx-auto">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-extrabold text-3xl md:text-4xl">
              Post a <span className="gradient-text">Job</span>
            </h1>
            <p className="text-muted-foreground mt-1.5">
              Reach thousands of international students across Ireland and the UK.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.form
          onSubmit={handleSubmit}
          className="space-y-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Section title="📝 Job Details">
            <Field label="Job Title" required>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Part-Time Barista, Junior Developer"
                className={inputCls}
                required
              />
            </Field>
            <Field label="Description">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the role, responsibilities, and requirements..."
                className="glass border-white/[0.1] rounded-xl bg-transparent focus:border-primary/50 min-h-[140px]"
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Category">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className={inputCls}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/[0.08] bg-card/95 backdrop-blur-xl">
                    {["Technology", "Hospitality", "Marketing", "Retail", "Healthcare", "Finance", "Education", "Other"].map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Job Type" required>
                <Select value={jobType} onValueChange={setJobType}>
                  <SelectTrigger className={inputCls}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/[0.08] bg-card/95 backdrop-blur-xl">
                    <SelectItem value="PART_TIME">Part-Time</SelectItem>
                    <SelectItem value="FULL_TIME">Full-Time</SelectItem>
                    <SelectItem value="INTERNSHIP">Internship</SelectItem>
                    <SelectItem value="FREELANCE">Freelance</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </Section>

          <Section title="💶 Pay & Hours">
            <div className="grid grid-cols-3 gap-4">
              <Field label="Pay Rate (€)">
                <Input
                  type="number"
                  step="0.5"
                  value={payRate}
                  onChange={(e) => setPayRate(e.target.value)}
                  placeholder="14.50"
                  className={inputCls}
                />
              </Field>
              <Field label="Per">
                <Select value={payPeriod} onValueChange={setPayPeriod}>
                  <SelectTrigger className={inputCls}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/[0.08] bg-card/95 backdrop-blur-xl">
                    <SelectItem value="HOURLY">Hour</SelectItem>
                    <SelectItem value="WEEKLY">Week</SelectItem>
                    <SelectItem value="MONTHLY">Month</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Hours/Week">
                <Input
                  type="number"
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(e.target.value)}
                  placeholder="20"
                  className={inputCls}
                />
              </Field>
            </div>
            <div className="p-3.5 rounded-xl bg-blue-500/[0.08] border border-blue-500/20 text-sm text-blue-300">
              💡 Stamp 2 students can work up to <strong>20 hours/week</strong> during term time. Set this correctly to match eligible candidates automatically.
            </div>
          </Section>

          <Section title="📍 Location">
            <Field label="City / Area">
              <Input
                value={location}
                onChange={(e) => setLocation2(e.target.value)}
                placeholder="Dublin 2, Cork City, Remote..."
                disabled={isRemote}
                className={`${inputCls} disabled:opacity-50`}
              />
            </Field>
            <div className="flex items-center gap-3">
              <Checkbox
                id="remote"
                checked={isRemote}
                onCheckedChange={(c) => setIsRemote(c === true)}
                className="border-white/[0.2] data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <Label htmlFor="remote" className="font-normal cursor-pointer text-sm">This is a fully remote position</Label>
            </div>
          </Section>

          <Section title="🛂 Visa Eligibility">
            <p className="text-sm text-muted-foreground">
              Select which visa holders can apply. Leave all unchecked to accept any visa type.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {VISA_TYPES.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => toggleVisa(v)}
                  className={`flex items-center gap-3 p-3.5 rounded-xl text-left transition-all ${
                    visaEligible.includes(v)
                      ? "gradient-border bg-primary/5 border-primary/30"
                      : "glass border-white/[0.08] hover:border-white/[0.15]"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                    visaEligible.includes(v) ? "bg-primary border-primary" : "border-white/[0.2]"
                  }`}>
                    {visaEligible.includes(v) && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm font-medium">{VISA_LABELS[v]}</span>
                </button>
              ))}
            </div>
          </Section>

          <Button
            type="submit"
            className="w-full btn-gradient h-12 rounded-xl text-base font-semibold"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Posting...
              </span>
            ) : "🚀 Post Job Listing"}
          </Button>
        </motion.form>
      </div>
    </Layout>
  );
}
