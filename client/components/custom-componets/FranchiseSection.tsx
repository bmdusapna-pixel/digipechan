"use client";
import React from "react";
import {
  FaPhoneAlt,
  FaWhatsapp,
  FaFilePdf,
  FaVideo,
  FaUndo,
  FaMapMarkerAlt,
  FaSms,
  FaHeadset,
  FaCheck,
} from "react-icons/fa";

const franchiseFeatures = [
  { icon: <FaPhoneAlt />, label: "Masked Audio Calls" },
  { icon: <FaWhatsapp />, label: "WhatsApp Notifications" },
  { icon: <FaFilePdf />, label: "PDF eTag (Offline also)" },
  { icon: <FaVideo />, label: "Masked Video Calls" },
  { icon: <FaUndo />, label: "Call Back Caller." },
  { icon: <FaMapMarkerAlt />, label: "Check Location" },
  { icon: <FaSms />, label: "Offline SMS Available" },
  { icon: <FaHeadset />, label: "Live Support Always" },
];

const franchiseBenefits = [
  "Pamphlets, Brochure, Standee, Sales Pitch, Videos And Pictures.",
  "All Paper Works For Required For Selling DigiPehchan Parking Tags.",
  "Dedicated Manager",
  "Exclusive Rights In Your City*.",
  "Upto 50% Of Your Field Sales Person*."
];

const FranchiseSection = () => {
  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-16">
      {/* Heading */}
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold">
          Make <span className="text-blue-600 font-bold">6L / Month</span> Selling DigiPehchan Tags.
        </h2>
        <p className="text-gray-600 text-sm sm:text-base mt-2">
          We will get you Orders, Marketing materials, Setup your social media and more. <br />
          You can order DigiPehchan Tag franchise on COD.
        </p>
      </div>

      {/* Start Franchise CTA */}
      <div className="flex justify-center mb-8">
        <button className="bg-blue-400 hover:bg-yellow-500 text-black font-semibold px-8 py-3 rounded-lg shadow transition-all">
          Start Franchise
        </button>
      </div>

      {/* Features Grid */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Services</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 text-center">
          {franchiseFeatures.map((item, index) => (
            <div key={index} className="flex flex-col items-center text-sm text-gray-800">
              <div className="text-2xl sm:text-3xl bg-gray-100 p-3 rounded-full mb-2 shadow">
                {item.icon}
              </div>
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        {/* CTA to Buy Pack */}
        <div className="mt-6 text-center">
          <button className="border border-black text-black font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition">
            Buy 200 Pack Now, COD Avail
          </button>
        </div>
      </div>

      {/* Promise List */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Our Support and Promise</h3>
        <ul className="space-y-2 text-sm sm:text-base text-gray-700">
          {franchiseBenefits.map((text, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <FaCheck className="mt-1 text-green-600" />
              {text}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default FranchiseSection;
