export function NoScriptReveal() {
	return (
		<noscript>
			<style>
				{
					"[data-motion]{opacity:1!important;transform:none!important;clip-path:none!important}"
				}
			</style>
		</noscript>
	);
}
