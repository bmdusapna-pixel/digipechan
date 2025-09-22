"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Mail, User, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { apiRequest } from "@/common/utils/apiClient";
import { API_ENDPOINTS } from "@/common/constants/apiEndpoints";
import { SITE_MAP } from "@/common/constants/siteMap";
import Link from "next/link";
import { VERIFY_EMAIL } from "@/common/constants/timer";
import { useCooldownTimer } from "@/lib/hooks/useCooldownTimer";
import { useRouter } from "next/navigation";
import { omit } from "@/lib/helpers/data";
import { API_METHODS } from "@/common/constants/apiMethods";

export default function SignUp() {
    const router = useRouter();
    const { startTimer } = useCooldownTimer(VERIFY_EMAIL.TIMER_LOCAL_STORAGE_KEY, VERIFY_EMAIL.TIMER_DURATION);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (formData.password !== formData.confirmPassword) {
                toast.error("Passwords do not match.");
                return;
            }

            const dataToSend = omit(formData, ["confirmPassword"]);

            await apiRequest(API_METHODS.POST, API_ENDPOINTS.sign_up, dataToSend);

            toast.success("Account created successfully! Please verify your email.");
            startTimer();
            router.push(`${SITE_MAP.CHECK_EMAIL}?email=${encodeURIComponent(formData.email)}`);
        } catch (error) {
            console.log("Error in sign up: ", error);
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
                        <CardTitle className="text-card-foreground text-2xl font-bold">Join Pahechan Karo</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Connect vehicle owners seamlessly
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName" className="text-card-foreground">
                                        First Name
                                    </Label>
                                    <div className="relative">
                                        <User className="text-primary/70 absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2 transform" />
                                        <Input
                                            id="firstName"
                                            name="firstName"
                                            type="text"
                                            placeholder="John"
                                            required
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className="bg-background border-[var(--input)] pl-9 focus-visible:ring-[var(--ring)]"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName" className="text-card-foreground">
                                        Last Name
                                    </Label>
                                    <div className="relative">
                                        <User className="text-primary/70 absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2 transform" />
                                        <Input
                                            id="lastName"
                                            name="lastName"
                                            type="text"
                                            placeholder="Doe"
                                            required
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className="bg-background border-[var(--input)] pl-9 focus-visible:ring-[var(--ring)]"
                                        />
                                    </div>
                                </div>
                            </div>
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
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-card-foreground">
                                    Confirm Password
                                </Label>
                                <div className="relative">
                                    <Lock className="text-primary/70 absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2 transform" />
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="bg-background border-[var(--input)] pl-9 focus-visible:ring-[var(--ring)]"
                                    />
                                </div>
                            </div>
                            <motion.div whileHover={{ scale: 1.01 }}>
                                <Button
                                    type="submit"
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 w-full font-medium"
                                    disabled={loading}
                                >
                                    {loading ? "Creating account..." : "Create Account"}
                                </Button>
                            </motion.div>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <p className="text-muted-foreground text-sm">
                            Already have an account?{" "}
                            <Link href={SITE_MAP.LOGIN} className="text-primary font-medium hover:underline">
                                Login
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
                    <p>Scan QR codes to connect with vehicle owners instantly</p>
                </motion.div>
            </motion.div>
        </div>
    );
}
