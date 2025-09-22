import { MailIcon } from "lucide-react";
import React from "react";
import {
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaInstagram,
  FaFacebook,
  FaLinkedin,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="from-muted/30 to-muted/10 mb-20 border-t border-[var(--border)] bg-gradient-to-br">
      <div className="text-foreground mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10 grid grid-cols-1 gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-primary mb-2 text-3xl font-bold">
              Digi Pehchan
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed">
              Connect with vehicle owners in seconds. Reliable, fast, and secure
              identification at your fingertips.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 text-sm sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <MailIcon className="text-primary mt-1" />
              <div>
                <p className="text-foreground font-semibold">Email Us</p>
                <a
                  href="mailto:info@digipehchan.in"
                  className="text-muted-foreground hover:text-accent text-sm transition-colors"
                >
                  info@digipehchan.in
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FaPhoneAlt className="text-primary mt-1 h-4 w-4" />
              <div>
                <p className="text-foreground font-semibold">Call Us</p>
                <a
                  href="tel:01169290306"
                  className="text-muted-foreground hover:text-accent text-sm transition-colors"
                >
                  011 6929 0306
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FaMapMarkerAlt className="text-primary mt-1 h-8 w-16" />
              <div>
                <p className="text-foreground font-semibold">Visit Us</p>
                <p className="text-muted-foreground text-sm">
                  DigiPehchan, Near Bus Stand, Canara Bank, Shikohabad,
                  Firozabad, Uttar Pradesh, 205135
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex justify-center space-x-6">
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-accent transition-colors"
          >
            <FaInstagram size={28} />
          </a>
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-accent transition-colors"
          >
            <FaFacebook size={28} />
          </a>
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-accent transition-colors"
          >
            <FaLinkedin size={28} />
          </a>
        </div>

        <div className="text-muted-foreground border-t border-[var(--border)] pt-1 mb-32 text-center text-sm px-4">
          <p className="max-w-4xl mx-auto leading-relaxed">
            All Rights Reserved ®️ Patented ©️ 2025,{" "}
            <span className="text-foreground/80 font-medium">Digi Pehchan</span>{" "}
            — proudly made in Bharat (India) 
            <br/>
            <span className="text-black">Powered by Shiv group</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
