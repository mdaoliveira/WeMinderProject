import express from "express";
import { signup, login, requestPasswordReset, resetPassword, validateResetToken } from "../controllers/authControllers.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);
router.get("/validate-reset-token/:token", validateResetToken);
export default router;


