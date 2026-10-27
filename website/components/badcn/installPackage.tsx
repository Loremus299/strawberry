"use client";
import { ComponentProps, useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Copy } from "lucide-react";
import { toast } from "../ui/toast";
import { cn } from "@/lib/utils";

const packageManagers = {
	npm: "npm install",
	pnpm: "pnpm add",
	yarn: "yarn add",
	bun: "bun add",
};

function prefix(option: keyof typeof packageManagers) {
	return packageManagers[option];
}

type Props = ComponentProps<"div"> & { command: string; copyPrompt: string };

export default function InstallPackage({
	command,
	copyPrompt,
	className,
}: Props) {
	const [currentOption, setCurrentOption] =
		useState<keyof typeof packageManagers>("npm");
	const url = useRef("");

	useEffect(() => {
		const lastOption = window.localStorage.getItem("option");

		if (lastOption) {
			setCurrentOption(lastOption as keyof typeof packageManagers);
			url.current = packageManagers[currentOption] + ` ${command}`;
		}
	}, [command, currentOption]);

	return (
		<div className={cn("bg-card p-2 border rounded-md grid gap-2", className)}>
			<div className="flex justify-between">
				<div className="flex gap-2">
					{Object.keys(packageManagers).map((item) => (
						<Button
							key={item}
							variant={"outline"}
							size={"xs"}
							className={"rounded-sm"}
							onClick={() => {
								setCurrentOption(item as keyof typeof packageManagers);
								window.localStorage.setItem(
									"option",
									item as keyof typeof packageManagers,
								);
							}}
						>
							{item}
						</Button>
					))}
				</div>
				<Button
					variant={"outline"}
					size={"icon-xs"}
					className={"rounded-sm"}
					onClick={async () => {
						try {
							await navigator.clipboard.writeText(url.current);
							toast.add({
								title: copyPrompt,
							});
						} catch {
							toast.add({ title: "Failed to copy data to clipboard" });
						}
					}}
				>
					<Copy />
				</Button>
			</div>
			<pre className="text-xs">
				{prefix(currentOption)} {command}
			</pre>
		</div>
	);
}
