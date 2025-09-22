"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import FeatureTabs from "@/components/custom-componets/FeatureTabs";
import GetInTouchPopup from "@/components/custom-componets/GetInTouchPopup";
import FloatingWhatsAppButton from "@/components/custom-componets/FloatingActionButtons";
import { FaCar, FaSuitcaseRolling, FaKey, FaMobileAlt, FaLaptop, FaIdCard } from "react-icons/fa";
const HighlightText = ({ text }: { text: string }) => <span className="text-accent">{text}</span>;

const promoMessages = [
    "Free shipping on your first order!",
    "Get 10% off with code: FIND10",
    "Fastest way to recover your lost items.",
    "Trusted by 1000+ happy customers.",
];

const HeroSection = () => {
    const [currentMsg, setCurrentMsg] = useState(0);
    const [showPopup, setShowPopup] = useState(false);
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMsg((prev) => (prev + 1) % promoMessages.length);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            {/* Hero Section */}
            <div className="bg-muted relative flex flex-col items-center px-4 pt-20 text-center">
                {/* Hero Content */}
                <div className="z-10 w-full max-w-2xl">
                    <h1 className="text-4xl leading-tight font-extrabold sm:text-5xl">
                        Welcome To Digi Pehchan Tag
                        <br />
                        <HighlightText text="India's No 1" />
                        <br />
                        Lost & Found Brand
                    </h1>

                    {/* Promo Slider */}
                    <div className="my-4 flex h-8 items-center justify-center overflow-hidden">
                        <span className="text-accent text-base font-semibold transition-all duration-500 sm:text-lg">
                            {promoMessages[currentMsg]}
                        </span>
                    </div>

                    {/* Description and Use Cases */}
                    <div className="mt-4 space-y-6 text-sm font-light text-gray-700 sm:text-base">
                        <p>
                            <strong>Digi Pehchan Tag</strong> is a smart QR tag that helps you instantly recover your
                            lost items. It allows the finder to call you directly — without revealing your number,
                            login, or app download.
                        </p>
                        <p>
                            Just stick Digi Pehchan Tags on anything important and stay worry-free. If you ever lose it,
                            the finder can scan and reach you instantly.
                        </p>

                        {/* Icon List Block */}
                        <div className="mt-6 rounded-2xl border border-gray-200 bg-white/50 p-5 shadow-md">
                            <h4 className="mb-4 text-center text-base font-semibold text-blue-600 sm:text-lg">
                                Use Digi Pehchan Tags On:
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-center text-gray-800 sm:grid-cols-3">
                                <div className="flex flex-col items-center">
                                    <FaCar className="mb-1 text-xl text-blue-500 sm:text-2xl" />
                                    <span className="text-sm sm:text-base">Car & Bike</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <FaSuitcaseRolling className="mb-1 text-xl text-blue-500 sm:text-2xl" />
                                    <span className="text-sm sm:text-base">Travel Luggage</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <FaKey className="mb-1 text-xl text-blue-500 sm:text-2xl" />
                                    <span className="text-sm sm:text-base">Keys & Handbags</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <FaMobileAlt className="mb-1 text-xl text-blue-500 sm:text-2xl" />
                                    <span className="text-sm sm:text-base">Mobile Phone</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <FaLaptop className="mb-1 text-xl text-blue-500 sm:text-2xl" />
                                    <span className="text-sm sm:text-base">Laptop / Backpack</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <FaIdCard className="mb-1 text-xl text-blue-500 sm:text-2xl" />
                                    <span className="text-sm sm:text-base">Passport / ID</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <button
                        onClick={() => setShowPopup(true)}
                        className="mt-8 rounded-full border-2 border-black bg-transparent px-10 py-3 text-lg font-semibold transition-all hover:scale-105 hover:bg-white/10 active:scale-100"
                    >
                        Get In Touch With Us
                    </button>

                    <p className="mt-2 text-sm text-gray-500 italic">
                        We'll try to deliver the answers you're hungry for.
                    </p>

                    <GetInTouchPopup isOpen={showPopup} onClose={() => setShowPopup(false)} />
                </div>

                {/* Hero Image */}
                <div className="relative mt-12 w-full max-w-xs sm:max-w-sm md:max-w-md">
                    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[50px] shadow-xl">
                        <Image
                            src="/pahechankaro-iamge.png"
                            alt="Woman giving a thumbs up while holding a smartphone"
                            className="h-full w-full object-contain"
                            width={1100}
                            height={1200}
                            priority
                        />
                    </div>
                </div>
            </div>

            {/* Feature Tabs Section */}
        <FeatureTabs />
        <FloatingWhatsAppButton />

        </>
    );
};

export default HeroSection;
