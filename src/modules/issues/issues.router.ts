import { Router } from "express";
import { authenticate, requireMaintainer } from "../../middleware/auth";
import {
  createIssueController,
  getAllIssuesController,
  getIssueByIdController,
  updateIssueController,
  deleteIssueController,
} from "./issues.controller";

const router = Router();

router.get("/", getAllIssuesController);
router.get("/:id", getIssueByIdController);
router.post("/", authenticate, createIssueController);
router.patch("/:id", authenticate, updateIssueController);
router.delete("/:id", authenticate, requireMaintainer, deleteIssueController);

export default router;
