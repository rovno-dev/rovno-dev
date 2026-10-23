import { SlideTheme } from "@/utils/api/presentations";

export interface SlideProps {
  content: Record<string, any>;
  isEditing: boolean;
  update: (key: string, val: any) => void;
  theme?: SlideTheme;
}