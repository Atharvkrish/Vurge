import { useState } from "react";
import { useUpdateProfile } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { X, Plus, User } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const VISA_TYPES = [
  { value: "STAMP_2", label: "Stamp 2 (Student)" },
  { value: "STAMP_1G", label: "Stamp 1G (Graduated)" },
  { value: "GRADUATE_VISA", label: "Graduate Visa" },
  { value: "STUDENT_VISA", label: "Student Visa" },
];

const SECTORS = ["Technology", "Hospitality", "Marketing", "Retail", "Healthcare", "Finance", "Education", "Other"];

export default function ProfilePage() {
  const { user, setToken } = useAuth();
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

  const removeSkill = (skill: string) => setSkills(skills.filter(s => s !== skill));

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
          toast({ title: "Profile saved", description: "Your profile has been updated successfully." });
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
      <div className="bg-primary/5 py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-3xl font-bold text-primary">My Profile</h1>
              <p className="text-muted-foreground text-sm">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={user?.email ?? ""} disabled className="bg-muted" />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Input value={user?.role ?? ""} disabled className="bg-muted" />
            </div>
          </CardContent>
        </Card>

        {user?.role === "STUDENT" && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Academic & Visa Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-2">
                    <Label>University / College</Label>
                    <Input value={university} onChange={e => setUniversity(e.target.value)} placeholder="e.g. University College Dublin" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Course</Label>
                    <Input value={course} onChange={e => setCourse(e.target.value)} placeholder="e.g. MSc Computer Science" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Graduation Year</Label>
                    <Input type="number" value={graduationYear} onChange={e => setGraduationYear(e.target.value)} placeholder="e.g. 2026" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Visa Type</Label>
                    <Select value={visaType} onValueChange={setVisaType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select visa type" />
                      </SelectTrigger>
                      <SelectContent>
                        {VISA_TYPES.map(v => (
                          <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Visa Expiry Date</Label>
                    <Input type="date" value={visaExpiryDate} onChange={e => setVisaExpiryDate(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Bio</Label>
                  <Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell employers a bit about yourself..." className="min-h-[100px]" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2 min-h-[36px]">
                  {skills.map(skill => (
                    <Badge key={skill} variant="secondary" className="gap-1.5 pr-1.5">
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="hover:text-destructive transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                  {skills.length === 0 && <p className="text-sm text-muted-foreground">No skills added yet</p>}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={e => setNewSkill(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSkill())}
                    placeholder="Add a skill (e.g. React, Python)"
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="icon" onClick={addSkill}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {user?.role === "EMPLOYER" && (
          <Card>
            <CardHeader>
              <CardTitle>Company Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Company Name</Label>
                <Input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Your company name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Company Registration No.</Label>
                  <Input value={companyRegistration} onChange={e => setCompanyRegistration(e.target.value)} placeholder="e.g. IE123456" />
                </div>
                <div className="space-y-1.5">
                  <Label>Website</Label>
                  <Input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://yourcompany.ie" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Sector</Label>
                  <Select value={sector} onValueChange={setSector}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sector" />
                    </SelectTrigger>
                    <SelectContent>
                      {SECTORS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Employee Count</Label>
                  <Select value={employeeCount} onValueChange={setEmployeeCount}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {["1-10", "11-50", "51-200", "200+"].map(s => <SelectItem key={s} value={s}>{s} employees</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Company Description</Label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Tell students about your company..." className="min-h-[100px]" />
              </div>
            </CardContent>
          </Card>
        )}

        <Button onClick={handleSave} disabled={updateMutation.isPending} className="w-full">
          {updateMutation.isPending ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </Layout>
  );
}
