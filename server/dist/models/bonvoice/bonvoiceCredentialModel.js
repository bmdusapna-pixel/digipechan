"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BonvoiceCredential = void 0;
const mongoose_1 = require("mongoose");
const bonvoiceCredentialSchema = new mongoose_1.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    did: { type: String, required: true },
    token: { type: String, required: false },
}, { timestamps: true });
exports.BonvoiceCredential = (0, mongoose_1.model)("BonvoiceCredential", bonvoiceCredentialSchema);
