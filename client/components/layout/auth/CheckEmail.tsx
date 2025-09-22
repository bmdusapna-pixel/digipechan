"use client";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCooldownTimer } from "@/lib/hooks/useCooldownTimer";
import { VERIFY_EMAIL } from "@/common/constants/timer";
import { apiRequest } from "@/common/utils/apiClient";
import { API_ENDPOINTS } from "@/common/constants/apiEndpoints";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { API_METHODS } from "@/common/constants/apiMethods";

export default function CheckEmail() {
    const searchParams = useSearchParams();
    const email = searchParams.get("email");

    const { remainingTime, startTimer, isTimerActive } = useCooldownTimer(
        VERIFY_EMAIL.TIMER_LOCAL_STORAGE_KEY,
        VERIFY_EMAIL.TIMER_DURATION
    );

    const [isResending, setIsResending] = useState(false);

    const handleResendEmail = async () => {
        setIsResending(true);
        if (!isTimerActive && email) {
            try {
                await apiRequest(API_METHODS.POST, API_ENDPOINTS.resend_verification, {
                    email,
                });
                toast.success("Verification email resent successfully.");
                startTimer();
            } catch (error) {
                console.error("Error resending email:", error);
            }
        }
        setIsResending(false);
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
                            <Mail className="text-primary mx-auto h-12 w-12" />
                        </motion.div>
                        <CardTitle className="text-card-foreground text-2xl font-bold">Check Your Inbox</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Verify your email to complete the registration process.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <motion.div whileHover={{ scale: 1.01 }}>
                            <Button
                                type="button"
                                className="bg-primary text-primary-foreground hover:bg-primary/90 w-full font-medium"
                                disabled={isTimerActive || isResending}
                                onClick={handleResendEmail}
                            >
                                Resend link {remainingTime > 0 ? `(${remainingTime}s)` : ""}
                            </Button>
                        </motion.div>
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
