"use client";

import { QrCode, MapPinOff, Home } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const NotFound = () => {
    return (
        <div className="bg-background flex min-h-screen items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md text-center"
            >
                {/* QR Code with Strike-through */}
                <motion.div
                    animate={{
                        rotate: [0, 3, -3, 0],
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="mb-8 flex justify-center"
                >
                    <div className="relative">
                        <div className="bg-card ring-border rounded-lg p-3 shadow-lg ring-1">
                            <QrCode className="text-foreground h-24 w-24" />
                        </div>
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.8 }}
                            className="bg-destructive absolute top-1/2 h-1.5 w-full origin-left"
                            style={{ rotate: "45deg" }}
                        />
                    </div>
                </motion.div>

                {/* Heading */}
                <div className="mb-6">
                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mb-4 flex justify-center"
                    >
                        <MapPinOff className="text-primary h-10 w-10" />
                    </motion.div>
                    <h1 className="text-foreground mb-2 text-3xl font-bold">404 - Signal Lost</h1>
                    <p className="text-muted-foreground">Oops! Something went wrong. Please check your route.</p>
                </div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center"
                >
                    <Link href="/" passHref>
                        <Button
                            className="from-primary to-accent text-primary-foreground w-full bg-gradient-to-r shadow-md sm:w-auto"
                            asChild
                        >
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex items-center justify-center gap-2 px-6 py-3"
                            >
                                <Home className="h-5 w-5" />
                                Return Home
                            </motion.div>
                        </Button>
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default NotFound;
