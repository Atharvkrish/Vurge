import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import jobsRouter from "./jobs";
import applicationsRouter from "./applications";
import microInternshipsRouter from "./micro-internships";
import cvRouter from "./cv";
import notificationsRouter from "./notifications";
import dashboardRouter from "./dashboard";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(jobsRouter);
router.use(applicationsRouter);
router.use(microInternshipsRouter);
router.use(cvRouter);
router.use(notificationsRouter);
router.use(dashboardRouter);
router.use(adminRouter);

export default router;
