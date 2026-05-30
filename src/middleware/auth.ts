import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";
import type { JwtPayload } from "../modules/auth/auth.types";

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const token = req.headers["authorization"];

  if (!token) {
    next(new AppError("Access token required", StatusCodes.UNAUTHORIZED));
    return;
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    next(new AppError("Invalid or expired token", StatusCodes.UNAUTHORIZED));
  }
};

export const requireMaintainer = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== "maintainer") {
    next(new AppError("Maintainer access required", StatusCodes.FORBIDDEN));
    return;
  }
  next();
};
