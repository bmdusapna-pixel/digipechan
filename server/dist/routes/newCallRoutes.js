"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.newCallRoutes = void 0;
const express_1 = __importDefault(require("express"));
const jwtAuthenticationMiddleware_1 = require("../middlewares/jwtAuthenticationMiddleware");
const enums_1 = require("../enums/enums");
const newCallTextController_1 = require("../controllers/call-text/newCallTextController");
exports.newCallRoutes = express_1.default.Router();
exports.newCallRoutes.get("/", jwtAuthenticationMiddleware_1.authenticate, (0, jwtAuthenticationMiddleware_1.authorize)([enums_1.UserRoles.BASIC_USER]), newCallTextController_1.generateTokenForOwner);
exports.newCallRoutes.post("/", 
// authenticate,
// authorize([UserRoles.BASIC_USER]),
newCallTextController_1.generateToken);
