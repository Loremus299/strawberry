import type { Metadata } from "next";
import { Figtree, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ToastProvider } from "@/components/ui/toast";

const spaceGroteskHeading = Space_Grotesk({
	subsets: ["latin"],
	variable: "--font-heading",
});

const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
	title: "Strawberry",
	description: "Observability, for logs that matter.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html
			lang="en"
			className={cn(
				"antialiased dark",
				"font-sans",
				figtree.variable,
				spaceGroteskHeading.variable,
			)}
		>
			<body>
				<ToastProvider>{children}</ToastProvider>
			</body>
		</html>
	);
}
