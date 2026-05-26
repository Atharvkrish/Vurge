import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Home() {
  return (
    <Layout>
      <section className="py-24 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Your career, compliant.
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
            The trusted marketplace connecting international students with part-time jobs and micro-internships in Ireland and the UK.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg" asChild>
              <Link href="/jobs">Find a Job</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg border-primary-foreground/20 hover:bg-primary-foreground/10" asChild>
              <Link href="/register">Hire Students</Link>
            </Button>
          </div>
        </div>
      </section>
      
      <section className="py-24 px-4 container mx-auto">
        <div className="grid md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="h-12 w-12 bg-primary/10 text-primary flex items-center justify-center rounded-xl font-bold text-xl">1</div>
            <h3 className="text-xl font-bold">Visa-Smart Matching</h3>
            <p className="text-muted-foreground leading-relaxed">
              Our system automatically filters jobs based on your visa type and working hour restrictions. Never worry about compliance again.
            </p>
          </div>
          <div className="space-y-4">
            <div className="h-12 w-12 bg-primary/10 text-primary flex items-center justify-center rounded-xl font-bold text-xl">2</div>
            <h3 className="text-xl font-bold">Verified Employers</h3>
            <p className="text-muted-foreground leading-relaxed">
              Every employer on VisaVantage is vetted for trust and reliability, ensuring you only work with companies that respect international talent.
            </p>
          </div>
          <div className="space-y-4">
            <div className="h-12 w-12 bg-primary/10 text-primary flex items-center justify-center rounded-xl font-bold text-xl">3</div>
            <h3 className="text-xl font-bold">Micro-Internships</h3>
            <p className="text-muted-foreground leading-relaxed">
              Build your CV with short-term, paid projects that fit around your studies and comply with your visa conditions.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
