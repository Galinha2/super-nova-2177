import { Inter_Tight } from 'next/font/google';
import "./globals.css";
import Header from "@/content/header/Header";
import HeaderMobile from "@/content/header/HeaderMobile";


const interTight = Inter_Tight({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter-tight',
});

export const metadata = {
  title: "Super Nova 2177",
  description: "Super Nova 2177",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${interTight.variable} flex antialiased`}>
        <Header />
        <span id="createPost"></span>
        <HeaderMobile />
        {children}
      </body>
    </html>
  );
}
