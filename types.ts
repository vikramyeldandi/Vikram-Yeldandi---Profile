export enum SlideType {
  TITLE = 'TITLE',
  SUMMARY = 'SUMMARY',
  EXPERIENCE = 'EXPERIENCE',
  SKILLS = 'SKILLS',
  EDUCATION = 'EDUCATION',
  GENERIC = 'GENERIC',
  VISUALIZATION = 'VISUALIZATION',
  LEADERSHIP = 'LEADERSHIP'
}

export enum ChartType {
  METRIC_GRID = 'METRIC_GRID', // Cards with Big Numbers
  BAR_CHART = 'BAR_CHART',     // Standard Bar Chart
  BUBBLE_CHART = 'BUBBLE_CHART' // Visual Bubbles for Tools/Tech
}

export interface ChartItem {
  label: string;
  value: string | number;
  description?: string; // Tooltip/Modal content
  color?: string;
}

export interface ChartData {
  type: ChartType;
  items: ChartItem[];
}

export interface SlideData {
  title: string;
  subtitle?: string;
  companyName?: string; // For branding
  companyDomain?: string; // For fetching logos (e.g., "google.com")
  bullets: string[];
  type: SlideType;
  chart?: ChartData;
  footer?: string;
}

export interface PresentationData {
  theme: string;
  author: string;
  slides: SlideData[];
}