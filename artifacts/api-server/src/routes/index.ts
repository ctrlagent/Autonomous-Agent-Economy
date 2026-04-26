import { Router, type IRouter } from "express";
import healthRouter from "./health";
import templatesRouter from "./templates";
import stationsRouter from "./stations";
import agentsRouter from "./agents";
import tasksRouter from "./tasks";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/templates", templatesRouter);
router.use("/stations", stationsRouter);
router.use("/agents", agentsRouter);
router.use("/tasks", tasksRouter);
router.use("/dashboard", dashboardRouter);

export default router;
