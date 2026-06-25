import { Router, type IRouter } from "express";
import healthRouter from "./health";
import templatesRouter from "./templates";
import stationsRouter from "./stations";
import agentsRouter from "./agents";
import tasksRouter from "./tasks";
import dashboardRouter from "./dashboard";
import missionsRouter from "./missions";
import aiRouter from "./ai";
import eventsRouter from "./events";
import roomsRouter from "./rooms";
import escrowRouter from "./escrow";
import airlockRouter from "./airlock";
import githubRouter from "./github";
import marketplaceRouter from "./marketplace";
import briefingRouter from "./briefing";
import commanderRouter from "./commander";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/templates", templatesRouter);
router.use("/stations", stationsRouter);
router.use("/agents", agentsRouter);
router.use("/tasks", tasksRouter);
router.use("/tasks", githubRouter);
router.use("/dashboard", dashboardRouter);
router.use("/missions", missionsRouter);
router.use("/ai", aiRouter);
router.use("/events", eventsRouter);
router.use("/rooms", roomsRouter);
router.use("/escrow", escrowRouter);
router.use("/airlock", airlockRouter);
router.use("/marketplace", marketplaceRouter);
router.use("/briefing", briefingRouter);
router.use("/commander", commanderRouter);

export default router;
