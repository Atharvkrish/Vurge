import { Job, JobDetailVisaEligibilityStatus } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Building2, Clock, MapPin, Euro, Briefcase, Star } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

interface JobCardProps {
  job: Job & { visaEligibilityStatus?: JobDetailVisaEligibilityStatus };
  linkTo: string;
  index?: number;
}

export function VisaBadge({ status, hours }: { status?: JobDetailVisaEligibilityStatus, hours?: number | null }) {
  if (!status) return null;

  if (status === "ELIGIBLE") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        Visa OK
      </span>
    );
  }

  if (status === "CHECK_HOURS") {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/20"
        title={`Max 20hrs/week limit applies. Job asks for ${hours}hrs`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        Verify Hours
      </span>
    );
  }

  if (status === "NOT_ELIGIBLE") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
        Not Eligible
      </span>
    );
  }

  return null;
}

export function JobCardSkeleton() {
  return (
    <div className="glass-card p-5 animate-pulse">
      <div className="flex justify-between mb-4">
        <div className="space-y-2 flex-1">
          <div className="h-5 bg-white/[0.07] rounded-lg w-3/4" />
          <div className="h-4 bg-white/[0.05] rounded-lg w-1/2" />
        </div>
        <div className="h-6 w-16 bg-white/[0.05] rounded-full" />
      </div>
      <div className="flex gap-2 mb-4">
        <div className="h-6 w-20 bg-white/[0.05] rounded-full" />
        <div className="h-6 w-24 bg-white/[0.05] rounded-full" />
        <div className="h-6 w-16 bg-white/[0.05] rounded-full" />
      </div>
      <div className="space-y-1.5">
        <div className="h-3 bg-white/[0.04] rounded w-full" />
        <div className="h-3 bg-white/[0.04] rounded w-4/5" />
      </div>
    </div>
  );
}

export function JobCard({ job, linkTo, index = 0 }: JobCardProps) {
  const formatPay = () => {
    if (!job.payRate) return "Pay unlisted";
    return `€${job.payRate} / ${job.payPeriod?.toLowerCase() || "hr"}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
    >
      <Link href={linkTo}>
        <div className="glass-card p-5 h-full flex flex-col cursor-pointer group">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0">
              <h3 className="font-bold text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                {job.title}
              </h3>
              <div className="flex items-center gap-1.5 text-muted-foreground mt-1 text-sm">
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{job.employer?.companyName || "Unknown Company"}</span>
                {job.employer?.isVerified && (
                  <span className="text-primary shrink-0" title="Verified Employer">✓</span>
                )}
              </div>
            </div>
            {job.isFeatured && (
              <span className="shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-500/15 text-violet-400 border border-violet-500/20">
                ⭐ Featured
              </span>
            )}
          </div>

          {/* Meta pills */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs glass text-muted-foreground">
              <MapPin className="w-3 h-3" />
              {job.isRemote ? "Remote" : job.location || "Unlisted"}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs glass text-muted-foreground">
              <Briefcase className="w-3 h-3" />
              {job.jobType.replace("_", " ")}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs glass font-medium text-foreground">
              <Euro className="w-3 h-3" />
              {formatPay()}
            </span>
            {job.hoursPerWeek && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs glass text-muted-foreground">
                <Clock className="w-3 h-3" />
                {job.hoursPerWeek}h/week
              </span>
            )}
          </div>

          {/* Description */}
          <p className="line-clamp-2 text-sm text-muted-foreground flex-1 mb-4">
            {job.description || "No description provided."}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
            <VisaBadge status={job.visaEligibilityStatus} hours={job.hoursPerWeek} />
            <span className="text-xs text-muted-foreground">
              {new Date(job.createdAt).toLocaleDateString("en-IE", { day: "numeric", month: "short" })}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
