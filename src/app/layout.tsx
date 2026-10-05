import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ThemeProvider } from "@/components/theme-provider";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";
import "./globals.css";

/* 서체 2패밀리 규율 (Lab Notebook)
   · Pretendard Variable — 본문·한글 제목 (CDN 동적 서브셋, 아래 <link>)
   · Geist Mono          — 실험 번호·날짜·태그 라벨, 숫자, 코드 */
const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
	display: "swap",
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
		<html lang="ko" className={`dark ${geistMono.variable}`} suppressHydrationWarning>
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
					href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
					crossOrigin="anonymous"
				/>
			</head>
			<body className="antialiased flex min-h-screen flex-col" suppressHydrationWarning>
				<ThemeProvider>
					<div className="app-frame flex flex-1 flex-col">
						<a
							href="#main"
							className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-on-surface focus:px-4 focus:py-2 focus:text-page"
						>
							본문으로 건너뛰기
						</a>
						<SiteHeader />
						<div id="main" className="flex-1">{children}</div>
						<SiteFooter />
					</div>
				</ThemeProvider>
			</body>
		</html>
	);
}
