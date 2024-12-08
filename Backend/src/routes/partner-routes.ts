import { Router } from 'express';
import { getAllPartners, createPartners, updatePartners, deletePartners, calculateMetrics } from '../controllers/partner-controller';

const router: Router = Router();

router.get("/", getAllPartners);
router.post("/", createPartners);
router.put("/:id", updatePartners);
router.delete("/:id", deletePartners);

router.post("/metrics", calculateMetrics);

export default router;