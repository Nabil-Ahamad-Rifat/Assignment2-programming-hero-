import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { pool } from "../../config/database";
import { env } from "../../config/env";
import { AppError } from "../../utils/AppError";
import type { DbUser, UserPublic, SignupBody, LoginBody, JwtPayload } from "./auth.types";

const SALT_ROUNDS = 10;
const VALID_ROLES = ["contributor", "maintainer"] as const;

export const signup = async (body: SignupBody): Promise<UserPublic> => {
  if (!body) {
    throw new AppError("Request body is required", StatusCodes.BAD_REQUEST);
  }

  const { name, email, password, role = "contributor" } = body;

  if (!name || !email || !password) {
    throw new AppError("name, email, and password are required", StatusCodes.BAD_REQUEST);
  }

  if (!VALID_ROLES.includes(role)) {
    throw new AppError("role must be contributor or maintainer", StatusCodes.BAD_REQUEST);
  }

  const existing = await pool.query<DbUser>("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.rows.length > 0) {
    throw new AppError("Email already registered", StatusCodes.BAD_REQUEST);
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const result = await pool.query<UserPublic>(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at, updated_at`,
    [name, email, hashedPassword, role]
  );

  return result.rows[0];
};

export const login = async (body: LoginBody): Promise<{ token: string; user: UserPublic }> => {
  if (!body) {
    throw new AppError("Request body is required", StatusCodes.BAD_REQUEST);
  }

  const { email, password } = body;

  if (!email || !password) {
    throw new AppError("email and password are required", StatusCodes.BAD_REQUEST);
  }

  const result = await pool.query<DbUser>("SELECT * FROM users WHERE email = $1", [email]);
  const user = result.rows[0];

  if (!user) {
    throw new AppError("Invalid credentials", StatusCodes.UNAUTHORIZED);
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new AppError("Invalid credentials", StatusCodes.UNAUTHORIZED);
  }

  const payload: JwtPayload = { id: user.id, name: user.name, role: user.role };
  const token = jwt.sign(payload, env.jwtSecret, { expiresIn: "7d" });

  const userPublic: UserPublic = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };

  return { token, user: userPublic };
};
