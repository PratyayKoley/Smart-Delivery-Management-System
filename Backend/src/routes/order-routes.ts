import { Router } from "express";
import { getAllOrders, assignOrders, updateOrderStatus } from "../controllers/order-controller";

const router: Router = Router();

router.get("/", getAllOrders);
// router.post("/", createOrders);
router.post("/assign", assignOrders);
router.put("/:id/status", updateOrderStatus);

export default router;