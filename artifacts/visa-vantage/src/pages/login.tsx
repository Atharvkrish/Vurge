import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Zap, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const { setToken } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const loginMutation = useLogin();

  function onSubmit(values: z.infer<typeof loginSchema>) {
    loginMutation.mutate({ data: values }, {
      onSuccess: (data) => {
        setToken(data.token);
        toast({ title: "Welcome back 👋", description: "You're logged into Vurge." });
        if (data.user.role === "ADMIN") setLocation("/admin");
        else setLocation("/dashboard");
      },
      onError: (error) => {
        toast({
          title: "Login failed",
          description: (error as any).data?.error || "Please check your credentials.",
          variant: "destructive",
        });
      },
    });
  }

  return (
    <Layout>
      <div className="flex-1 flex items-center justify-center py-16 px-4 relative overflow-hidden">
        {/* Background glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-[-20%] left-[10%] w-[400px] h-[400px] rounded-full bg-violet-600/10 blur-[100px]" />
          <div className="absolute bottom-[-20%] right-[10%] w-[400px] h-[400px] rounded-full bg-pink-600/8 blur-[80px]" />
        </div>

        <motion.div
          className="relative z-10 w-full max-w-md"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="glass-card p-8">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-12 h-12 rounded-2xl gradient-purple-pink flex items-center justify-center glow-purple mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-extrabold gradient-text">Welcome back</h1>
              <p className="text-muted-foreground mt-2 text-sm text-center">
                Sign in to your Vurge account
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="you@university.ie"
                          className="glass border-white/[0.1] rounded-xl h-11 focus:border-primary/50 bg-transparent"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="glass border-white/[0.1] rounded-xl h-11 focus:border-primary/50 bg-transparent pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full btn-gradient h-12 rounded-xl text-base font-semibold mt-2"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : "Sign in →"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link href="/register" className="font-semibold text-primary hover:underline">
                Sign up free
              </Link>
            </div>

            {/* Demo hint */}
            <div className="mt-6 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-muted-foreground text-center">
              <div className="font-semibold text-foreground mb-1">Demo accounts</div>
              <div>student: <code className="text-primary">maria@student.ie</code> / <code className="text-primary">password123</code></div>
              <div>employer: <code className="text-primary">jobs@techcork.ie</code> / <code className="text-primary">password123</code></div>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
