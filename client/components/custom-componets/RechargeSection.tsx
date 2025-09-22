'use client';
import React, {useState} from 'react';
import {motion} from 'framer-motion';
import {FaMobileAlt} from 'react-icons/fa';

// Define the network companies
const networks = [
    {
        name: 'Airtel',
        image: 'https://s3-ap-southeast-1.amazonaws.com/bsy/iportal/images/airtel-logo-white-text-horizontal.jpg',
        redirectUrl: 'https://paytm.com/recharge?operator=airtel'
    },
    {
        name: 'Jio',
        image: 'https://www.bing.com/th/id/OIP.JyolkdfhdKhwe-JwYsIWpAHaEK?w=197&h=106&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2',
        redirectUrl: 'https://paytm.com/recharge?operator=jio'
    },
    {
        name: 'Vodafone Idea (VI)',
        image: 'https://images.livemint.com/img/2020/09/07/600x338/Logo_Color_1599462534815_1599462543241.png',
        redirectUrl: 'https://paytm.com/recharge?operator=vi'
    },
    {
        name: 'BSNL',
        image: 'https://images.indianexpress.com/2024/10/bsnl-new-logo.jpg',
        redirectUrl: 'https://paytm.com/recharge?operator=bsnl'
    }
];

const RechargeSection = () => {
    const [showOptions, setShowOptions] = useState(false);

    const handleCardClick = (url: string) => {
        window.location.href = url;
    };

    return (
        <div className="mt-8 sm:mt-12 mx-auto max-w-5xl px-4">
            {/* Recharge Now Box */}
            <motion.div
                initial={{opacity: 0, y: 20}}
                whileInView={{opacity: 1, y: 0}}
                transition={{duration: 0.6}}
                viewport={{once: true}}
                className="cursor-pointer max-w-md mx-auto"
                onClick={() => setShowOptions((prev) => !prev)}
            >
                {/* <div className="bg-gradient-to-r from-[#5f0a87] to-[#a4508b] border border-white/10 rounded-2xl p-6 text-center shadow-xl hover:shadow-purple-500/30 hover:scale-105 transition-all duration-300"> */}

                {/* Sky Blue */}
                {/* <div className="bg-gradient-to-r from-[#00c6ff] to-[#0072ff] border border-white/10 rounded-2xl p-6 text-center shadow-lg hover:shadow-blue-400/40 hover:scale-105 transition-all duration-300"> */}

                {/* Neon Crazy cool */}
                {/* <div className="bg-gradient-to-r from-[#1f005c] via-[#5b0060] to-[#870160] border border-purple-500/20 rounded-2xl p-6 text-center shadow-[0_0_25px_#a855f7] hover:scale-105 transition-all duration-300"> */}
                {/* Hot red yellow */}
                {/* <div className="bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 rounded-xl p-6 text-center shadow-xl hover:shadow-yellow-400/30 border border-white/10 hover:scale-105 transition-all duration-300"> */}
                {/* dark Blue */}
                {/* <div className="bg-gradient-to-br from-[#111827] to-[#1f2937] rounded-xl p-6 text-center border border-gray-700 shadow-md hover:shadow-indigo-500/20 hover:scale-105 transition-all duration-300"> */}
                <div className="bg-gradient-to-br from-[#25d366] to-[#128c7e] rounded-xl p-6 text-center shadow-md hover:shadow-green-400/40 border border-green-500/20 hover:scale-105 transition-all duration-300">
                    <FaMobileAlt className="text-4xl mx-auto mb-4 text-white" />
                    <h3 className="text-white text-xl font-bold">Recharge Now</h3>
                    <p className="text-white/80 mt-2">Quick recharge for your mobile network</p>
                </div>
            </motion.div>

            {/* Recharge Options Section */}
            {showOptions && (
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.6}}
                    className="mt-10"
                >
                    <h2 className="text-center text-2xl font-bold text-foreground mb-6">
                        Select Your Network Provider
                    </h2>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {networks.map((network, index) => (
                            <motion.div
                                key={index}
                                initial={{opacity: 0, y: 20}}
                                animate={{opacity: 1, y: 0}}
                                transition={{duration: 0.4, delay: index * 0.1}}
                                className="cursor-pointer overflow-hidden rounded-xl bg-card shadow-md hover:scale-105 hover:shadow-lg transition-all"
                                onClick={() => handleCardClick(network.redirectUrl)}
                            >
                                <img src={network.image} alt={network.name} className="h-32 w-full object-cover" />
                                <div className="p-4 text-center">
                                    <h3 className="text-lg font-semibold text-foreground">{network.name}</h3>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default RechargeSection;
