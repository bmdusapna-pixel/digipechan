"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomSerialNumber = void 0;
const generateRandomSerialNumber = (bundleId) => {
    const prefix = bundleId
        .replace(/[^A-Z]/gi, "")
        .toUpperCase()
        .substring(0, 4);
    const numberPartMatch = bundleId.match(/\d+$/);
    const numberPart = numberPartMatch ? numberPartMatch[0] : "1";
    let digits = "";
    for (let i = 0; i < 10; i++) {
        digits += Math.floor(Math.random() * 10);
    }
    return `${prefix}${numberPart}-${digits}`;
};
exports.generateRandomSerialNumber = generateRandomSerialNumber;
