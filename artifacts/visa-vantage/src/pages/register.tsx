import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Zap, GraduationCap, Building2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  role: z.enum(["STUDENT", "EMPLOYER"], { required_error: "Please select a role" }),
});

export default function Register() {
  const [, setLocation] = useLocation();
  const { setToken } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", role: "STUDENT" },
  });

  const selectedRole = form.watch("role");
  const registerMutation = useRegister();

  function onSubmit(values: z.infer<typeof registerSchema>) {
    registerMutation.mutate({ data: values }, {
      onSuccess: (data) => {
        setToken(data.token);
        toast({ title: "Welcome to Vurge! 🚀", description: "Your account has been created." });
        setLocation("/dashboard");
      },
      onError: (error) => {
        toast({
          title: "Registration failed",
          description: (error as any).data?.error || "An error occurred during registration.",
          variant: "destructive",
        });
      },
    });
  }

  return (
    <Layout>
      <div className="flex-1 flex items-center justify-center py-16 px-4 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-[-20%] right-[10%] w-[400px] h-[400px] rounded-full bg-violet-600/10 blur-[100px]" />
          <div className="absolute bottom-[-20%] left-[10%] w-[400px] h-[400px] rounded-full bg-pink-600/8 blur-[80px]" />
        </div>

        <motion.div
          className="relative z-10 w-full max-w-lg"
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
              <h1 className="text-3xl font-extrabold gradient-text">Join Vurge</h1>
              <p className="text-muted-foreground mt-2 text-sm text-center">
                Find visa-compliant work or hire international talent
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {/* Role selection */}
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">I am a...</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { value: "STUDENT", label: "Student", sub: "Looking for work", icon: GraduationCap },
                            { value: "EMPLOYER", label: "Employer", sub: "Hiring talent", icon: Building2 },
                          ].map(({ value, label, sub, icon: Icon }) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => field.onChange(value)}
                              className={`relative p-4 rounded-xl border text-left transition-all ${
                                field.value === value
                                  ? "gradient-border bg-primary/5 border-primary/30"
                                  : "glass border-white/[0.08] hover:border-white/[0.15]"
                              }`}
                            >
                              {field.value === value && (
                                <div className="absolute top-2 right-2 w-4 h-4 rounded-full gradient-purple-pink flex items-center justify-center">
                                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                </div>
                              )}
                              <Icon className={`w-5 h-5 mb-2 ${field.value === value ? "text-primary" : "text-muted-foreground"}`} />
                              <div className="font-semibold text-sm">{label}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
                            </button>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">
                        {selectedRole === "EMPLOYER" ? "Company Name" : "Full Name"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={selectedRole === "EMPLOYER" ? "Acme Ltd." : "Jane Smith"}
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="you@example.com"
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
                            placeholder="8+ characters"
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
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account...
                    </span>
                  ) : "Create account →"}
                </Button>
              </form>
            </Form>

            <p className="text-xs text-muted-foreground text-center mt-5">
              By signing up, you agree to our Terms of Service and Privacy Policy.
            </p>

            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
