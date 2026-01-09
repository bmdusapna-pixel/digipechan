import express from "express";
import { apiRouter } from "./route";
import {
  FRONTEND_BASE_URL_DEV,
  FRONTEND_BASE_URL_PROD_DOMAIN,
  FRONTEND_BASE_URL_PROD_VERCEL,
  MAX_RETRIES,
  PORT,
  RTOAPI,
  NODE_ENV,
} from "./secrets";
import { connectToDatabase } from "./config/database";
import logger from "./config/logger";
import cookieParser from "cookie-parser";
import cors from "cors";
import { qrFlowRoute } from "./routes/qr-flow/qrFlowRoute";

import twilio from "twilio";

const app = express();

const allowedOrigins = [
  FRONTEND_BASE_URL_DEV,
  FRONTEND_BASE_URL_PROD_DOMAIN,
  FRONTEND_BASE_URL_PROD_VERCEL,
  // Add your frontend domain here
  "https://digipehchan.in",
  "https://client-eight-beige.vercel.app",
  "https://digi-pehchan-client.vercel.app",
  "https://digipechan-backend.vercel.app",
  RTOAPI,
  // Local development origins
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // In development, allow all localhost origins
      if (NODE_ENV === "dev") {
        if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
          logger.info(`CORS: Allowing localhost origin: ${origin}`);
          return callback(null, true);
        }
      }
      
      // Check against allowed origins
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }
      
      const msg =
        "The CORS policy for this site does not allow access from the specified Origin.";
      logger.warn(`CORS: Blocked origin: ${origin}`);
      return callback(new Error(msg), false);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Enable credentials
  })
);
app.options(/.*/, cors());
app.use(express.json());
app.use(cookieParser());
connectToDatabase(parseInt(MAX_RETRIES));

export const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

app.get("/", (req, res) => {
  res.status(200).json("Server is running");
});

app.post("/vehicle", async (req, res) => {
  const response = await fetch("https://prod.apiclub.in/api/v1/rc_lite", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "x-api-key": "apclb_4XOvpycA99IJyzuo7UPU4Z6Q7868c20b",
    },
    body: JSON.stringify({ vehicleId: req.body.vehicleId }),
  });

  const data = await response.json();
  res.json(data);
});

if (NODE_ENV === "dev") {
  app.use("/api", apiRouter);
  logger.info("Mounted /api routes (dev mode)");
} else {
  app.use("/", apiRouter);
  logger.info(`Mounted / routes; NODE_ENV=${NODE_ENV}`);
}

app.listen(PORT, () => {
  logger.info(`Started Your Application on Port ${PORT}`);
});
