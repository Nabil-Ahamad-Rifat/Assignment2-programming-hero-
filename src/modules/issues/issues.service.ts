import { StatusCodes } from "http-status-codes";
import { pool } from "../../config/database";
import { AppError } from "../../utils/AppError";
import type { JwtPayload } from "../auth/auth.types";
import type {
  DbIssue,
  IssueReporter,
  IssueWithReporter,
  CreateIssueBody,
  UpdateIssueBody,
  IssueQueryParams,
} from "./issues.types";

const VALID_TYPES = ["bug", "feature_request"] as const;
const VALID_STATUSES = ["open", "in_progress", "resolved"] as const;

// Fetch reporter rows for a list of ids (no JOIN)
const fetchReporters = async (ids: number[]): Promise<Map<number, IssueReporter>> => {
  const result = await pool.query<IssueReporter>(
    "SELECT id, name, role FROM users WHERE id = ANY($1::int[])",
    [ids]
  );
  return new Map(result.rows.map((r) => [r.id, r]));
};

const attachReporter = (issue: DbIssue, reporterMap: Map<number, IssueReporter>): IssueWithReporter => {
  const reporter = reporterMap.get(issue.reporter_id) ?? {
    id: issue.reporter_id,
    name: "Unknown",
    role: "contributor" as const,
  };
  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
  };
};

export const createIssue = async (body: CreateIssueBody, user: JwtPayload): Promise<DbIssue> => {
  const { title, description, type } = body;

  if (!title || !description || !type) {
    throw new AppError("title, description, and type are required", StatusCodes.BAD_REQUEST);
  }
  if (title.length > 150) {
    throw new AppError("title must not exceed 150 characters", StatusCodes.BAD_REQUEST);
  }
  if (description.length < 20) {
    throw new AppError("description must be at least 20 characters", StatusCodes.BAD_REQUEST);
  }
  if (!VALID_TYPES.includes(type)) {
    throw new AppError("type must be bug or feature_request", StatusCodes.BAD_REQUEST);
  }

  const result = await pool.query<DbIssue>(
    `INSERT INTO issues (title, description, type, reporter_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [title, description, type, user.id]
  );

  return result.rows[0];
};

export const getAllIssues = async (query: IssueQueryParams): Promise<IssueWithReporter[]> => {
  const { sort = "newest", type, status } = query;

  const conditions: string[] = [];
  const params: (string | number)[] = [];
  let p = 1;

  if (type) {
    if (!VALID_TYPES.includes(type)) throw new AppError("Invalid type filter", StatusCodes.BAD_REQUEST);
    conditions.push(`type = $${p++}`);
    params.push(type);
  }
  if (status) {
    if (!VALID_STATUSES.includes(status)) throw new AppError("Invalid status filter", StatusCodes.BAD_REQUEST);
    conditions.push(`status = $${p++}`);
    params.push(status);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const order = sort === "oldest" ? "ORDER BY created_at ASC" : "ORDER BY created_at DESC";

  const issuesResult = await pool.query<DbIssue>(`SELECT * FROM issues ${where} ${order}`, params);
  const issues = issuesResult.rows;

  if (issues.length === 0) return [];

  const reporterIds = [...new Set(issues.map((i) => i.reporter_id))];
  const reporterMap = await fetchReporters(reporterIds);

  return issues.map((issue) => attachReporter(issue, reporterMap));
};

export const getIssueById = async (id: number): Promise<IssueWithReporter> => {
  const result = await pool.query<DbIssue>("SELECT * FROM issues WHERE id = $1", [id]);
  const issue = result.rows[0];

  if (!issue) throw new AppError("Issue not found", StatusCodes.NOT_FOUND);

  const reporterMap = await fetchReporters([issue.reporter_id]);
  return attachReporter(issue, reporterMap);
};

export const updateIssue = async (
  id: number,
  body: UpdateIssueBody,
  user: JwtPayload
): Promise<DbIssue> => {
  const issueResult = await pool.query<DbIssue>("SELECT * FROM issues WHERE id = $1", [id]);
  const issue = issueResult.rows[0];

  if (!issue) throw new AppError("Issue not found", StatusCodes.NOT_FOUND);

  if (user.role === "contributor") {
    if (issue.reporter_id !== user.id) {
      throw new AppError("You can only update your own issues", StatusCodes.FORBIDDEN);
    }
    if (issue.status !== "open") {
      throw new AppError(
        "You can only update issues with open status",
        StatusCodes.CONFLICT
      );
    }
  }

  const { title, description, type } = body;

  if (title !== undefined) {
    if (title.length > 150) throw new AppError("title must not exceed 150 characters", StatusCodes.BAD_REQUEST);
  }
  if (description !== undefined) {
    if (description.length < 20) throw new AppError("description must be at least 20 characters", StatusCodes.BAD_REQUEST);
  }
  if (type !== undefined && !VALID_TYPES.includes(type)) {
    throw new AppError("type must be bug or feature_request", StatusCodes.BAD_REQUEST);
  }

  const updatedTitle = title ?? issue.title;
  const updatedDescription = description ?? issue.description;
  const updatedType = type ?? issue.type;

  const result = await pool.query<DbIssue>(
    `UPDATE issues
     SET title = $1, description = $2, type = $3, updated_at = NOW()
     WHERE id = $4
     RETURNING *`,
    [updatedTitle, updatedDescription, updatedType, id]
  );

  return result.rows[0];
};

export const deleteIssue = async (id: number): Promise<void> => {
  const check = await pool.query<DbIssue>("SELECT id FROM issues WHERE id = $1", [id]);
  if (check.rows.length === 0) throw new AppError("Issue not found", StatusCodes.NOT_FOUND);

  await pool.query("DELETE FROM issues WHERE id = $1", [id]);
};
