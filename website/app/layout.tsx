import type { Metadata } from "next";
import { JetBrains_Mono, Inter, Figtree, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const spaceGroteskHeading = Space_Grotesk({subsets:['latin'],variable:'--font-heading'});

const figtree = Figtree({subsets:['latin'],variable:'--font-sans'});

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
			className={cn("antialiased", geistSans.variable, geistMono.variable, "font-sans", figtree.variable, spaceGroteskHeading.variable)}
		>
			<body>{children}</body>
		</html>
	);
}
