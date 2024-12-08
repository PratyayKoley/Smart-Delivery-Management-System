import { Router } from "express";
import { getAllOrders, assignOrders, updateOrderStatus, createOrders, getPartnerOrders } from "../controllers/order-controller";

const router: Router = Router();

router.get("/", getAllOrders);
router.post("/", createOrders);
router.post("/assign", assignOrders);
router.put("/:id/status", updateOrderStatus);
router.get("/:id", getPartnerOrders)

export default router;