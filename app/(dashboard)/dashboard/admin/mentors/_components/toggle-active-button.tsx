"use client";

import { Switch } from "@/components/ui/switch";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTransition } from "react";
import { toggleMentorActive } from "../_actions";
import { toast } from "sonner";

export function ToggleActiveButton({
	id,
	active,
}: {
	id: string;
	active: boolean;
}) {
	const [isPending, startTransition] = useTransition();

	function handleChange(checked: boolean) {
		startTransition(async () => {
      const { error } = await toggleMentorActive(id, checked);

      if (error) {
        toast.error(error)
      }
		});
	}

	return (
		<Tooltip>
			<TooltipTrigger
				render={<span className="inline-flex cursor-pointer" />}
			>
				<Switch
					checked={active}
					onCheckedChange={handleChange}
					disabled={isPending}
					size="sm"
				/>
			</TooltipTrigger>
			<TooltipContent>
				{active ? "Deactivate mentor" : "Activate mentor"}
			</TooltipContent>
		</Tooltip>
	);
}
