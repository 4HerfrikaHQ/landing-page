export default function UnauthorizedPage() {
	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="text-center space-y-2">
				<h1 className="text-4xl font-bold">403</h1>
				<p className="text-muted-foreground">
					You do not have permission to view this page.
				</p>
			</div>
		</div>
	);
}
