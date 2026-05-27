import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <Layout>
      <div className="flex-1 flex items-center justify-center py-20 px-4 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-[10%] left-[15%] w-[400px] h-[400px] rounded-full bg-violet-600/8 blur-[100px]" />
          <div className="absolute bottom-[10%] right-[15%] w-[300px] h-[300px] rounded-full bg-pink-600/6 blur-[80px]" />
        </div>

        <motion.div
          className="relative z-10 text-center max-w-md"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="text-9xl font-extrabold gradient-text mb-2 select-none"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            404
          </motion.div>

          <div className="glass-card p-8 mt-4">
            <div className="text-5xl mb-4">🔍</div>
            <h1 className="text-2xl font-extrabold mb-3">Page not found</h1>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              This page wandered off looking for a job. Let's get you back on track.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button className="btn-gradient rounded-xl font-semibold" asChild>
                <Link href="/">← Back to Home</Link>
              </Button>
              <Button variant="outline" className="glass border-white/[0.1] rounded-xl font-semibold" asChild>
                <Link href="/jobs">Browse Jobs</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
