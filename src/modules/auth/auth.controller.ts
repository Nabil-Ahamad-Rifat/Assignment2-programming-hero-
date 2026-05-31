import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { signup, login } from "./auth.service";
import { sendSuccess } from "../../utils/response";
import { AppError } from "../../utils/AppError";
import type { SignupBody, LoginBody } from "./auth.types";

export const signupController = async (
  req: Request<Record<string, never>, unknown, SignupBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      next(new AppError("Request body cannot be empty", StatusCodes.BAD_REQUEST));
      return;
    }
    const user = await signup(req.body);
    sendSuccess(res, StatusCodes.CREATED, "User registered successfully", user);
  } catch (error) {
    next(error);
  }
};

export const loginController = async (
  req: Request<Record<string, never>, unknown, LoginBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      next(new AppError("Request body cannot be empty", StatusCodes.BAD_REQUEST));
      return;
    }
    const data = await login(req.body);
    sendSuccess(res, StatusCodes.OK, "Login successful", data);
  } catch (error) {
    next(error);
  }
};
