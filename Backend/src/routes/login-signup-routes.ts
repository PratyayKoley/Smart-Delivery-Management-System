import { Router } from "express";
import { LoginControl, RegisterControl, verifyToken, getUserData, joinAsPartner, getPendingPartner, acceptPartner, getActiveInactivePartners } from "../controllers/login-signup-controller";

const router: Router = Router();

router.post("/login", LoginControl);
router.post("/register", RegisterControl);
router.get("/verify-token", verifyToken);
router.post("/get-user-data", getUserData);
router.post("/join-request", joinAsPartner);
router.get("/pending-partners", getPendingPartner);
router.post("/partner-action", acceptPartner);
router.get("/active-and-inactive-partners", getActiveInactivePartners);

export default router