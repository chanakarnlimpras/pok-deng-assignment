import {
  createGameController,
  performActionController,
} from "../controllers/gameController";
import express from "express";
const router = express.Router();

router.post("/create", createGameController);
router.post("/:gameId/action", performActionController);

export default router;
