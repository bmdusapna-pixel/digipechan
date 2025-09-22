import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Navbar from "@/components/custom-componets/Navbar";
import Footer from "@/components/custom-componets/Footer";
import { Suspense } from "react";
import MobileBottomNavigation from "@/components/custom-componets/MobileNavigation";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/common/utils/queryClient";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});
const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Digi Pehchan",
    description: "A app to find QR-based vehicle contact system.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <link rel="icon" className="rounded-full" href="/logo.jpg" sizes="any" />
            </head>
            <body className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}>
                <Suspense>
                    <Toaster richColors position="top-center" />
                    <Navbar />
                    <QueryClientProvider client={queryClient}>
                        <div className="pt-12">{children}</div>
                    </QueryClientProvider>
                    <Footer />
                    <MobileBottomNavigation />
                </Suspense>
            </body>
        </html>
    );
}
