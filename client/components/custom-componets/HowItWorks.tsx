"use client";
import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FaQrcode, FaTags, FaSearch, FaSmile, FaArrowRight, FaWhatsapp } from "react-icons/fa";
import ImageSlider from "@/components/custom-componets/ImageSlider";
import FranchiseSection from "@/components/custom-componets/FranchiseSection";
import AppDownloadSection from "@/components/custom-componets/AppDownloadSection";
import RechargeSection from "@/components/custom-componets/RechargeSection";
import LocationSection from "@/components/custom-componets/LocationSection";


const steps = [
  {
    title: "Generate QR Code",
    description: "Sign up and generate a unique QR code for your valuable items.",
    icon: <FaQrcode className="text-4xl sm:text-5xl" />,
    color: "from-[var(--chart-4)] to-[var(--primary)]",
  },
  {
    title: "Attach the QR",
    description: "Print and stick the QR securely on your item.",
    icon: <FaTags className="text-4xl sm:text-5xl" />,
    color: "from-[var(--chart-1)] to-[var(--chart-2)]",
  },
  {
    title: "Finder Scans",
    description: "Anyone who finds your item can scan the QR instantly.",
    icon: <FaSearch className="text-4xl sm:text-5xl" />,
    color: "from-[var(--chart-2)] to-[var(--chart-3)]",
  },
  {
    title: "You Get Notified",
    description: "You'll get notified with the finder's message or location.",
    icon: <FaSmile className="text-4xl sm:text-5xl" />,
    color: "from-[var(--chart-3)] to-[var(--accent)]",
  },
];

const HowItWorks = () => {
  const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], [0, -200]);

  return (
    <section className="from-muted/50 to-background relative overflow-hidden bg-gradient-to-b py-24 sm:py-32">
      {/* Floating icons */}
      <motion.div style={{ y }} className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: Math.random() * 2000 - 1000,
              y: Math.random() * 2000 - 1000,
              rotate: Math.random() * 360,
              opacity: Math.random() * 0.1 + 0.02,
            }}
            animate={{
              x: Math.random() * 2000 - 1000,
              y: Math.random() * 2000 - 1000,
              transition: {
                duration: 40 + Math.random() * 40,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "linear",
              },
            }}
            className="text-primary/5 absolute"
            style={{ fontSize: `${Math.random() * 30 + 20}px` }}
          >
            <FaQrcode />
          </motion.div>
        ))}
      </motion.div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        {/* <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16 sm:mb-24 text-center"
        >
          <motion.span
            className="text-primary-foreground mb-4 sm:mb-6 inline-block rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] px-4 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-xl backdrop-blur-sm"
            initial={{ scale: 0.8 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Simple Process
          </motion.span>
          <motion.h2
            className="mb-4 sm:mb-6 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-3xl sm:text-5xl font-bold text-transparent"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            How It Works
          </motion.h2>
          <motion.p
            className="text-muted-foreground mx-auto max-w-xl text-sm sm:text-lg"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Recover your lost items in just four simple steps.
          </motion.p>
        </motion.div> */}

        {/* Steps */}
        {/* <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.15, type: "spring" }}
              viewport={{ once: true, margin: "-100px" }}
              className="group relative"
            >
              <div
                className={`absolute -inset-1 rounded-2xl bg-gradient-to-br ${step.color} opacity-0 blur-lg transition-all duration-500 group-hover:opacity-100`}
              />
              <div
                className={`relative h-full bg-gradient-to-br ${step.color} rounded-2xl p-[1.5px] backdrop-blur-sm`}
              >
                <div className="bg-card/90 flex h-full flex-col items-center rounded-2xl border border-[var(--border)]/20 p-4 sm:p-6 text-center backdrop-blur-md">
                  <div
                    className={`mb-4 sm:mb-6 bg-gradient-to-br ${step.color} text-primary-foreground rounded-2xl p-4 sm:p-5 shadow-lg`}
                  >
                    {step.icon}
                  </div>
                  <h3 className="text-card-foreground mb-3 text-lg sm:text-xl font-bold">{step.title}</h3>
                  <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">
                    {step.description}
                  </p>
                  <div className="mt-auto">
                    <span className="text-foreground inline-flex items-center text-sm sm:text-base font-semibold transition-transform group-hover:translate-x-2">
                      Step {index + 1}
                      <FaArrowRight className="ml-2 opacity-0 transition-opacity group-hover:opacity-100" />
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div> */}

        {/* CTA Button */}
        {/* <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 sm:mt-24 text-center"
        >
          <button className="text-primary-foreground rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] px-6 sm:px-10 py-3 sm:py-5 text-sm sm:text-base font-medium shadow-xl backdrop-blur-sm transition-all hover:scale-105 hover:shadow-2xl">
            Get Started Now
          </button>
              </motion.div> */}
{/* <motion.div
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
  transition={{ duration: 0.6, delay: 1 }}
  viewport={{ once: true }}
  className="mt-6 text-center"
>
  <a
    href="https://wa.me/?text=Check%20out%20this%20awesome%20QR-based%20lost%20%26%20found%20platform!%20https://yourwebsite.com"
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex w-full sm:w-auto max-w-xs sm:max-w-md items-center justify-center gap-2 rounded-xl bg-green-500 px-6 sm:px-10 py-4 text-sm sm:text-lg font-semibold text-white shadow-lg backdrop-blur-sm transition-all hover:scale-105 hover:bg-green-600"
  >
    <FaWhatsapp className="text-2xl" />
    Share us on WhatsApp
  </a>
    </motion.div> */}
        <ImageSlider />
        {/* <RechargeSection /> */}
        {/* <LocationSection /> */}
        <FranchiseSection />
        <AppDownloadSection />
      </div>
    </section>
  );
};

export default HowItWorks;
