export const PROBLEM_CATEGORIES = [
  'เครื่องปรับอากาศ',
  'ไฟฟ้า',
  'ระบบ IT',
  'Internet',
  'อาคารสถานที่',
  'ประปา',
  'อุปกรณ์การเรียน',
  'อื่นๆ'
] as const;

export type ProblemCategory = typeof PROBLEM_CATEGORIES[number];

export interface ReportFormData {
  firstName: string;
  lastName: string;
  nickname?: string;
  department: string;
  phone: string;
  building: string;
  room: string;
  category: ProblemCategory | string;
  description: string;
  images: File[];
}
