import React from "react";
import { HiArrowRightCircle } from "react-icons/hi2";
import Link from "next/link";
import { motion } from "framer-motion";

const CTAButton = ({ href, text }: { href: string; text: string }) => {
    return (
        <Link href={href} passHref>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring flex items-center space-x-2 rounded-lg px-6 py-3 text-lg font-medium shadow-md transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
                <span>{text}</span>
                <HiArrowRightCircle className="text-2xl" />
            </motion.button>
        </Link>
    );
};

export default CTAButton;
