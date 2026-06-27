import express from "express";
import gameRoutes from "./gameRoutes";

const router = express.Router();

router.use("/api/game", gameRoutes);
export default router;
