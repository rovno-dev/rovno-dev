import { TitleSlide } from "./slides/TitleSlide";
import { SpeakerSlide } from "./slides/SpeakerSlide";
import { QuoteSlide } from "./slides/QuoteSlide";
import { SplitSlide } from "./slides/SplitSlide";
import { CodeSlide } from "./slides/CodeSlide";
import { CustomTsxSlide } from "./slides/CustomTsxSlide";

export const SLIDE_COMPONENTS: Record<string, React.ComponentType<any>> = {
  TitleSlide,
  SpeakerSlide,
  QuoteSlide,
  SplitSlide,
  CodeSlide,
  CustomTsx: CustomTsxSlide,
};

export const SLIDE_META = [
  { type: "TitleSlide", label: "Title / Cover" },
  { type: "SpeakerSlide", label: "Speaker Profile" },
  { type: "SplitSlide", label: "Split Screen" },
  { type: "QuoteSlide", label: "Quote" },
  { type: "CodeSlide", label: "Code Block" },
  { type: "CustomTsx", label: "AI Custom (TSX)" },
];
