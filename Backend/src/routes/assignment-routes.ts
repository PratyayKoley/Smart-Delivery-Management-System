import { Router } from "express";
import { getAssignmentMetrics, runMetricsEvaluation } from "../controllers/assignment-controller";

const router: Router = Router();

router.get("/metrics", getAssignmentMetrics);
router.post("/run", runMetricsEvaluation);

export default router;