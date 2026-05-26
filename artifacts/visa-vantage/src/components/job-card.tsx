import { Job, JobDetailVisaEligibilityStatus } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Building2, Clock, MapPin, Euro, Briefcase } from "lucide-react";
import { Link } from "wouter";

interface JobCardProps {
  job: Job & { visaEligibilityStatus?: JobDetailVisaEligibilityStatus };
  linkTo: string;
}

export function VisaBadge({ status, hours }: { status?: JobDetailVisaEligibilityStatus, hours?: number | null }) {
  if (!status) return null;

  if (status === 'ELIGIBLE') {
    return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200">Visa Eligible</Badge>;
  }
  
  if (status === 'CHECK_HOURS') {
    return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200" title={`Max 20hrs/week limit applies. Job asks for ${hours}hrs`}>Verify Hours</Badge>;
  }
  
  if (status === 'NOT_ELIGIBLE') {
    return <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100 border-rose-200">Not Eligible</Badge>;
  }

  return null;
}

export function JobCard({ job, linkTo }: JobCardProps) {
  const formatPay = () => {
    if (!job.payRate) return "Pay unlisted";
    return `€${job.payRate} / ${job.payPeriod?.toLowerCase() || 'hr'}`;
  };

  return (
    <Link href={linkTo}>
      <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h3 className="font-serif font-bold text-lg leading-tight line-clamp-2">{job.title}</h3>
              <div className="flex items-center gap-1.5 text-muted-foreground mt-1.5 text-sm">
                <Building2 className="w-4 h-4" />
                <span className="truncate">{job.employer?.companyName || "Unknown Company"}</span>
              </div>
            </div>
            {job.isFeatured && (
              <Badge variant="secondary" className="shrink-0 bg-indigo-50 text-indigo-700">Featured</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 pb-4">
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span>{job.isRemote ? "Remote" : job.location || "Location unlisted"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Briefcase className="w-4 h-4" />
              <span>{job.jobType.replace('_', ' ')}</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <Euro className="w-4 h-4" />
              <span>{formatPay()}</span>
            </div>
            {job.hoursPerWeek && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{job.hoursPerWeek}h / week</span>
              </div>
            )}
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {job.description || "No description provided."}
          </p>
        </CardContent>
        <CardFooter className="pt-0 border-t mt-auto px-6 py-4 flex items-center justify-between">
          <VisaBadge status={job.visaEligibilityStatus} hours={job.hoursPerWeek} />
          <span className="text-xs text-muted-foreground">
            {new Date(job.createdAt).toLocaleDateString()}
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
