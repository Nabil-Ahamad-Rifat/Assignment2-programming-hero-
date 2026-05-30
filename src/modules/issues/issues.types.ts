import type { UserRole } from "../auth/auth.types";

export type IssueType = "bug" | "feature_request";
export type IssueStatus = "open" | "in_progress" | "resolved";

export interface DbIssue {
  id: number;
  title: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  reporter_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface IssueReporter {
  id: number;
  name: string;
  role: UserRole;
}

export interface IssueWithReporter {
  id: number;
  title: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  reporter: IssueReporter;
  created_at: Date;
  updated_at: Date;
}

export interface CreateIssueBody {
  title: string;
  description: string;
  type: IssueType;
}

export interface UpdateIssueBody {
  title?: string;
  description?: string;
  type?: IssueType;
}

export interface IssueQueryParams {
  sort?: "newest" | "oldest";
  type?: IssueType;
  status?: IssueStatus;
}
