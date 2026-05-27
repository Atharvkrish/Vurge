import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, ShieldCheck, Zap, Star, Clock, TrendingUp, Globe } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  show: { transition: { staggerChildren: 0.1 } },
};

const STATS = [
  { label: "Active Jobs", value: "500+", icon: "💼" },
  { label: "Verified Employers", value: "120+", icon: "✅" },
  { label: "Students Hired", value: "2,400+", icon: "🎓" },
  { label: "Avg. Response", value: "< 48h", icon: "⚡" },
];

const FEATURES = [
  {
    emoji: "🛂",
    title: "Visa-Smart Matching",
    desc: "Jobs automatically filtered for your visa type — Stamp 2, Stamp 1G, Graduate, and more. Never worry about compliance again.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    emoji: "🏢",
    title: "Verified Employers",
    desc: "Every employer on Vurge is vetted for trust and rated by students. Only work with companies that respect international talent.",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    emoji: "⚡",
    title: "Micro-Internships",
    desc: "Build your CV with short-term paid projects (3 days – 2 weeks) that fit around your studies and visa conditions.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    emoji: "🤖",
    title: "AI CV Scoring",
    desc: "Our heuristic engine scores your CV against job descriptions and suggests improvements to boost your match rate.",
    gradient: "from-emerald-500 to-teal-500",
  },
];

const VISA_TYPES = [
  { name: "Stamp 2", limit: "20 hrs/week", color: "from-violet-500/20 to-violet-500/5", badge: "bg-violet-500/20 text-violet-300" },
  { name: "Stamp 1G", limit: "Full-time", color: "from-pink-500/20 to-pink-500/5", badge: "bg-pink-500/20 text-pink-300" },
  { name: "Graduate Visa", limit: "Full-time", color: "from-blue-500/20 to-blue-500/5", badge: "bg-blue-500/20 text-blue-300" },
  { name: "Student Visa (UK)", limit: "20 hrs/week", color: "from-teal-500/20 to-teal-500/5", badge: "bg-teal-500/20 text-teal-300" },
];

export default function Home() {
  return (
    <Layout>
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-28 px-4 flex flex-col items-center text-center">
        {/* Background glow orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[120px]" />
          <div className="absolute top-[10%] right-[5%] w-[400px] h-[400px] rounded-full bg-pink-600/8 blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[30%] w-[500px] h-[500px] rounded-full bg-blue-600/6 blur-[120px]" />
        </div>

        <motion.div
          className="relative z-10 max-w-4xl mx-auto"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={fadeUp} className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              🇮🇪 Ireland & 🇬🇧 UK — Visa-smart jobs for international students
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-6xl md:text-8xl font-extrabold tracking-tight leading-none mb-6"
          >
            Your career,{" "}
            <span className="gradient-text block sm:inline">no limits.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            The platform built for international students. Every job filtered for your visa, every employer vetted for trust.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="btn-gradient text-base px-8 py-6 rounded-2xl font-semibold gap-2 glow-purple"
              asChild
            >
              <Link href="/jobs">
                Find Jobs <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base px-8 py-6 rounded-2xl font-semibold glass border-white/[0.1] hover:border-primary/40"
              asChild
            >
              <Link href="/register">
                Hire Students 🎓
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Floating job card preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="relative z-10 mt-16 w-full max-w-xl mx-auto"
        >
          <div className="glass-card p-5 text-left">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-semibold text-base">Junior Frontend Developer</div>
                <div className="text-muted-foreground text-sm mt-0.5">TechCork Ltd · Remote</div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                ✓ Visa Eligible
              </span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="px-2.5 py-1 rounded-full glass">💶 €14/hr</span>
              <span className="px-2.5 py-1 rounded-full glass">🕐 20h/week</span>
              <span className="px-2.5 py-1 rounded-full glass">🎓 Stamp 2 OK</span>
              <span className="px-2.5 py-1 rounded-full glass">⭐ 4.9 Employer</span>
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
              <div className="h-full w-3/5 rounded-full gradient-purple-pink" />
            </div>
            <div className="text-xs text-muted-foreground mt-1.5">12 applicants · 3 days left</div>
          </div>
        </motion.div>
      </section>

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
                <div className="text-4xl mb-2">{stat.emoji}</div>
                <div className="text-3xl md:text-4xl font-extrabold gradient-text">{stat.value}</div>
                <div className="text-muted-foreground text-sm mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section className="py-24 px-4">
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
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-2xl mb-5 transition-transform group-hover:scale-110`}>
                  {f.emoji}
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Visa guide ────────────────────────────────────── */}
      <section className="py-24 px-4 border-t border-white/[0.05]">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
              Know your <span className="gradient-text-blue">work rights</span>
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
              <div className="text-5xl mb-4">🚀</div>
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
                  <Link href="/jobs">Browse jobs →</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
