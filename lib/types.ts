export type UserRole = "admin" | "participant";
export type AgendaFunction = "HR" | "Finance";
export type PhotoStatus = "pending" | "approved" | "rejected";
export type NotificationTarget = "all" | "finance" | "hr";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  push_token?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AgendaItem {
  id: string;
  function: AgendaFunction;
  title: string;
  start_time: string;
  end_time: string;
  location: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Participant {
  id: string;
  full_name: string;
  email: string;
  department?: string;
  title?: string;
  created_at: string;
}

export interface Photo {
  id: string;
  uploader_id: string;
  storage_path: string;
  thumbnail_path?: string;
  caption?: string;
  tags: string[];
  approval_status: PhotoStatus;
  approved_by?: string;
  created_at: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  target: NotificationTarget;
  sent_by?: string;
  created_at: string;
}

export interface NotificationRead {
  id: string;
  user_id: string;
  notification_id: string;
  read_at: string;
}

export interface AgendaCSVRow {
  function: string;
  title: string;
  start_time: string;
  end_time: string;
  location: string;
}

export interface ParticipantCSVRow {
  full_name: string;
  email: string;
  department?: string;
  title?: string;
}
