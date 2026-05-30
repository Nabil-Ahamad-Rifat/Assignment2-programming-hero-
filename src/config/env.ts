import dotenv from "dotenv";
dotenv.config();

const get = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing environment variable: ${key}`);
  return value;
};

export const env = {
  databaseUrl: get("DATABASE_URL"),
  jwtSecret: get("JWT_SECRET"),
  port: parseInt(process.env["PORT"] ?? "3000", 10),
  nodeEnv: process.env["NODE_ENV"] ?? "development",
} as const;
