import InstallPackage from "@/components/badcn/installPackage";
import Navbar from "@/components/nav";
import Image from "next/image";

export default function Page() {
	return (
		<div>
			<Navbar />
			<div className="grid grid-cols-2 portrait:grid-cols-1 h-screen">
				<div className="h-full">
					<div className="pl-4 pr-4 pb-4 grid items-end h-full">
						<div className="grid gap-4">
							<div className="flex gap-4">
								<Image
									src={"logo.svg"}
									width={500}
									height={500}
									alt="logo"
									className="size-9"
								/>
								<h1 className="text-4xl text-primary">Strawberry</h1>
							</div>
							<div>Observability, for logs that matter.</div>
							<InstallPackage
								command="@loremus299/strawberry"
								copyPrompt="Nice :3"
								className="w-full"
							/>
						</div>
					</div>
				</div>
				<div className="bg-black h-full border-l portrait:hidden">
					<div className="mt-18 pl-4">
						<p>Because logs tell a story of request.</p>
					</div>
				</div>
			</div>
		</div>
	);
}
