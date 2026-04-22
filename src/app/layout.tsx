import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Neuro Note Macros | Neurology Dot Phrases & NIHSS Calculator",
  description: "Copy-paste neurology documentation templates. Includes NIHSS calculator, stroke scales, and 15+ dot phrases for EHR documentation.",
  keywords: ["neurology", "dot phrases", "NIHSS", "stroke", "medical documentation", "EHR", "smart phrases"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#0B0F1A] text-white`}>
        <div className="flex flex-col min-h-screen">
          <div className="flex-1">{children}</div>
          <footer
            role="contentinfo"
            className="border-t border-white/5"
          >
            <div className="max-w-6xl mx-auto px-4 py-6">
              <div className="flex flex-col gap-2">
                <p
                  className="text-xs font-semibold uppercase tracking-wider text-amber-500"
                >
                  Clinical documentation aid only — not a medical device
                </p>
                <p
                  className="text-xs leading-relaxed text-white/45"
                >
                  Verify every score and generated text against the patient and source guidelines
                  before entering into the medical record. Do not enter PHI into this application.
                  This tool does not replace clinical judgement. Open source, MIT licensed.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
