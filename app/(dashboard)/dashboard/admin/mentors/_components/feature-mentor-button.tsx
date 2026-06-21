"use client";

import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/utils/cn";
import { Star } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { setFeaturedMentor } from "../_actions";

export function FeatureMentorButton({
	id,
	isFeatured,
	eligible = true,
}: {
	id: string;
	isFeatured: boolean;
	/** A mentor must be active and have a photo before it can be featured. */
	eligible?: boolean;
}) {
	const router = useRouter();

	const feature = useAction(setFeaturedMentor, {
		onSuccess: () => {
			toast.success("Mentor featured");
			router.refresh();
		},
		onError: ({ error }) =>
			toast.error(error.serverError ?? "Failed to feature mentor"),
	});

	const tooltip = !eligible
		? "Add a photo and set the mentor active to feature them"
		: isFeatured
			? "Currently featured"
			: "Feature this mentor";

	return (
		<Tooltip>
			<TooltipTrigger
				render={
					<Button
						variant="ghost"
						size="icon"
						onClick={() => eligible && feature.execute({ mentorId: id })}
						disabled={feature.isPending || isFeatured || !eligible}
					/>
				}
			>
				<Star
					className={cn(
						"size-4",
						isFeatured
							? "fill-primary-500 text-primary-500"
							: eligible
								? "text-gray-400"
								: "text-gray-300",
					)}
				/>
			</TooltipTrigger>
			<TooltipContent>{tooltip}</TooltipContent>
		</Tooltip>
	);
}
