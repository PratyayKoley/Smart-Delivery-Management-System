import { Router } from "express";
import { getAssignmentMetrics, runMetricsEvaluation, getAssignments } from "../controllers/assignment-controller";

const router: Router = Router();

router.get("/metrics", getAssignmentMetrics);
router.post("/run", runMetricsEvaluation);
router.get("/", getAssignments);

export default router;