"use client";
import React, { useState } from "react";
import Image from "next/image";
import TabContent from "./WhyChooseUsTabContent";
import { motion } from "framer-motion";
import TollFreeSection from "@/components/custom-componets/TollFreeSection";

const tabs = [
    {
        title: "No App Required",
        image: "/why-choose-us/app-free.jpg",
        description: "Anyone can scan the QR tag using their phone’s camera—no app download needed.",
    },
    {
        title: "Privacy-First",
        image: "/why-choose-us/why-privacy.jpg",
        description: "You stay in control of your data. No public sharing, no unnecessary access.",
    },
    {
        title: "Instant Alerts",
        image: "/why-choose-us/why-alerts.jpg",
        description: "Get real-time alerts via email or SMS the moment your lost item is scanned.",
    },
    {
        title: "Affordable Tags",
        image: "/why-choose-us/money.jpg",
        description: "Starting at just ₹X, our QR tags offer peace of mind without breaking the bank.",
    },
];

const WhyChooseUs = () => {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <section className="bg-muted py-12">
            <div className="mx-auto flex max-w-7xl flex-col items-center gap-10 px-4 sm:px-6 lg:flex-row lg:px-8">
                <div className="flex w-full justify-center lg:w-1/2">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="relative h-[400px] w-full max-w-[500px]"
                    >
                        <Image
                            src={tabs[activeTab].image}
                            alt={tabs[activeTab].title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 500px"
                            className="rounded-lg object-contain shadow-lg"
                        />
                    </motion.div>
                </div>

                <div className="w-full lg:w-1/2">
                    <motion.h2
                        className="mb-8 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text py-2 text-left text-4xl font-bold text-transparent md:text-5xl"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        viewport={{ once: true }}
                    >
                        Why choose Us?
                    </motion.h2>

                    <div className="mb-8 space-y-3">
                        {tabs.map((tab, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveTab(index)}
                                className={`w-full rounded-lg border px-4 py-3 text-left text-base font-medium transition duration-200 ${
                                    activeTab === index
                                        ? "bg-primary/10 text-primary border-[var(--primary)]"
                                        : "bg-card text-card-foreground hover:bg-muted/50 border-[var(--border)]"
                                }`}
                            >
                                {tab.title}
                            </button>
                        ))}
                    </div>
                    <TabContent description={tabs[activeTab].description} />
                </div>
                <TollFreeSection />
            </div>
        </section>
    );
};

export default WhyChooseUs;
