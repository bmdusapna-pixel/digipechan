import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const FeatureImage = ({ src, alt, delay = 0 }: { src: string; alt: string; delay?: number }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.8 }}
            className="text-center"
        >
            <Image
                src={src}
                alt={alt}
                className="mx-auto h-auto max-w-full rounded-lg shadow-xl transition-transform duration-500 hover:scale-105"
            />
        </motion.div>
    );
};

export default FeatureImage;
