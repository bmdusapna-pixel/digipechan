"use client";

import HeroSection from "@/components/custom-componets/Hero";
import HowItWorks from "@/components/custom-componets/HowItWorks";
import WhyChooseUs from "@/components/custom-componets/why-choose-us/WhyChooseUs";

export default function Home() {
    return (
        <>
            <HeroSection />
            <HowItWorks />
            <WhyChooseUs />
        </>
    );
}
