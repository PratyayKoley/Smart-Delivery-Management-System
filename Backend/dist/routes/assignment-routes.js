"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const assignment_controller_1 = require("../controllers/assignment-controller");
const router = (0, express_1.Router)();
router.get("/metrics", assignment_controller_1.getAssignmentMetrics);
router.post("/run", assignment_controller_1.runMetricsEvaluation);
router.get("/", assignment_controller_1.getAssignments);
exports.default = router;
