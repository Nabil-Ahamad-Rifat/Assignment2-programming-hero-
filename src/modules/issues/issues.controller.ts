import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { createIssue, getAllIssues, getIssueById, updateIssue, deleteIssue } from "./issues.service";
import { sendSuccess } from "../../utils/response";
import { AppError } from "../../utils/AppError";
import type { CreateIssueBody, UpdateIssueBody, IssueQueryParams } from "./issues.types";

export const createIssueController = async (
  req: Request<Record<string, never>, unknown, CreateIssueBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) { next(new AppError("Unauthorized", StatusCodes.UNAUTHORIZED)); return; }
    const issue = await createIssue(req.body, req.user);
    sendSuccess(res, StatusCodes.CREATED, "Issue created successfully", issue);
  } catch (error) {
    next(error);
  }
};

export const getAllIssuesController = async (
  req: Request<Record<string, never>, unknown, unknown, IssueQueryParams>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const issues = await getAllIssues(req.query);
    sendSuccess(res, StatusCodes.OK, "Issues retrived successfully", issues);
  } catch (error) {
    next(error);
  }
};

export const getIssueByIdController = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { next(new AppError("Invalid issue id", StatusCodes.BAD_REQUEST)); return; }
    const issue = await getIssueById(id);
    sendSuccess(res, StatusCodes.OK, "Issue retrived successfully", issue);
  } catch (error) {
    next(error);
  }
};

export const updateIssueController = async (
  req: Request<{ id: string }, unknown, UpdateIssueBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) { next(new AppError("Unauthorized", StatusCodes.UNAUTHORIZED)); return; }
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { next(new AppError("Invalid issue id", StatusCodes.BAD_REQUEST)); return; }
    const issue = await updateIssue(id, req.body, req.user);
    sendSuccess(res, StatusCodes.OK, "Issue updated successfully", issue);
  } catch (error) {
    next(error);
  }
};

export const deleteIssueController = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { next(new AppError("Invalid issue id", StatusCodes.BAD_REQUEST)); return; }
    await deleteIssue(id);
    sendSuccess(res, StatusCodes.OK, "Issue deleted successfully");
  } catch (error) {
    next(error);
  }
};
