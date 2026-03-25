export const BUSINESS_UNITS = [
  "R&D",
  "Commercialization",
  "Leadership Development",
  "Product Supply",
  "Corporate Functions",
] as const;

export const NEED_TYPES = ["New Program", "Compliance", "Refresh", "Ad Hoc"] as const;

export const MODALITIES = [
  "eLearning",
  "ILT",
  "VILT",
  "Job Aid",
  "Blended",
  "Video",
  "Other",
] as const;

export const COMPLEXITIES = [
  "Small (< 1hr)",
  "Medium (1–4hr)",
  "Large (4hr+)",
  "Curriculum (multi-module)",
] as const;

export const PRIORITIES = ["High", "Medium", "Low"] as const;

export const STATUSES = [
  "Submitted",
  "In Review",
  "Scoped",
  "Scheduled",
  "In Development",
  "Complete",
] as const;

export const STATUS_COLORS: Record<string, string> = {
  Submitted: "bg-gray-100 text-gray-700",
  "In Review": "bg-blue-100 text-blue-700",
  Scoped: "bg-purple-100 text-purple-700",
  Scheduled: "bg-yellow-100 text-yellow-700",
  "In Development": "bg-orange-100 text-orange-700",
  Complete: "bg-green-100 text-green-700",
};

export const EFFORT_BENCHMARKS = {
  "Small eLearning": { min: 40, max: 80 },
  "Medium eLearning": { min: 80, max: 200 },
  "Large eLearning": { min: 200, max: 400 },
  "ILT/VILT per day": { min: 40, max: 60 },
  "Job Aid": { min: 8, max: 20 },
};
