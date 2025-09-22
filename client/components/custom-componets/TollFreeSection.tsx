"use client";
import React from "react";
import { FaPhoneAlt, FaWhatsapp} from "react-icons/fa";

const TollFreeSection = () => {
  return (
    <section className="py-10 bg-background border-t border-border">
      <div className="max-w-3xl mx-auto text-center px-4">
        <div className="flex flex-col items-center gap-3">
          <FaPhoneAlt className="text-primary text-4xl" />
          <h3 className="text-xl sm:text-2xl font-semibold">
            Toll Free Enquiry Helpline:
          </h3>
          <p className="text-2xl sm:text-3xl font-bold text-blue-600">
            01169290306
          </p>
          <p className="text-base sm:text-lg font-medium text-muted-foreground">
            9:00 AM – 6:00 PM
          </p>
          <p className="text-sm text-gray-500 italic">
            (Except Sundays & Gazetted Holidays)
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mt-6 justify-center">
            {/* Call Button */}
            <a
              href="tel:01169290306"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow transition"
            >
              <FaPhoneAlt />
              Call Now
            </a>

            {/* WhatsApp Button */}
            <a
              href="https://wa.me/911169290306"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-lg shadow transition"
            >
              <FaWhatsapp />
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TollFreeSection;
