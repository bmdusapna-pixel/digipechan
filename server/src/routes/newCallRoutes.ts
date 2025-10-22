import express from "express";
import {
  authenticate,
  authorize,
} from "../middlewares/jwtAuthenticationMiddleware";
import { UserRoles } from "../enums/enums";
import {
  generateToken,
  generateTokenForOwner,
} from "../controllers/call-text/newCallTextController";
export const newCallRoutes = express.Router();

newCallRoutes.get(
  "/",
  authenticate,
  authorize([UserRoles.BASIC_USER]),
  generateTokenForOwner
);
newCallRoutes.post(
  "/",
  authenticate,
  authorize([UserRoles.BASIC_USER]),
  generateToken
);
