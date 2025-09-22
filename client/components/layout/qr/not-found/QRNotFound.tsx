"use client";

import { QrCode, Smartphone, Video, Car, Search, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const NotFound = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="from-muted/20 to-background flex min-h-screen flex-col items-center justify-center bg-gradient-to-br p-6 text-center"
        >
            <div className="w-full max-w-2xl">
                <motion.div
                    animate={{
                        scale: [1, 1.05, 1],
                        boxShadow: [
                            "0 0 0 0px hsla(var(--primary-hsl), 0.2)",
                            "0 0 0 10px hsla(var(--primary-hsl), 0)",
                            "0 0 0 0px hsla(var(--primary-hsl), 0)",
                        ],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="bg-card relative mx-auto mb-8 flex h-48 w-48 items-center justify-center rounded-xl p-4 shadow-2xl"
                >
                    <QrCode className="text-muted-foreground/50 h-32 w-32" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                            className="bg-primary h-1 w-full"
                            animate={{ y: [-60, 60] }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                repeatType: "reverse",
                            }}
                        />
                    </div>
                    <AlertTriangle className="text-primary absolute top-2 right-2 h-6 w-6" />
                </motion.div>

                <h1 className="text-foreground mb-4 text-4xl font-bold sm:text-5xl">Connection Not Found</h1>

                <p className="text-muted-foreground mb-8 text-lg">
                    {"We couldn't locate this QR tag. It might be unregistered, damaged, or no longer active."}
                </p>

                <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <motion.div whileHover={{ y: -5 }} className="bg-card rounded-xl p-4 shadow-md">
                        <Car className="text-primary mx-auto mb-2 h-8 w-8" />
                        <h3 className="text-card-foreground font-medium">Check Vehicle</h3>
                        <p className="text-muted-foreground text-sm">Ensure the QR tag is properly attached</p>
                    </motion.div>

                    <motion.div whileHover={{ y: -5 }} className="bg-card rounded-xl p-4 shadow-md">
                        <Smartphone className="text-primary mx-auto mb-2 h-8 w-8" />
                        <h3 className="text-card-foreground font-medium">Scan Again</h3>
                        <p className="text-muted-foreground text-sm">Try scanning from different angles</p>
                    </motion.div>

                    <motion.div whileHover={{ y: -5 }} className="bg-card rounded-xl p-4 shadow-md">
                        <Video className="text-primary mx-auto mb-2 h-8 w-8" />
                        <h3 className="text-card-foreground font-medium">Manual Connect</h3>
                        <p className="text-muted-foreground text-sm">Contact support for assistance</p>
                    </motion.div>
                </div>

                <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                    <Link href="/scan" passHref>
                        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg" asChild>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 rounded-full px-6 py-3"
                            >
                                <Search className="h-5 w-5" />
                                Try Another Scan
                            </motion.div>
                        </Button>
                    </Link>

                    <Link href="/dashboard" passHref>
                        <Button variant="outline" className="bg-card text-primary hover:bg-muted shadow-lg" asChild>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 rounded-full px-6 py-3"
                            >
                                Back to Dashboard
                            </motion.div>
                        </Button>
                    </Link>
                </div>

                <p className="text-muted-foreground mt-8 text-sm">
                    Need help? Contact our{" "}
                    <Link href="/support" className="text-primary hover:underline">
                        support team
                    </Link>
                    .
                </p>
            </div>
        </motion.div>
    );
};

export default NotFound;
