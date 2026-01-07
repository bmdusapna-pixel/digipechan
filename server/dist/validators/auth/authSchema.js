"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendVerificationEmailSchema = exports.verifyEmailSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.loginSchema = exports.signUpSchema = void 0;
const zod_1 = require("zod");
exports.signUpSchema = zod_1.z.object({
    firstName: zod_1.z
        .string()
        .regex(/^[A-Za-z]+$/, { message: "First name must contain only alphabets" })
        .nonempty({ message: "First Name cannot be empty!" }),
    lastName: zod_1.z
        .string()
        .regex(/^[A-Za-z]+$/, { message: "Last name must contain only alphabets" })
        .nonempty({ message: "Last Name cannot be empty!" }),
    email: zod_1.z.string().email({ message: "Invalid email format" }),
    phoneNumber: zod_1.z
        .string()
        .regex(/^\+?[0-9]{10,15}$/, {
        message: "Phone number must be between 10 to 15 digits and may start with '+'",
    })
        .nonempty({ message: "Phone number cannot be empty!" }),
    password: zod_1.z
        .string()
        .min(4, { message: "Password should have 4 or more characters" })
        .nonempty({ message: "Password cannot be empty" }),
    _tk: zod_1.z.string().optional(),
    token: zod_1.z.string().optional(),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email({ message: "Invalid email format" }),
    password: zod_1.z
        .string()
        .min(4, { message: "Password should have 4 or more characters" })
        .nonempty({ message: "Password cannot be empty" }),
    token: zod_1.z.string().optional(),
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string(),
});
exports.resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string(),
    password: zod_1.z
        .string()
        .min(4, { message: "Password should have 4 or more characters" })
        .nonempty({ message: "Password cannot be empty" }),
});
exports.verifyEmailSchema = zod_1.z.object({
    token: zod_1.z.string(),
});
exports.resendVerificationEmailSchema = zod_1.z.object({
    email: zod_1.z.string(),
});
