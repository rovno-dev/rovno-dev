import * as React from "react";
import * as FramerMotion from "framer-motion";
import { TitleSlide } from "./slides/TitleSlide";
import { SpeakerSlide } from "./slides/SpeakerSlide";
import { QuoteSlide } from "./slides/QuoteSlide";
import { SplitSlide } from "./slides/SplitSlide";
import { CodeSlide } from "./slides/CodeSlide";

export const tsxScope = {
  ...React,
  motion: FramerMotion.motion,
  AnimatePresence: FramerMotion.AnimatePresence,
  TitleSlide,
  SpeakerSlide,
  QuoteSlide,
  SplitSlide,
  CodeSlide,
};
