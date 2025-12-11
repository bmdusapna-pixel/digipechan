"use client";
import React from "react";
import Image from "next/image";
import { FaGooglePlay } from "react-icons/fa";

const AppDownloadSection = () => {
  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-16">
      <div className="flex flex-col-reverse lg:flex-row items-center gap-10">
        {/* Text Content */}
        <div className="w-full lg:w-1/2 text-center lg:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Download the <span className="text-blue-600">Digi Pehchan</span> App Now
          </h2>
          <p className="text-gray-700 text-base sm:text-lg mb-2">
            Elevate your communication with Digi Pehchan's QR-based calling solutions.
            Download now for secure, encrypted conversations on the go.
          </p>
          <p className="text-gray-700 text-sm italic mb-6">
            Hope you never meet wrong parking or an accident—but if it happens, Digi Pehchan Tag will assist.
          </p>
          <a
            href="https://play.google.com/store/apps/details?id=com.bmdu.digipehchaan"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-lg shadow transition-all"
          >
            <FaGooglePlay className="text-xl" />
            Get it on Play Store
          </a>
        </div>

        {/* Image Section */}
        <div className="w-full lg:w-1/2 flex justify-center">
          <Image
            src="/imageslider/hc-video.jpg" // fallback in case video thumb is unavailable
            alt="Digi Pehchan App"
            width={500}
            height={400}
            className="rounded-xl shadow-lg"
          />
        </div>
      </div>
    </section>
  );
};

export default AppDownloadSection;
