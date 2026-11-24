import WebLayout from "@/app/[locale]/(website)/layout";
import { NotFoundView } from "@/app/_components/not-found-view";

export default function NotFoundPage() {
	return (
		<WebLayout>
			<NotFoundView />
		</WebLayout>
	);
}
