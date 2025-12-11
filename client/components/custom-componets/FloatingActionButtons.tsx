"use client";
import React from "react";
import { FaWhatsapp, FaPhoneAlt } from "react-icons/fa";
import Link from "next/link";

const FloatingActionButtons = () => {
    return (
        <div className="fixed bottom-24 right-5 z-50 flex flex-col items-end gap-3">
            {/* Call Button */}
            <Link href="tel:01169290306">
                <div className="rounded-full bg-blue-500 p-4 shadow-lg transition-all hover:bg-blue-600">
                    <FaPhoneAlt className="text-xl text-white" />
                </div>
            </Link>

            {/* WhatsApp Button with Ripple */}
            <Link
                href="https://wa.me/911169290306?text=Hi%20Digi%20Pehchan%20Team%2C%20I'm%20interested%20in%20your%20tags"
                target="_blank"
                rel="noopener noreferrer"
            >
                <div className="relative flex items-center justify-center">
                    <span className="absolute h-16 w-16 animate-ping rounded-full bg-green-400 opacity-75"></span>
                    <span className="absolute h-10 w-10 animate-ping delay-300 rounded-full bg-green-300 opacity-75"></span>
                    <div className="relative z-10 rounded-full bg-green-500 p-4 shadow-lg transition-all hover:bg-green-600">
                        <FaWhatsapp className="text-2xl text-white" />
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default FloatingActionButtons;
