import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BH4FVB电码练习器｜BH4FVB Morse Code Trainer",
  description: "基础、进阶与自由模式一体的渐进式摩尔斯电码听抄训练工具",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
