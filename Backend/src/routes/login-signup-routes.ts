import { Router } from "express";
import { LoginControl, RegisterControl, verifyToken, getUserData, joinAsPartner } from "../controllers/login-signup-controller";

const router: Router = Router();

router.post("/login", LoginControl);
router.post("/register", RegisterControl);
router.get("/verify-token", verifyToken);
router.post("/get-user-data", getUserData);
router.post("/join-request", joinAsPartner);

export default router