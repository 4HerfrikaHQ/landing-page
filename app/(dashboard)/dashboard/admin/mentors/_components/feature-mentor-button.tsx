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
}: {
	id: string;
	isFeatured: boolean;
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

	return (
		<Tooltip>
			<TooltipTrigger
				render={
					<Button
						variant="ghost"
						size="icon"
						onClick={() => feature.execute({ mentorId: id })}
						disabled={feature.isPending || isFeatured}
					/>
				}
			>
				<Star
					className={cn(
						"size-4",
						isFeatured ? "fill-primary-500 text-primary-500" : "text-gray-400",
					)}
				/>
			</TooltipTrigger>
			<TooltipContent>
				{isFeatured ? "Currently featured" : "Feature this mentor"}
			</TooltipContent>
		</Tooltip>
	);
}
