import { useState } from "react";
import { useUpdateProfile } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { X, Plus, User, GraduationCap, Building2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";

const VISA_TYPES = [
  { value: "STAMP_2", label: "🇮🇪 Stamp 2 (Student)" },
  { value: "STAMP_1G", label: "🇮🇪 Stamp 1G (Graduate)" },
  { value: "GRADUATE_VISA", label: "🇬🇧 Graduate Visa" },
  { value: "STUDENT_VISA", label: "🇬🇧 Student Visa" },
];

const SECTORS = ["Technology", "Hospitality", "Marketing", "Retail", "Healthcare", "Finance", "Education", "Other"];

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

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const updateMutation = useUpdateProfile();

  const sp = user?.studentProfile as { university?: string; course?: string; graduationYear?: number; visaType?: string; visaExpiryDate?: string; skills?: string[]; bio?: string } | null;
  const ep = user?.employerProfile as { companyName?: string; companyRegistration?: string; website?: string; sector?: string; employeeCount?: string; description?: string } | null;

  const [name, setName] = useState(user?.name ?? "");
  const [bio, setBio] = useState(sp?.bio ?? "");
  const [university, setUniversity] = useState(sp?.university ?? "");
  const [course, setCourse] = useState(sp?.course ?? "");
  const [graduationYear, setGraduationYear] = useState(sp?.graduationYear?.toString() ?? "");
  const [visaType, setVisaType] = useState(sp?.visaType ?? "");
  const [visaExpiryDate, setVisaExpiryDate] = useState(sp?.visaExpiryDate ?? "");
  const [skills, setSkills] = useState<string[]>(sp?.skills ?? []);
  const [newSkill, setNewSkill] = useState("");

  const [companyName, setCompanyName] = useState(ep?.companyName ?? "");
  const [companyRegistration, setCompanyRegistration] = useState(ep?.companyRegistration ?? "");
  const [website, setWebsite] = useState(ep?.website ?? "");
  const [sector, setSector] = useState(ep?.sector ?? "");
  const [employeeCount, setEmployeeCount] = useState(ep?.employeeCount ?? "");
  const [description, setDescription] = useState(ep?.description ?? "");

  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => setSkills(skills.filter((s) => s !== skill));

  const handleSave = () => {
    const payload: Record<string, unknown> = { name };
    if (user?.role === "STUDENT") {
      Object.assign(payload, {
        bio, university, course, skills,
        visaType: visaType || undefined,
        visaExpiryDate: visaExpiryDate || undefined,
        graduationYear: graduationYear ? parseInt(graduationYear) : undefined,
      });
    } else if (user?.role === "EMPLOYER") {
      Object.assign(payload, { companyName, companyRegistration, website, sector, employeeCount, description });
    }
    updateMutation.mutate(
      { data: payload as Parameters<typeof updateMutation.mutate>[0]["data"] },
      {
        onSuccess: () => {
          toast({ title: "Profile saved ✓", description: "Your profile has been updated." });
          queryClient.invalidateQueries({ queryKey: ["getMe"] });
        },
        onError: () => {
          toast({ title: "Error", description: "Could not save profile.", variant: "destructive" });
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
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl gradient-purple-pink flex items-center justify-center text-white text-2xl font-bold glow-purple">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <h1 className="font-extrabold text-3xl">
                My <span className="gradient-text">Profile</span>
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">{user?.email}</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl space-y-5">
        <Section title="Basic Information">
          <Field label="Full Name">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="glass border-white/[0.1] rounded-xl h-11 bg-transparent focus:border-primary/50"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Email">
              <Input value={user?.email ?? ""} disabled className="glass border-white/[0.05] rounded-xl h-11 bg-transparent opacity-60" />
            </Field>
            <Field label="Role">
              <div className="h-11 px-3 rounded-xl glass border-white/[0.05] flex items-center">
                <span className="text-xs px-2.5 py-1 rounded-full gradient-purple-pink text-white font-semibold">{user?.role}</span>
              </div>
            </Field>
          </div>
        </Section>

        {user?.role === "STUDENT" && (
          <>
            <Section title="🎓 Academic & Visa Details">
              <div className="grid grid-cols-2 gap-4">
                <Field label="University / College">
                  <Input
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder="University College Dublin"
                    className="glass border-white/[0.1] rounded-xl h-11 bg-transparent focus:border-primary/50 col-span-2"
                  />
                </Field>
                <Field label="Course">
                  <Input
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    placeholder="MSc Computer Science"
                    className="glass border-white/[0.1] rounded-xl h-11 bg-transparent focus:border-primary/50"
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Graduation Year">
                  <Input
                    type="number"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    placeholder="2026"
                    className="glass border-white/[0.1] rounded-xl h-11 bg-transparent focus:border-primary/50"
                  />
                </Field>
                <Field label="Visa Expiry Date">
                  <Input
                    type="date"
                    value={visaExpiryDate}
                    onChange={(e) => setVisaExpiryDate(e.target.value)}
                    className="glass border-white/[0.1] rounded-xl h-11 bg-transparent focus:border-primary/50"
                  />
                </Field>
              </div>
              <Field label="Visa Type">
                <Select value={visaType} onValueChange={setVisaType}>
                  <SelectTrigger className="glass border-white/[0.1] rounded-xl h-11 bg-transparent">
                    <SelectValue placeholder="Select your visa type" />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/[0.08] bg-card/95 backdrop-blur-xl">
                    {VISA_TYPES.map((v) => (
                      <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Bio">
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell employers a bit about yourself..."
                  className="glass border-white/[0.1] rounded-xl bg-transparent focus:border-primary/50 min-h-[100px]"
                />
              </Field>
            </Section>

            <Section title="🛠️ Skills">
              <div className="flex flex-wrap gap-2 min-h-[36px]">
                {skills.map((skill) => (
                  <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-sm font-medium">
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="hover:text-rose-400 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {skills.length === 0 && (
                  <p className="text-sm text-muted-foreground">No skills added yet. Add some to boost your match rate!</p>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  placeholder="Add a skill (e.g. React, Python, Barista)"
                  className="flex-1 glass border-white/[0.1] rounded-xl h-11 bg-transparent focus:border-primary/50"
                />
                <Button type="button" variant="outline" className="glass border-white/[0.1] rounded-xl w-11 h-11 p-0" onClick={addSkill}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </Section>
          </>
        )}

        {user?.role === "EMPLOYER" && (
          <Section title="🏢 Company Details">
            <Field label="Company Name">
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Your company name"
                className="glass border-white/[0.1] rounded-xl h-11 bg-transparent focus:border-primary/50"
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Company Registration No.">
                <Input
                  value={companyRegistration}
                  onChange={(e) => setCompanyRegistration(e.target.value)}
                  placeholder="IE123456"
                  className="glass border-white/[0.1] rounded-xl h-11 bg-transparent focus:border-primary/50"
                />
              </Field>
              <Field label="Website">
                <Input
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourcompany.ie"
                  className="glass border-white/[0.1] rounded-xl h-11 bg-transparent focus:border-primary/50"
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Sector">
                <Select value={sector} onValueChange={setSector}>
                  <SelectTrigger className="glass border-white/[0.1] rounded-xl h-11 bg-transparent">
                    <SelectValue placeholder="Select sector" />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/[0.08] bg-card/95 backdrop-blur-xl">
                    {SECTORS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Company Size">
                <Select value={employeeCount} onValueChange={setEmployeeCount}>
                  <SelectTrigger className="glass border-white/[0.1] rounded-xl h-11 bg-transparent">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/[0.08] bg-card/95 backdrop-blur-xl">
                    {["1-10", "11-50", "51-200", "200+"].map((s) => (
                      <SelectItem key={s} value={s}>{s} employees</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Company Description">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell students about your company..."
                className="glass border-white/[0.1] rounded-xl bg-transparent focus:border-primary/50 min-h-[100px]"
              />
            </Field>
          </Section>
        )}

        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="w-full btn-gradient h-12 rounded-xl text-base font-semibold"
        >
          {updateMutation.isPending ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </span>
          ) : "Save Profile ✓"}
        </Button>
      </div>
    </Layout>
  );
}
