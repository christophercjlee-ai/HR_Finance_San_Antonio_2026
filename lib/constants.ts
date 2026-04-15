// App constants
export const CONFERENCE = {
  title: "Graham Packaging HR & Finance Conference",
  shortTitle: "HR & Finance Conference",
  startDate: "2026-04-21",
  endDate: "2026-04-23",
  dateRangeDisplay: "April 21–23, 2026",
  dateRangeLong: "Tuesday, April 21 through Thursday, April 23, 2026",
  participantCount: 120,
  tagline: "People Creating a Better Tomorrow",
  companyName: "GRAHAM PACKAGING COMPANY",
} as const;

export const WELCOME_MESSAGES = {
  executive1: {
    name: "Jane Doe",
    title: "Chief Financial Officer",
    message:
      "Welcome to our annual HR & Finance Conference! This is an exciting opportunity for us to come together, share insights, and align on our strategic priorities for the year ahead. I look forward to productive discussions and meaningful connections.",
  },
  executive2: {
    name: "John Smith",
    title: "Chief Human Resources Officer",
    message:
      "I'm thrilled to welcome you all to this year's conference. Our people are our greatest asset, and this event reflects our commitment to investing in our teams. Let's make the most of these three days together.",
  },
} as const;

export const COLORS = {
  primary: "#0A6EB0",
  accent: "#FF9F1C",
  green: "#10B981",
  dark: "#1F2937",
  muted: "#6B7280",
  light: "#F9FAFB",
  white: "#FFFFFF",
  error: "#EF4444",
  hrBadge: "#8B5CF6",
  financeBadge: "#0A6EB0",
} as const;

export const ALLOWED_EMAIL_DOMAIN = "grahampackaging.com";

export const CONFERENCE_DAYS = [
  { label: "Tue, April 21", value: "2026-04-21" },
  { label: "Wed, April 22", value: "2026-04-22" },
  { label: "Thu, April 23", value: "2026-04-23" },
] as const;
