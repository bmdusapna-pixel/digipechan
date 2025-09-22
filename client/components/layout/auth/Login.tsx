"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Mail, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { apiRequest } from "@/common/utils/apiClient";
import { toast } from "sonner";
import { API_ENDPOINTS } from "@/common/constants/apiEndpoints";
import Link from "next/link";
import { SITE_MAP } from "@/common/constants/siteMap";
import useAuthStore, { User } from "@/store/authStore";
import { API_METHODS } from "@/common/constants/apiMethods";
import { UserRoles } from "@/common/constants/enum";

export default function Login() {
  const { login } = useAuthStore();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"user" | "salesperson">("user"); // NEW

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint =
        mode === "salesperson"
          ? API_ENDPOINTS.salespersonLogin
          : API_ENDPOINTS.login;

      console.log("🔐 LOGIN - Making request to:", endpoint);
      console.log("🔐 LOGIN - Form data:", { email: formData.email, password: "***" });
      
      const loginResponse = await apiRequest<{ token: string }>(
        API_METHODS.POST,
        endpoint,
        formData
      );
      
      console.log("🔐 LOGIN - Response received:", loginResponse);

      if (mode === "salesperson") {
        // Decode token to get user info
        const token = loginResponse?.token;
        console.log("🔐 SALESPERSON LOGIN - Token received:", token ? `${token.substring(0, 20)}...` : 'null');
        
        if (token) {
          try {
            // Decode JWT token to get user data
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log("🔐 SALESPERSON LOGIN - Decoded payload:", payload);
            
            const userData = {
              id: payload.userId,
              name: "Salesperson", // You can add name to the token if needed
              email: formData.email,
              accessToken: token,
              roles: payload.roles || [UserRoles.SALESPERSON],
            };
            
            console.log("🔐 SALESPERSON LOGIN - User data to store:", userData);
            login(userData);
            
            // Verify it was stored
            console.log("🔐 SALESPERSON LOGIN - Stored user:", useAuthStore.getState().user);
            
            toast.success("Salesperson login successful!");
            window.location.href = "/salesman/dashboard";
            return;
          } catch (error) {
            console.error("Token decode error:", error);
            toast.error("Login failed - invalid token");
            return;
          }
        } else {
          console.error("🔐 SALESPERSON LOGIN - No token in response");
          toast.error("Login failed - no token received");
        }
      }

      // Existing flow for Admin/User
      const profileResponse = await apiRequest<{ userData: User }>(
        "GET",
        API_ENDPOINTS.profile,
        {},
        {},
        { Authorization: `Bearer ${loginResponse?.token ?? ""}` }
      );

      if (profileResponse) {
        login({
          ...profileResponse.userData,
          accessToken: loginResponse?.token,
        });
        toast.success("Login successful!");
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="from-muted/30 to-muted/10 flex min-h-screen items-center justify-center bg-gradient-to-br p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="bg-card border-[var(--border)] shadow-lg">
          <CardHeader className="text-center">
            <motion.div whileHover={{ scale: 1.05 }} className="mx-auto mb-4">
              <Car className="text-primary mx-auto h-12 w-12" />
            </motion.div>
            <CardTitle className="text-card-foreground text-2xl font-bold">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Connect with vehicle owners in seconds
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-card-foreground">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="text-primary/70 absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2 transform" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-background border-[var(--input)] pl-9 focus-visible:ring-[var(--ring)]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-card-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="text-primary/70 absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2 transform" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="bg-background border-[var(--input)] pl-9 focus-visible:ring-[var(--ring)]"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Link
                  href="/auth/forgot-password"
                  className="text-primary text-sm font-medium hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={mode === "user" ? "default" : "outline"}
                  onClick={() => setMode("user")}
                >
                  Admin/User
                </Button>
                <Button
                  type="button"
                  variant={mode === "salesperson" ? "default" : "outline"}
                  onClick={() => setMode("salesperson")}
                >
                  Salesperson
                </Button>
              </div>
              <motion.div whileHover={{ scale: 1.01 }}>
                <Button
                  type="submit"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 w-full font-medium"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </motion.div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-muted-foreground text-sm">
              {"Don't have an account? "}
              <Link
                href={SITE_MAP.SIGN_UP}
                className="text-primary font-medium hover:underline"
              >
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
        <motion.div
          className="text-muted-foreground mt-6 text-center text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p>Scan vehicle QR codes to resolve parking issues instantly</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
