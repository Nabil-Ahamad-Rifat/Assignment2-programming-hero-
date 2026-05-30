import express, { Request, Response } from "express";
import cors from "cors";
import { StatusCodes } from "http-status-codes";
import authRouter from "./modules/auth/auth.router";
import issuesRouter from "./modules/issues/issues.router";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({
    success: true,
    message: "DevPulse API is running",
  });
});

app.use("/api/auth", authRouter);
app.use("/api/issues", issuesRouter);

app.use((_req: Request, res: Response) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: "Route not found",
  });
});

app.use(errorHandler);

export default app;
