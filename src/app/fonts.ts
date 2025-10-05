import { Fira_Code } from "next/font/google";
import localFont from "next/font/local";

export const fira_code = Fira_Code({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

// Kaleko105 font family with all variants
export const kaleko105 = localFont({
  src: [
    {
      path: "../assets/fonts/Kaleko105Thin.ttf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../assets/fonts/Kaleko105ThinOblique.ttf",
      weight: "100",
      style: "italic",
    },
    {
      path: "../assets/fonts/Kaleko105Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../assets/fonts/Kaleko105LightOblique.ttf",
      weight: "300",
      style: "italic",
    },
    {
      path: "../assets/fonts/Kaleko105Book.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/fonts/Kaleko105BookOblique.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../assets/fonts/Kaleko105Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../assets/fonts/Kaleko105BoldOblique.ttf",
      weight: "700",
      style: "italic",
    },
    {
      path: "../assets/fonts/Kaleko105Heavy.ttf",
      weight: "900",
      style: "normal",
    },
    {
      path: "../assets/fonts/Kaleko105HeavyOblique.ttf",
      weight: "900",
      style: "italic",
    },
  ],
  variable: "--font-kaleko",
  display: "swap",
});
