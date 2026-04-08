import type { Metadata } from "next";
import { Geist_Mono, Space_Grotesk } from "next/font/google";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ThemeProvider } from "@/components/theme-provider";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
	variable: "--font-space-grotesk",
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	title: {
		default: SITE_NAME,
		template: `%s | ${SITE_NAME}`,
	},
	description: SITE_DESCRIPTION,
	openGraph: {
		type: "website",
		locale: "ko_KR",
		siteName: SITE_NAME,
		title: SITE_NAME,
		description: SITE_DESCRIPTION,
	},
	twitter: {
		card: "summary",
	},
	alternates: {
		canonical: "/",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ko" className="dark" suppressHydrationWarning>
			<head>
				<script
					dangerouslySetInnerHTML={{
						__html: `(function(){try{var t=localStorage.getItem("theme");if(t==="light"){document.documentElement.classList.remove("dark");document.documentElement.classList.add("light")}else{document.documentElement.classList.add("dark");document.documentElement.classList.remove("light")}}catch(e){}})()`,
					}}
				/>
				<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
				<link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
				<link
					rel="stylesheet"
					href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.8/dist/web/static/pretendard.css"
					crossOrigin="anonymous"
				/>
			</head>
			<body
				className={`${spaceGrotesk.variable} ${geistMono.variable} antialiased flex min-h-screen flex-col bg-surface text-on-surface`}
				style={{ fontFamily: "'Pretendard', 'Inter', sans-serif" }}
			>
				<ThemeProvider>
					<SiteHeader />
					<div className="flex-1">{children}</div>
					<SiteFooter />
				</ThemeProvider>
			</body>
		</html>
	);
}
