import { format, parseISO } from "date-fns";

export function formatAgendaTime(startTime: string, endTime: string): string {
  const start = parseISO(startTime);
  const end = parseISO(endTime);
  const dayPart = format(start, "EEE MMM d");
  const startPart = format(start, "HH:mm");
  const endPart = format(end, "HH:mm");
  return `${dayPart} \u2022 ${startPart} \u2013 ${endPart}`;
}

export function formatDateTime(dateString: string): string {
  return format(parseISO(dateString), "MMM d, yyyy 'at' h:mm a");
}

export function formatTime(dateString: string): string {
  return format(parseISO(dateString), "h:mm a");
}

export function formatDate(dateString: string): string {
  return format(parseISO(dateString), "MMM d, yyyy");
}

export function formatRelativeTime(dateString: string): string {
  const date = parseISO(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}
