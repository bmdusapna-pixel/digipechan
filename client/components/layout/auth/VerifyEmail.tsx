"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { apiRequest } from "@/common/utils/apiClient";
import { API_ENDPOINTS } from "@/common/constants/apiEndpoints";
import { API_METHODS } from "@/common/constants/apiMethods";

export default function VerifyEmail() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [loading, setLoading] = useState(true);
    const [verified, setVerified] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const verify = async () => {
            if (!token) {
                setError("Invalid or missing token.");
                setLoading(false);
                return;
            }

            try {
                await apiRequest(API_METHODS.GET, `${API_ENDPOINTS.verify_email}?token=${token}`);
                setVerified(true);
                toast.success("Email verified successfully.");
            } catch (err) {
                console.error(err);
                setError("Something went wrong during verification.");
            } finally {
                setLoading(false);
            }
        };

        verify();
    }, [token]);

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
                            {verified ? (
                                <CheckCircle className="h-12 w-12 text-[var(--chart-2)]" />
                            ) : (
                                <Mail className="text-primary h-12 w-12 animate-pulse" />
                            )}
                        </motion.div>
                        <CardTitle className="text-card-foreground text-2xl font-bold">
                            {loading ? "Verifying..." : verified ? "Email Verified" : "Verification Failed"}
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                            {loading
                                ? "Please wait while we verify your email."
                                : verified
                                  ? "Your email has been successfully verified."
                                  : error}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {verified && (
                            <motion.div whileHover={{ scale: 1.01 }}>
                                <Button
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 w-full font-medium"
                                    onClick={() => router.push("/auth/login")}
                                >
                                    Go to Login
                                </Button>
                            </motion.div>
                        )}
                        {!loading && !verified && (
                            <motion.div whileHover={{ scale: 1.01 }}>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => router.push("/auth/check-email")}
                                >
                                    Resend Verification Email
                                </Button>
                            </motion.div>
                        )}
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
