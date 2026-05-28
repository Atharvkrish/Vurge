import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock,
  MapPin,
  Briefcase,
  GraduationCap,
  Search,
  ChevronRight,
  Building2,
  FileText,
  Star,
} from "lucide-react";
import { DotGlobeHero } from "@/components/ui/globe-hero";
import { useListJobs } from "@workspace/api-client-react";
import { JobCard, JobCardSkeleton } from "@/components/job-card";

const fadeUp = { hidden: { opacity: 0, y: 32 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

const STATS = [
  { label: "Active Jobs", value: "500+", icon: Briefcase },
  { label: "Verified Employers", value: "120+", icon: ShieldCheck },
  { label: "Students Hired", value: "2,400+", icon: GraduationCap },
  { label: "Avg. Response", value: "< 48h", icon: Clock },
];

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Visa-Smart Matching",
    desc: "Jobs automatically filtered for your visa type — Stamp 2, Stamp 1G, Graduate, and more. Never worry about compliance again.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: Building2,
    title: "Verified Employers",
    desc: "Every employer on Vurge is vetted for trust and rated by students. Only work with companies that respect international talent.",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: Zap,
    title: "Micro-Internships",
    desc: "Build your CV with short-term paid projects (3 days – 2 weeks) that fit around your studies and visa conditions.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: FileText,
    title: "AI CV Scoring",
    desc: "Our engine scores your CV against job descriptions and suggests improvements to boost your match rate.",
    gradient: "from-emerald-500 to-teal-500",
  },
];

const VISA_TYPES = [
  { name: "Stamp 2", limit: "20 hrs/week", badge: "bg-violet-500/20 text-violet-300" },
  { name: "Stamp 1G", limit: "Full-time", badge: "bg-pink-500/20 text-pink-300" },
  { name: "Graduate Visa", limit: "Full-time", badge: "bg-blue-500/20 text-blue-300" },
  { name: "Student Visa (UK)", limit: "20 hrs/week", badge: "bg-teal-500/20 text-teal-300" },
];

const PART_TIME_CATEGORIES = ["Hospitality", "Retail", "Healthcare", "Technology", "Other"];

function PartTimeJobsSection() {
  const { data, isLoading } = useListJobs(
    { jobType: "PART_TIME", limit: 4 },
    { query: { queryKey: ["jobs-parttime-home"] } }
  );

  return (
    <section className="py-20 px-4 border-t border-white/[0.05]">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-semibold text-violet-400 border-violet-500/20 mb-4">
              <Briefcase className="w-3.5 h-3.5" /> Part-Time Jobs
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-3">
              Earn while you <span className="gradient-text">study</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl">
              Retail, Healthcare, Hospitality and more — all visa-compliant, all flexible.
            </p>
          </div>
          <Button
            variant="outline"
            className="glass border-white/[0.1] rounded-xl shrink-0 gap-2"
            asChild
          >
            <Link href="/jobs?type=PART_TIME">
              View all part-time jobs <ChevronRight className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>

        <div className="flex flex-wrap gap-2 mb-8">
          {PART_TIME_CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/jobs?type=PART_TIME&category=${cat}`}
              className="px-3.5 py-1.5 rounded-full glass text-sm font-medium hover:border-primary/30 transition-colors"
            >
              {cat}
            </Link>
          ))}
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => <JobCardSkeleton key={i} />)}
          </div>
        ) : data && data.jobs.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {data.jobs.slice(0, 4).map((job, i) => (
              <JobCard key={job.id} job={job as any} linkTo={`/jobs/${job.id}`} index={i} />
            ))}
          </div>
        ) : (
          <div className="glass-card py-16 text-center text-muted-foreground">
            <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <div className="font-medium">No part-time jobs at the moment</div>
            <div className="text-sm mt-1">Check back soon or browse all jobs</div>
          </div>
        )}
      </div>
    </section>
  );
}

function UniversityPlacementsSection() {
  const UNIVERSITIES = [
    { name: "University College Dublin", domain: "ucd.ie", count: 12 },
    { name: "Trinity College Dublin", domain: "tcd.ie", count: 8 },
    { name: "University College Cork", domain: "ucc.ie", count: 5 },
    { name: "Dublin City University", domain: "dcu.ie", count: 7 },
  ];

  return (
    <section className="py-20 px-4 border-t border-white/[0.05] relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-40%] right-[-10%] w-[500px] h-[500px] rounded-full bg-pink-600/6 blur-[100px]" />
      </div>
      <div className="container mx-auto max-w-6xl relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-semibold text-pink-400 border-pink-500/20 mb-4">
            <GraduationCap className="w-3.5 h-3.5" /> University Direct
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-3">
            University <span className="gradient-text">Work Placements</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Your university sends your application directly to partner companies — no lengthy forms, no cover letters.
          </p>
        </motion.div>

        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {UNIVERSITIES.map((uni) => (
            <motion.div key={uni.name} variants={fadeUp} className="glass-card p-5 group cursor-default">
              <div className="w-10 h-10 rounded-xl gradient-purple-pink flex items-center justify-center text-white font-bold text-lg mb-4">
                {uni.name.charAt(0)}
              </div>
              <div className="font-semibold text-sm mb-1">{uni.name}</div>
              <div className="text-xs text-muted-foreground mb-3">{uni.domain}</div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-violet-400 font-semibold">{uni.count} placements</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="glass-card p-8 text-center max-w-2xl mx-auto">
          <GraduationCap className="w-10 h-10 text-primary mx-auto mb-3 opacity-70" />
          <h3 className="font-bold text-lg mb-2">Is your university listed?</h3>
          <p className="text-muted-foreground text-sm mb-5">
            Sign up with your university email and we'll automatically match you with direct placement partners for your institution.
          </p>
          <Button className="btn-gradient rounded-xl" asChild>
            <Link href="/register">Apply via University <ArrowRight className="w-4 h-4 ml-1.5" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function OwnPlacementSection() {
  const { data, isLoading } = useListJobs(
    { jobType: "INTERNSHIP", limit: 3 },
    { query: { queryKey: ["jobs-internship-home"] } }
  );

  return (
    <section className="py-20 px-4 border-t border-white/[0.05]">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-semibold text-blue-400 border-blue-500/20 mb-4">
              <Search className="w-3.5 h-3.5" /> Independent Placements
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-3">
              Find Your Own <span className="gradient-text">Work Placement</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl">
              Search and apply to internships and entry-level placements independently — your way, your timeline.
            </p>
          </div>
          <Button
            variant="outline"
            className="glass border-white/[0.1] rounded-xl shrink-0 gap-2"
            asChild
          >
            <Link href="/placements">
              Browse placements <ChevronRight className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>

        {isLoading ? (
          <div className="grid sm:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => <JobCardSkeleton key={i} />)}
          </div>
        ) : data && data.jobs.length > 0 ? (
          <div className="grid sm:grid-cols-3 gap-5">
            {data.jobs.slice(0, 3).map((job, i) => (
              <JobCard key={job.id} job={job as any} linkTo={`/jobs/${job.id}`} index={i} />
            ))}
          </div>
        ) : (
          <div className="glass-card py-16 text-center text-muted-foreground">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <div className="font-medium">No internships listed yet</div>
            <Link href="/jobs" className="text-sm text-primary hover:underline mt-1 block">Browse all jobs →</Link>
          </div>
        )}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <Layout>
      {/* ── 3D Globe Hero ───────────────────────────────────── */}
      <DotGlobeHero
        rotationSpeed={0.004}
        globeRadius={1.1}
        className="min-h-screen"
      >
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background/60 pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-pink-500/4 rounded-full blur-3xl animate-pulse pointer-events-none" />

        <div className="relative z-10 text-center max-w-5xl mx-auto px-6 py-12 space-y-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full glass border-primary/20"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-sm font-semibold text-primary tracking-wide">
              Ireland &amp; UK — Visa-smart jobs for international students
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.85]"
          >
            <span className="block text-foreground/80 font-light text-4xl md:text-6xl mb-3">
              Your career,
            </span>
            <span className="gradient-text">no limits.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Connect students with verified part-time jobs and work placements across{" "}
            <span className="text-foreground font-semibold">Ireland and the UK</span>.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-5 justify-center"
          >
            <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                className="btn-gradient text-base px-9 py-6 rounded-xl font-semibold gap-2 glow-purple w-full sm:w-auto"
                asChild
              >
                <Link href="/jobs">
                  Find Jobs <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                variant="outline"
                className="text-base px-9 py-6 rounded-xl font-semibold glass border-white/[0.12] hover:border-primary/40 w-full sm:w-auto gap-2"
                asChild
              >
                <Link href="/register">
                  <Building2 className="w-5 h-5" /> Hire Students
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Floating job card preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.7 }}
            className="w-full max-w-sm mx-auto"
          >
            <div className="glass-card p-5 text-left">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-semibold text-sm">Junior Frontend Developer</div>
                  <div className="text-muted-foreground text-xs mt-0.5">TechCork Ltd · Remote</div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                  Visa Eligible
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                <span className="px-2.5 py-1 rounded-full glass flex items-center gap-1">
                  <span className="font-semibold text-foreground">€14</span>/hr
                </span>
                <span className="px-2.5 py-1 rounded-full glass flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 20h/wk
                </span>
                <span className="px-2.5 py-1 rounded-full glass">Stamp 2</span>
                <span className="px-2.5 py-1 rounded-full glass flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> 4.9
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </DotGlobeHero>

      {/* ── Stats ─────────────────────────────────────────── */}
      <section className="py-16 px-4 border-y border-white/[0.05]">
        <div className="container mx-auto">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {STATS.map((stat) => (
              <motion.div key={stat.label} variants={fadeUp} className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="w-10 h-10 rounded-xl gradient-purple-pink flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-extrabold gradient-text">{stat.value}</div>
                <div className="text-muted-foreground text-sm mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Part-Time Jobs Section ──────────────────────────── */}
      <PartTimeJobsSection />

      {/* ── University Placements ───────────────────────────── */}
      <UniversityPlacementsSection />

      {/* ── Find Your Own Placement ─────────────────────────── */}
      <OwnPlacementSection />

      {/* ── Features ──────────────────────────────────────── */}
      <section className="py-24 px-4 border-t border-white/[0.05]">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
              Built for <span className="gradient-text">your reality</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Every feature designed around the challenges international students actually face.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {FEATURES.map((f) => (
              <motion.div key={f.title} variants={fadeUp} className="glass-card p-7 group cursor-default">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-5 transition-transform group-hover:scale-110`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Visa Guide ────────────────────────────────────── */}
      <section className="py-24 px-4 border-t border-white/[0.05]">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
              Know your <span className="gradient-text">work rights</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Vurge automatically applies the correct hour limits for your visa type.
            </p>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 gap-5"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {VISA_TYPES.map((v) => (
              <motion.div key={v.name} variants={fadeUp} className="glass-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-lg mb-1">{v.name}</div>
                    <div className="text-muted-foreground text-sm">Work allowance</div>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${v.badge}`}>
                    {v.limit}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            className="glass-card gradient-border p-12 text-center relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
              <div className="absolute top-[-50%] left-[-20%] w-[400px] h-[400px] rounded-full bg-violet-600/10 blur-[80px]" />
              <div className="absolute bottom-[-50%] right-[-20%] w-[400px] h-[400px] rounded-full bg-pink-600/10 blur-[80px]" />
            </div>
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl gradient-purple-pink flex items-center justify-center mx-auto mb-5">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-4xl font-extrabold mb-4">
                Ready to <span className="gradient-text">Vurge</span>?
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                Join thousands of international students who found their perfect visa-compliant job through Vurge.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="btn-gradient px-10 py-6 rounded-2xl text-base font-semibold" asChild>
                  <Link href="/register">Get started — it's free</Link>
                </Button>
                <Button size="lg" variant="outline" className="glass border-white/[0.1] px-10 py-6 rounded-2xl text-base font-semibold" asChild>
                  <Link href="/jobs">Browse jobs</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
