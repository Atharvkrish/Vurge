import { Building2, Clock, MapPin, Wifi, ArrowRight, Star } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

interface Job {
  id: number;
  title: string;
  jobType: string;
  location?: string | null;
  isRemote?: boolean;
  payRate?: number | null;
  payPeriod?: string | null;
  hoursPerWeek?: number | null;
  visaEligible?: string[];
  category?: string | null;
  description?: string | null;
  createdAt?: string;
  isFeatured?: boolean;
  employer?: { companyName?: string; isVerified?: boolean };
  visaEligibilityStatus?: string;
}

const VISA_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  STAMP_2:       { bg: "bg-violet-500/15", text: "text-violet-300", border: "border-violet-500/20" },
  STAMP_1G:      { bg: "bg-pink-500/15",   text: "text-pink-300",   border: "border-pink-500/20"   },
  GRADUATE_VISA: { bg: "bg-blue-500/15",   text: "text-blue-300",   border: "border-blue-500/20"   },
  STUDENT_VISA:  { bg: "bg-teal-500/15",   text: "text-teal-300",   border: "border-teal-500/20"   },
};

const VISA_LABELS: Record<string, string> = {
  STAMP_2:       "Stamp 2",
  STAMP_1G:      "Stamp 1G",
  GRADUATE_VISA: "Graduate",
  STUDENT_VISA:  "Student Visa",
};

const JOB_TYPE_LABELS: Record<string, string> = {
  PART_TIME:  "Part-Time",
  FULL_TIME:  "Full-Time",
  INTERNSHIP: "Internship",
  FREELANCE:  "Freelance",
};

export function VisaBadge({ visa }: { visa: string }) {
  const style = VISA_COLORS[visa] ?? { bg: "bg-white/[0.08]", text: "text-muted-foreground", border: "border-white/[0.08]" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${style.bg} ${style.text} ${style.border}`}>
      {VISA_LABELS[visa] ?? visa.replace(/_/g, " ")}
    </span>
  );
}

export function VisaStatusBadge({ status, hours }: { status?: string; hours?: number | null }) {
  if (!status) return null;
  if (status === "ELIGIBLE") return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Visa OK
    </span>
  );
  if (status === "CHECK_HOURS") return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/20"
      title={`Max 20hrs/week limit applies. Job asks for ${hours}hrs`}>
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Verify Hours
    </span>
  );
  if (status === "NOT_ELIGIBLE") return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/20">
      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Not Eligible
    </span>
  );
  return null;
}

export function JobCard({ job, linkTo, index = 0 }: { job: Job; linkTo: string; index?: number }) {
  const payStr = job.payRate
    ? `€${job.payRate}/${job.payPeriod === "HOURLY" ? "hr" : job.payPeriod === "WEEKLY" ? "wk" : job.payPeriod === "MONTHLY" ? "mo" : "hr"}`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="group h-full"
    >
      <Link href={linkTo} className="block h-full">
        <div className="glass-card p-5 h-full flex flex-col gap-3 hover:border-primary/25 transition-all duration-300 cursor-pointer">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-bold text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                {job.title}
              </h3>
              {job.employer?.companyName && (
                <div className="flex items-center gap-1.5 mt-1.5 text-muted-foreground text-sm">
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{job.employer.companyName}</span>
                  {job.employer.isVerified && (
                    <span className="text-primary text-[11px] font-semibold shrink-0">Verified</span>
                  )}
                </div>
              )}
            </div>
            <span className="shrink-0 px-2 py-1 rounded-lg glass text-xs font-medium text-muted-foreground whitespace-nowrap">
              {JOB_TYPE_LABELS[job.jobType] ?? job.jobType.replace(/_/g, " ")}
            </span>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
            {payStr && (
              <span className="px-2.5 py-1 rounded-full glass font-semibold text-foreground">
                {payStr}
              </span>
            )}
            {job.hoursPerWeek && (
              <span className="px-2.5 py-1 rounded-full glass flex items-center gap-1">
                <Clock className="w-3 h-3" /> {job.hoursPerWeek}h/wk
              </span>
            )}
            {job.isRemote ? (
              <span className="px-2.5 py-1 rounded-full glass flex items-center gap-1">
                <Wifi className="w-3 h-3" /> Remote
              </span>
            ) : job.location ? (
              <span className="px-2.5 py-1 rounded-full glass flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {job.location}
              </span>
            ) : null}
          </div>

          {/* Visa status badge (detail view) or visa eligibility chips */}
          {job.visaEligibilityStatus ? (
            <VisaStatusBadge status={job.visaEligibilityStatus} hours={job.hoursPerWeek} />
          ) : job.visaEligible && job.visaEligible.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {job.visaEligible.slice(0, 3).map(v => <VisaBadge key={v} visa={v} />)}
              {job.visaEligible.length > 3 && (
                <span className="text-[11px] text-muted-foreground px-2 py-0.5 glass rounded-full">
                  +{job.visaEligible.length - 3}
                </span>
              )}
            </div>
          ) : null}

          {/* CTA */}
          <div className="mt-auto flex items-center justify-between pt-2 border-t border-white/[0.05]">
            {job.createdAt && (
              <span className="text-xs text-muted-foreground">
                {new Date(job.createdAt).toLocaleDateString("en-IE", { day: "numeric", month: "short" })}
              </span>
            )}
            {job.isFeatured && (
              <span className="px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20 text-[11px] font-semibold flex items-center gap-1">
                <Star className="w-3 h-3" /> Featured
              </span>
            )}
            <span className="ml-auto text-xs text-primary font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
              View <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function JobCardSkeleton() {
  return (
    <div className="glass-card p-5 animate-pulse space-y-4">
      <div className="flex gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-white/[0.06] rounded-lg w-4/5" />
          <div className="h-3 bg-white/[0.04] rounded-lg w-3/5" />
        </div>
        <div className="h-6 w-20 bg-white/[0.04] rounded-lg shrink-0" />
      </div>
      <div className="flex gap-2">
        <div className="h-6 w-16 bg-white/[0.04] rounded-full" />
        <div className="h-6 w-20 bg-white/[0.04] rounded-full" />
      </div>
      <div className="flex gap-1.5">
        <div className="h-5 w-16 bg-white/[0.04] rounded-full" />
        <div className="h-5 w-16 bg-white/[0.04] rounded-full" />
      </div>
    </div>
  );
}
