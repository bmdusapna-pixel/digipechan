"use client";

import { useRouter } from "next/navigation";
import {
  Car,
  Lightbulb,
  Truck,
  Baby,
  PawPrint,
  Wind,
  Pencil,
  AlertCircle,
  ArrowLeft,
} from "lucide-react"; // Use icons of your choice

export default function ReasonList() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex justify-center p-4">
      <div className="mx-auto max-w-md w-full mt-8">
        <div className="bg-white/90 shadow-xl rounded-2xl px-4 py-6">

          {/* Go Back button: right-aligned */}
          <div className="flex justify-end mb-2">
            <button
              onClick={handleBack}
              type="button"
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gradient-to-r from-blue-200 to-purple-200 text-black-800 font-semibold shadow hover:from-blue-300 hover:to-purple-300 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
          </div>

          <h2 className="text-lg font-bold tracking-wide uppercase mb-5 text-center from-primary bg-gradient-to-r to-purple-600 bg-clip-text text-transparent">
            Reasons for Contact To Vehical Owner
          </h2>

          <ul className="flex flex-col gap-3">
            {/* Wrongly Parked */}
            <li className="flex items-center border-gray-400 bg-gradient-to-r from-blue-100 to-gray-100 rounded-lg px-4 py-3">
              <span className="flex items-center justify-center bg-yellow-100 text-black-800 rounded-lg w-8 h-8 mr-3">
                <Car className="w-5 h-5" />
              </span>
              <span className="text-black-100 font-medium">
                The vehicle is wrongly parked
              </span>
            </li>
            {/* Lights ON */}
            <li className="flex items-center border-gray-400 bg-gradient-to-r from-blue-100 to-gray-100 rounded-lg px-4 py-3">
              <span className="flex items-center justify-center bg-yellow-100 text-black-800 rounded-lg w-8 h-8 mr-3">
                <Lightbulb className="w-5 h-5" />
              </span>
              <span className="text-black-100 font-medium">
                The lights of the vehicle are ON
              </span>
            </li>
            {/* Getting Towed */}
            <li className="flex items-center border-gray-400 bg-gradient-to-r from-blue-100 to-gray-100 rounded-lg px-4 py-3">
              <span className="flex items-center justify-center bg-yellow-100 text-black-800 rounded-lg w-8 h-8 mr-3">
                <Truck className="w-5 h-5" />
              </span>
              <span className="text-black-100 font-medium">
                The vehicle is getting towed
              </span>
            </li>
            {/* Baby or Pet in Vehicle */}
            <li className="flex items-center border-gray-400 bg-gradient-to-r from-blue-100 to-gray-100 rounded-lg px-4 py-3">
              <span className="flex items-center justify-center bg-yellow-100 text-black-800 rounded-lg w-8 h-8 mr-3">
                <Baby className="w-5 h-5" />
              </span>
              <span className="text-black-100 font-medium">
                There is a baby in vehicle
              </span>
            </li>
            <li className="flex items-center border-gray-400 bg-gradient-to-r from-blue-100 to-gray-100 rounded-lg px-4 py-3">
              <span className="flex items-center justify-center bg-yellow-100 text-black-800 rounded-lg w-8 h-8 mr-3">
                <PawPrint className="w-5 h-5" />
              </span>
              <span className="text-black-100 font-medium">
                There is a pet in vehicle
              </span>
            </li>
            {/* Window is open */}
            <li className="flex items-center border-gray-400 bg-gradient-to-r from-blue-100 to-gray-100 rounded-lg px-4 py-3">
              <span className="flex items-center justify-center bg-yellow-100 text-black-800 rounded-lg w-8 h-8 mr-3">
                <Wind className="w-5 h-5" />
              </span>
              <span className="text-black-100 font-medium">
                The window of vehicle is open
              </span>
            </li>
            {/* Other Reason */}
            <li className="flex items-center border-gray-400 bg-gradient-to-r from-blue-100 to-gray-100 rounded-lg px-4 py-3">
              <span className="flex items-center justify-center bg-yellow-100 text-black-800 rounded-lg w-8 h-8 mr-3">
                <Pencil className="w-5 h-5" />
              </span>
              <input
                type="text"
                placeholder="Other reason..."
                className="bg-transparent border-none outline-none text-black-100 flex-1 placeholder-black-250 font-medium"
              />
            </li>
          </ul>

          <button
            type="button"
            className="w-full py-3 mt-6 bg-blue-200 text-black-900 font-bold rounded-lg flex items-center justify-center gap-2 transition hover:bg-blue-300 active:scale-95 shadow-lg"
          >
            <span>Continue</span>
            {/* Example: you can add an icon here if needed */}
            {/* <SendIcon className="w-5 h-5" /> */}
          </button>
        </div>
      </div>
    </div>
  );
}
