import { useState } from "react";
import { useGetCv, useSaveCv, useListJobs } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, X, ChevronRight, ChevronLeft, FileText,
  Briefcase, GraduationCap, Wrench, User, CheckCircle2,
  TrendingUp, AlertCircle, Info
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface WorkExperience {
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface Education {
  institution: string;
  degree: string;
  startYear: string;
  endYear: string;
}

interface CvFormData {
  name: string;
  email: string;
  phone: string;
  summary: string;
  workExperience: WorkExperience[];
  education: Education[];
  skills: string[];
}

interface MatchResult {
  score: number;
  suggestions: string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const COMMON_SKILLS = [
  "JavaScript", "TypeScript", "React", "Python", "Node.js",
  "Customer Service", "Microsoft Office", "Communication",
  "Data Analysis", "Project Management", "SQL", "Teamwork",
  "Barista", "Retail", "Cash Handling", "Food Safety",
];

const STEPS = [
  { id: "personal", label: "Personal", icon: User },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "skills", label: "Skills", icon: Wrench },
  { id: "match", label: "Match Score", icon: TrendingUp },
];

const inputCls = "glass border-white/[0.1] rounded-xl h-11 bg-transparent focus:border-primary/50";
const textareaCls = "glass border-white/[0.1] rounded-xl bg-transparent focus:border-primary/50";

// ─── Score circle ─────────────────────────────────────────────────────────────

function ScoreCircle({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={radius} strokeWidth="10" stroke="rgba(255,255,255,0.06)" fill="none" />
        <motion.circle
          cx="64" cy="64" r={radius} strokeWidth="10"
          stroke={color} fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black">{score}</span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

// ─── Step: Personal ──────────────────────────────────────────────────────────

function PersonalStep({ form, onChange }: { form: CvFormData; onChange: (f: Partial<CvFormData>) => void }) {
  return (
    <Section title="Personal Details">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Full Name">
          <Input value={form.name} onChange={e => onChange({ name: e.target.value })} placeholder="Jane Smith" className={inputCls} />
        </Field>
        <Field label="Email">
          <Input type="email" value={form.email} onChange={e => onChange({ email: e.target.value })} placeholder="jane@university.ie" className={inputCls} />
        </Field>
        <Field label="Phone">
          <Input value={form.phone} onChange={e => onChange({ phone: e.target.value })} placeholder="+353 87 123 4567" className={inputCls} />
        </Field>
      </div>
      <Field label="Professional Summary">
        <Textarea
          value={form.summary}
          onChange={e => onChange({ summary: e.target.value })}
          placeholder="Brief introduction about your background, skills, and career goals..."
          className={`${textareaCls} min-h-[120px]`}
        />
      </Field>
    </Section>
  );
}

// ─── Step: Experience ─────────────────────────────────────────────────────────

function ExperienceStep({ form, onChange }: { form: CvFormData; onChange: (f: Partial<CvFormData>) => void }) {
  const addEntry = () => onChange({
    workExperience: [...form.workExperience, { company: "", title: "", startDate: "", endDate: "", current: false, description: "" }]
  });
  const removeEntry = (i: number) => onChange({ workExperience: form.workExperience.filter((_, idx) => idx !== i) });
  const updateEntry = (i: number, patch: Partial<WorkExperience>) => {
    const updated = form.workExperience.map((exp, idx) => idx === i ? { ...exp, ...patch } : exp);
    onChange({ workExperience: updated });
  };

  return (
    <div className="space-y-4">
      {form.workExperience.map((exp, i) => (
        <Section key={i} title={`Experience ${i + 1}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Company">
              <Input value={exp.company} onChange={e => updateEntry(i, { company: e.target.value })} placeholder="Acme Ltd" className={inputCls} />
            </Field>
            <Field label="Job Title">
              <Input value={exp.title} onChange={e => updateEntry(i, { title: e.target.value })} placeholder="Barista / Developer" className={inputCls} />
            </Field>
            <Field label="Start Date">
              <Input type="month" value={exp.startDate} onChange={e => updateEntry(i, { startDate: e.target.value })} className={inputCls} />
            </Field>
            <Field label="End Date">
              <Input type="month" value={exp.endDate} onChange={e => updateEntry(i, { endDate: e.target.value })} disabled={exp.current} className={`${inputCls} disabled:opacity-50`} />
            </Field>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox" id={`current-${i}`} checked={exp.current}
              onChange={e => updateEntry(i, { current: e.target.checked })}
              className="w-4 h-4 rounded border-white/20 accent-violet-500"
            />
            <Label htmlFor={`current-${i}`} className="text-sm font-normal cursor-pointer">Currently working here</Label>
          </div>
          <Field label="Description">
            <Textarea
              value={exp.description}
              onChange={e => updateEntry(i, { description: e.target.value })}
              placeholder="Describe your responsibilities and achievements..."
              className={`${textareaCls} min-h-[100px]`}
            />
          </Field>
          <Button variant="ghost" size="sm" className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 -mt-2" onClick={() => removeEntry(i)}>
            <X className="w-4 h-4 mr-1.5" /> Remove
          </Button>
        </Section>
      ))}
      <button
        type="button"
        onClick={addEntry}
        className="w-full py-4 rounded-2xl glass border-dashed border-white/[0.12] hover:border-primary/30 text-muted-foreground hover:text-foreground transition-all flex items-center justify-center gap-2 text-sm"
      >
        <Plus className="w-4 h-4" /> Add Work Experience
      </button>
    </div>
  );
}

// ─── Step: Education ──────────────────────────────────────────────────────────

function EducationStep({ form, onChange }: { form: CvFormData; onChange: (f: Partial<CvFormData>) => void }) {
  const addEntry = () => onChange({ education: [...form.education, { institution: "", degree: "", startYear: "", endYear: "" }] });
  const removeEntry = (i: number) => onChange({ education: form.education.filter((_, idx) => idx !== i) });
  const updateEntry = (i: number, patch: Partial<Education>) => {
    onChange({ education: form.education.map((e, idx) => idx === i ? { ...e, ...patch } : e) });
  };

  return (
    <div className="space-y-4">
      {form.education.map((edu, i) => (
        <Section key={i} title={`Education ${i + 1}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Institution">
              <Input value={edu.institution} onChange={e => updateEntry(i, { institution: e.target.value })} placeholder="University College Dublin" className={`${inputCls} sm:col-span-2`} />
            </Field>
            <Field label="Degree / Qualification">
              <Input value={edu.degree} onChange={e => updateEntry(i, { degree: e.target.value })} placeholder="BSc Computer Science" className={inputCls} />
            </Field>
            <Field label="Start Year">
              <Input type="number" value={edu.startYear} onChange={e => updateEntry(i, { startYear: e.target.value })} placeholder="2022" className={inputCls} />
            </Field>
            <Field label="End Year">
              <Input type="number" value={edu.endYear} onChange={e => updateEntry(i, { endYear: e.target.value })} placeholder="2026" className={inputCls} />
            </Field>
          </div>
          <Button variant="ghost" size="sm" className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 -mt-2" onClick={() => removeEntry(i)}>
            <X className="w-4 h-4 mr-1.5" /> Remove
          </Button>
        </Section>
      ))}
      <button
        type="button"
        onClick={addEntry}
        className="w-full py-4 rounded-2xl glass border-dashed border-white/[0.12] hover:border-primary/30 text-muted-foreground hover:text-foreground transition-all flex items-center justify-center gap-2 text-sm"
      >
        <Plus className="w-4 h-4" /> Add Education
      </button>
    </div>
  );
}

// ─── Step: Skills ─────────────────────────────────────────────────────────────

function SkillsStep({ form, onChange }: { form: CvFormData; onChange: (f: Partial<CvFormData>) => void }) {
  const [newSkill, setNewSkill] = useState("");
  const toggle = (skill: string) => {
    onChange({
      skills: form.skills.includes(skill)
        ? form.skills.filter(s => s !== skill)
        : [...form.skills, skill]
    });
  };
  const add = () => {
    const s = newSkill.trim();
    if (s && !form.skills.includes(s)) {
      onChange({ skills: [...form.skills, s] });
      setNewSkill("");
    }
  };

  return (
    <Section title="Skills">
      <p className="text-sm text-muted-foreground">Select common skills or add your own. These are matched against job descriptions.</p>
      <div className="flex flex-wrap gap-2">
        {COMMON_SKILLS.map(skill => (
          <button
            key={skill}
            type="button"
            onClick={() => toggle(skill)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              form.skills.includes(skill)
                ? "gradient-purple-pink text-white border-0"
                : "glass border-white/[0.08] hover:border-primary/30 text-muted-foreground"
            }`}
          >
            {skill}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={newSkill}
          onChange={e => setNewSkill(e.target.value)}
          onKeyDown={e => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder="Add a custom skill..."
          className={`flex-1 ${inputCls}`}
        />
        <Button type="button" variant="outline" className="glass border-white/[0.1] rounded-xl w-11 h-11 p-0" onClick={add}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      {form.skills.length > 0 && (
        <div>
          <div className="text-xs text-muted-foreground mb-2">Your selected skills:</div>
          <div className="flex flex-wrap gap-2">
            {form.skills.map(s => (
              <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-sm">
                {s}
                <button onClick={() => toggle(s)} className="hover:text-rose-400 transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </Section>
  );
}

// ─── Step: Match Score ────────────────────────────────────────────────────────

function MatchStep({ form }: { form: CvFormData }) {
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [result, setResult] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: jobs } = useListJobs({ limit: 50 }, { query: { queryKey: ["jobs-match"] } });

  const runMatch = async () => {
    if (!selectedJobId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/cv/score?jobId=${selectedJobId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("visa_vantage_token")}`,
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        // Heuristic fallback score based on skills overlap
        const job = jobs?.jobs?.find((j: any) => j.id === parseInt(selectedJobId));
        const desc = ((job?.description ?? "") + " " + (job?.title ?? "")).toLowerCase();
        const matched = form.skills.filter(s => desc.includes(s.toLowerCase())).length;
        const total = Math.max(form.skills.length, 1);
        const score = Math.min(100, Math.round((matched / total) * 60 + (form.workExperience.length * 10) + (form.education.length * 5)));
        const suggestions = [
          matched < 3 ? "Add more skills that match this job description" : "Strong skill overlap detected",
          form.workExperience.length === 0 ? "Add at least one work experience entry" : "Good experience history",
          form.summary.length < 50 ? "Expand your professional summary to stand out" : "Professional summary looks strong",
        ];
        setResult({ score, suggestions });
      }
    } catch {
      const score = Math.min(85, 30 + (form.skills.length * 3) + (form.workExperience.length * 8));
      setResult({ score, suggestions: ["Add more relevant skills", "Expand your professional summary", "Include more work experience details"] });
    }
    setLoading(false);
  };

  const scoreLabel = result
    ? result.score >= 70 ? "Strong Match" : result.score >= 40 ? "Moderate Match" : "Low Match"
    : "";
  const scoreColor = result
    ? result.score >= 70 ? "text-emerald-400" : result.score >= 40 ? "text-amber-400" : "text-rose-400"
    : "";

  return (
    <div className="space-y-5">
      <Section title="Match Against a Job">
        <p className="text-sm text-muted-foreground">
          Select a live job to see how well your CV matches and get improvement suggestions.
        </p>
        <Field label="Select Job">
          <Select value={selectedJobId} onValueChange={setSelectedJobId}>
            <SelectTrigger className={`${inputCls} h-auto py-2.5`}>
              <SelectValue placeholder="Choose a job to match against..." />
            </SelectTrigger>
            <SelectContent className="glass-card border-white/[0.08] bg-card/95 backdrop-blur-xl max-h-60">
              {jobs?.jobs?.map((job: any) => (
                <SelectItem key={job.id} value={String(job.id)}>
                  {job.title} — {job.employer?.companyName ?? ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Button
          className="btn-gradient rounded-xl w-full"
          onClick={runMatch}
          disabled={!selectedJobId || loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analysing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Calculate Match Score
            </span>
          )}
        </Button>
      </Section>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 text-center"
          >
            <ScoreCircle score={result.score} />
            <div className={`text-xl font-bold mt-4 mb-1 ${scoreColor}`}>{scoreLabel}</div>
            <div className="text-sm text-muted-foreground mb-6">Your CV match score for this role</div>

            <div className="text-left space-y-3 max-w-sm mx-auto">
              <div className="text-sm font-semibold flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" /> Improvement Tips
              </div>
              {result.suggestions.map((tip, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm">
                  {tip.toLowerCase().includes("strong") || tip.toLowerCase().includes("good") ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  )}
                  <span className="text-muted-foreground">{tip}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CvBuilderPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const saveMutation = useSaveCv();
  const { data: existingCv } = useGetCv({ query: { queryKey: ["cv"] } });

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<CvFormData>({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: "",
    summary: "",
    workExperience: [],
    education: [],
    skills: ((existingCv?.parsedJson as any)?.skills as string[] | undefined) ?? [],
  });

  const onChange = (patch: Partial<CvFormData>) => setForm(prev => ({ ...prev, ...patch }));

  const handleSave = () => {
    saveMutation.mutate(
      {
        data: {
          parsedJson: {
            skills: form.skills,
            experience: form.workExperience.map(e => `${e.title} at ${e.company}: ${e.description}`).join("\n"),
            education: form.education.map(e => `${e.degree} from ${e.institution} (${e.startYear}–${e.endYear})`).join("\n"),
            summary: form.summary,
          },
        },
      },
      {
        onSuccess: () => {
          toast({ title: "CV saved", description: "Your CV has been saved successfully." });
          queryClient.invalidateQueries({ queryKey: ["cv"] });
        },
        onError: () => {
          toast({ title: "Error", description: "Could not save CV. Please try again.", variant: "destructive" });
        },
      }
    );
  };

  const canNext = step < STEPS.length - 1;
  const canPrev = step > 0;

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
              CV <span className="gradient-text">Builder</span>
            </h1>
            <p className="text-muted-foreground mt-1.5">
              Build your CV, then match it against live jobs to see your score.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Step indicator */}
        <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <button
                onClick={() => setStep(i)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  i === step
                    ? "gradient-purple-pink text-white"
                    : i < step
                    ? "glass text-primary border-primary/20"
                    : "glass text-muted-foreground"
                }`}
              >
                {i < step ? <CheckCircle2 className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                {s.label}
              </button>
              {i < STEPS.length - 1 && (
                <div className={`w-6 h-px shrink-0 ${i < step ? "bg-primary/40" : "bg-white/[0.08]"}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {step === 0 && <PersonalStep form={form} onChange={onChange} />}
            {step === 1 && <ExperienceStep form={form} onChange={onChange} />}
            {step === 2 && <EducationStep form={form} onChange={onChange} />}
            {step === 3 && <SkillsStep form={form} onChange={onChange} />}
            {step === 4 && <MatchStep form={form} />}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/[0.05]">
          <Button
            variant="outline"
            className="glass border-white/[0.1] rounded-xl gap-2"
            onClick={() => setStep(s => s - 1)}
            disabled={!canPrev}
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>

          <Button
            variant="outline"
            className="glass border-white/[0.1] rounded-xl gap-2"
            onClick={handleSave}
            disabled={saveMutation.isPending}
          >
            <FileText className="w-4 h-4" />
            {saveMutation.isPending ? "Saving..." : "Save CV"}
          </Button>

          {canNext ? (
            <Button
              className="btn-gradient rounded-xl gap-2"
              onClick={() => setStep(s => s + 1)}
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button className="btn-gradient rounded-xl gap-2" onClick={() => setStep(0)}>
              Start over
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
}

// Need React import for JSX
import React from "react";
