import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | DigiPlus IT — AI Service Desk",
    default: "DigiPlus IT — AI Service Desk",
  },
  description:
    "AI-powered IT support desk for DigiPlus IT — intelligent incident triage, KB article matching, and duplicate detection.",
  keywords: ["service desk", "IT support", "AI triage", "incident management", "DigiPlus IT"],
};

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-surface-600 hover:text-surface-900 text-sm font-medium transition-colors duration-150 px-3 py-1.5 rounded-full hover:bg-surface-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
    >
      {children}
    </Link>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-white text-surface-900">
        {/* Navigation — frosted nav, brand-primary left, plain links right, no CTA */}
        <nav className="sticky top-0 z-50 h-16 bg-white/80 backdrop-blur-md border-b border-surface-200/70 shadow-nav">
          <div className="max-w-7xl mx-auto px-5 h-full flex items-center justify-between">
            {/* Brand — DigiPlus IT primary, AI Service Desk secondary */}
            <Link
              href="/"
              className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
            >
              <span
                className="flex items-center justify-center w-7 h-7 rounded-md shrink-0"
                style={{ background: "#F25533" }}
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-white"
                >
                  <path
                    d="M10 2L3 7v6l7 5 7-5V7L10 2z"
                    fill="currentColor"
                    opacity="0.9"
                  />
                </svg>
              </span>
              <span className="flex flex-col leading-none">
                <span className="text-sm font-bold tracking-tight text-surface-900">
                  DigiPlus IT
                </span>
                <span className="text-[10px] font-medium text-surface-400 tracking-wide">
                  AI Service Desk
                </span>
              </span>
            </Link>

            {/* Nav links — plain text, no CTA button in nav */}
            <div className="hidden md:flex items-center gap-1">
              <NavLink href="/">Dashboard</NavLink>
              <NavLink href="/incidents/new">New Incident</NavLink>
              <NavLink href="/kb">Knowledge Base</NavLink>
            </div>

            {/* Right slot — intentionally empty; CTA lives in page headers only */}
            <div className="w-[120px]" />
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-5 py-10">{children}</main>

        {/* Footer */}
        <footer className="border-t border-surface-100 mt-20 py-8">
          <div className="max-w-7xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-surface-400">
            <span className="font-medium text-surface-500">
              DigiPlus IT &mdash; AI Service Desk
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
