import { Router } from 'express';
import { getAllPartners, createPartners, updatePartners, deletePartners } from '../controllers/partner-controller';

const router: Router = Router();

router.get("/", getAllPartners);
router.post("/", createPartners);
router.put("/:id", updatePartners);
router.delete("/:id", deletePartners);

export default router;