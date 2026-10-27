export default function Navbar() {
	return (
		<div className="border-b absolute w-full bg-black">
			<main className="p-4">
				<div>
					<p>
						<span className="text-primary">Strawberry</span>
						<span className="text-muted-foreground portrait:hidden">
							{" "}
							- Observability, for logs that matter.
						</span>
					</p>
				</div>
			</main>
		</div>
	);
}
