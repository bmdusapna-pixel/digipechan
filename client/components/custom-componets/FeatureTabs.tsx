"use client";
import React, { useState } from "react";
import {
  FaPhoneAlt,
  FaWhatsapp,
  FaFilePdf,
  FaVideo,
  FaUndo,
  FaMapMarkerAlt,
  FaSms,
  FaHeadset,
  FaDog,
  FaCar,
  FaMotorcycle,
} from "react-icons/fa";
import type { JSX } from "react";

// Define type for keys
type TagType = "Car Tag" | "Bike Tag" | "Pet Tag";

const tabData: Record<TagType, {
  heading: string;
  subheading: string;
  features: { icon: JSX.Element; label: string }[];
}> = {
  "Car Tag": {
    heading: "Smart Car Tag",
    subheading: "Get instantly contacted if your parked car is blocking someone or needs attention.",
    features: [
      { icon: <FaPhoneAlt />, label: "Masked Calls" },
      { icon: <FaWhatsapp />, label: "WhatsApp Notifications" },
      { icon: <FaFilePdf />, label: "PDF eTag Support" },
      { icon: <FaVideo />, label: "Video Call Alerts" },
      { icon: <FaUndo />, label: "Call Back Feature" },
      { icon: <FaMapMarkerAlt />, label: "Live Location Sharing" },
      { icon: <FaSms />, label: "Offline SMS Alerts" },
      { icon: <FaCar />, label: "Vehicle Info Tag" },
    ],
  },
  "Bike Tag": {
    heading: "Smart Bike Tag",
    subheading: "Perfect for two-wheelers, compact yet fully functional.",
    features: [
      { icon: <FaWhatsapp />, label: "Instant WhatsApp Alerts" },
      { icon: <FaPhoneAlt />, label: "Masked Audio Calls" },
      { icon: <FaMapMarkerAlt />, label: "GPS Enabled" },
      { icon: <FaMotorcycle />, label: "Compact QR Fit" },
      { icon: <FaSms />, label: "SMS Notifications" },
    ],
  },
  "Pet Tag": {
    heading: "Smart Pet Tag",
    subheading: "Lost pet? Get contacted instantly when someone finds them.",
    features: [
      { icon: <FaDog />, label: "Lost & Found Contact" },
      { icon: <FaMapMarkerAlt />, label: "Last Seen Location" },
      { icon: <FaWhatsapp />, label: "WhatsApp Contact" },
      { icon: <FaHeadset />, label: "Live Owner Support" },
      { icon: <FaSms />, label: "Offline SMS Contact" },
    ],
  },
};

const FeatureTabs = () => {
  const [activeTab, setActiveTab] = useState<TagType>("Car Tag");

  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-16">
      {/* Tabs */}
      <div className="flex justify-center border-b border-gray-300 mb-6">
        {Object.keys(tabData).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as TagType)}
            className={`px-4 sm:px-6 py-2 text-sm sm:text-base font-semibold transition-all border-b-2 ${
              activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-blue-500"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Heading */}
      <div className="text-center mb-8">
        <h2 className="text-xl sm:text-2xl font-bold">{tabData[activeTab].heading}</h2>
        <p className="text-gray-600 text-sm sm:text-base">
          {tabData[activeTab].subheading}
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 sm:gap-6 text-center mb-10">
        {tabData[activeTab].features.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-xs sm:text-sm text-gray-800"
          >
            <div className="text-2xl sm:text-3xl text-primary bg-gray-100 p-3 rounded-full mb-2 shadow">
              {item.icon}
            </div>
            <span className="text-center">{item.label}</span>
          </div>
        ))}
      </div>

      {/* WhatsApp CTA */}
      <div className="text-center">
        <a
          href="https://wa.me/?text=Check%20out%20these%20smart%20QR%20tags!%20https://yourwebsite.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-full sm:w-auto max-w-xs sm:max-w-md gap-2 px-6 sm:px-10 py-3 sm:py-4 text-sm sm:text-base font-semibold text-white bg-green-500 hover:bg-green-600 rounded-xl shadow-md transition-all"
        >
          <FaWhatsapp className="text-lg sm:text-xl" />
          Share us on WhatsApp
        </a>
      </div>
    </section>
  );
};

export default FeatureTabs;
