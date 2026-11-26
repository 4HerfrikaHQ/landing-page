import type { ReactNode } from "react";

function RollLabel({ children }: { children: ReactNode }) {
	return (
		<span className="roll">
			<span>{children}</span>
			<span aria-hidden="true">{children}</span>
		</span>
	);
}

export { RollLabel };
