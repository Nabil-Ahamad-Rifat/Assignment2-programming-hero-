import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../utils/AppError";
import { sendError } from "../utils/response";

interface PgError extends Error {
  code?: string;
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.message, err.errors);
    return;
  }

  if (err.name === "JsonWebTokenError") {
    sendError(res, StatusCodes.UNAUTHORIZED, "Invalid token");
    return;
  }

  if (err.name === "TokenExpiredError") {
    sendError(res, StatusCodes.UNAUTHORIZED, "Token has expired");
    return;
  }

  // PostgreSQL unique constraint violation
  const pgErr = err as PgError;
  if (pgErr.code === "23505") {
    sendError(res, StatusCodes.BAD_REQUEST, "Resource already exists");
    return;
  }

  const isDev = process.env["NODE_ENV"] === "development";
  sendError(
    res,
    StatusCodes.INTERNAL_SERVER_ERROR,
    "Internal server error",
    isDev ? err.message : undefined
  );
};
