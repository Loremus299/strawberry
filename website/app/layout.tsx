import type { Metadata } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";

const geistSans = Inter({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = JetBrains_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Strawberry",
	description: "Observability, for logs that matter.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html
			lang="en"
			className={`${geistSans.variable} ${geistMono.variable} antialiased`}
		>
			<body>{children}</body>
		</html>
	);
}
