"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.twilioClient = void 0;
const express_1 = __importDefault(require("express"));
const route_1 = require("./route");
const secrets_1 = require("./secrets");
const database_1 = require("./config/database");
const logger_1 = __importDefault(require("./config/logger"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const twilio_1 = __importDefault(require("twilio"));
const app = (0, express_1.default)();
const allowedOrigins = [
    secrets_1.FRONTEND_BASE_URL_DEV,
    secrets_1.FRONTEND_BASE_URL_PROD_DOMAIN,
    secrets_1.FRONTEND_BASE_URL_PROD_VERCEL,
    // Add your frontend domain here
    "https://digipehchan.in",
    "https://client-eight-beige.vercel.app",
    "https://digi-pehchan-client.vercel.app",
    secrets_1.RTOAPI,
    "*",
];
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        if (!origin)
            return callback(null, true); // Allow requests with no origin (like mobile apps or curl requests)
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = "The CORS policy for this site does not allow access from the specified Origin.";
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Enable credentials
}));
app.options(/.*/, (0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
(0, database_1.connectToDatabase)(parseInt(secrets_1.MAX_RETRIES));
exports.twilioClient = (0, twilio_1.default)(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
app.get("/", (req, res) => {
    res.status(200).json("Server is running");
});
app.post("/vehicle", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield fetch("https://prod.apiclub.in/api/v1/rc_lite", {
        method: "POST",
        headers: {
            accept: "application/json",
            "content-type": "application/json",
            "x-api-key": "apclb_4XOvpycA99IJyzuo7UPU4Z6Q7868c20b",
        },
        body: JSON.stringify({ vehicleId: req.body.vehicleId }),
    });
    const data = yield response.json();
    res.json(data);
}));
if (secrets_1.NODE_ENV === "dev") {
    app.use("/api", route_1.apiRouter);
    logger_1.default.info("Mounted /api routes (dev mode)");
}
else {
    app.use("/", route_1.apiRouter);
    logger_1.default.info(`Mounted / routes; NODE_ENV=${secrets_1.NODE_ENV}`);
}
app.listen(secrets_1.PORT, () => {
    logger_1.default.info(`Started Your Application on Port ${secrets_1.PORT}`);
});
