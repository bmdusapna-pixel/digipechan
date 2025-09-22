"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ShieldUser } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/common/utils/apiClient";
import { toast } from "sonner";
import { API_ENDPOINTS } from "@/common/constants/apiEndpoints";
import { useCooldownTimer } from "@/lib/hooks/useCooldownTimer";
import { FORGOT_PASSWORD } from "@/common/constants/timer";
import { API_METHODS } from "@/common/constants/apiMethods";

export default function ForgotPassword() {
    const { remainingTime, startTimer, isTimerActive } = useCooldownTimer(
        FORGOT_PASSWORD.TIMER_LOCAL_STORAGE_KEY,
        FORGOT_PASSWORD.TIMER_DURATION
    );

    const [formData, setFormData] = useState({ email: "" });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.email.trim()) {
            toast.error("Please enter your email.");
            return;
        }

        setLoading(true);

        try {
            await apiRequest(API_METHODS.POST, API_ENDPOINTS.forgot_password, formData);

            toast.success("Password reset link sent to your email!");
            startTimer();
        } catch (error) {
            console.error("Forgot password error:", error);
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
                            <ShieldUser className="text-primary mx-auto h-12 w-12" />
                        </motion.div>
                        <CardTitle className="text-card-foreground text-2xl font-bold">Reset Password</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Enter your email to receive a reset link
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

                            <motion.div whileHover={{ scale: isTimerActive ? 1 : 1.01 }}>
                                <Button
                                    type="submit"
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 w-full font-medium"
                                    disabled={loading || isTimerActive}
                                >
                                    {loading
                                        ? "Sending Link..."
                                        : isTimerActive
                                          ? `Try again in ${remainingTime}s`
                                          : "Send Password Reset Link"}
                                </Button>
                            </motion.div>
                        </form>
                    </CardContent>
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
