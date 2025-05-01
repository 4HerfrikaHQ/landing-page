"use client";

import type { counsellingMentors } from "@/utils/details";
import { format, parseISO } from "date-fns";
import Image from "next/image";
import { type ReactNode, createContext, useContext, useState } from "react";
import { IoMdClose } from "react-icons/io";

// Define the mentor type
type Mentor = (typeof counsellingMentors)[0];

// Create context for modal state
type ModalContextType = {
	isOpen: boolean;
	mentor: Mentor | null;
	openModal: (mentor: Mentor) => void;
	closeModal: () => void;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

// Provider component
export function ModalProvider({ children }: { children: ReactNode }) {
	const [isOpen, setIsOpen] = useState(false);
	const [mentor, setMentor] = useState<Mentor | null>(null);

	const openModal = (mentor: Mentor) => {
		setMentor(mentor);
		setIsOpen(true);
		document.body.style.overflow = "hidden"; // Prevent scrolling when modal is open
	};

	const closeModal = () => {
		setIsOpen(false);
		document.body.style.overflow = "auto"; // Re-enable scrolling
	};

	return (
		<ModalContext.Provider value={{ isOpen, mentor, openModal, closeModal }}>
			{children}
		</ModalContext.Provider>
	);
}

// Custom hook to use the modal context
function useModal() {
	const context = useContext(ModalContext);
	if (context === undefined) {
		throw new Error("useModal must be used within a ModalProvider");
	}
	return context;
}

// Trigger component
function Trigger({
	mentor,
	children,
	className,
}: { mentor: Mentor; children: ReactNode; className?: string }) {
	const { openModal } = useModal();
	return (
		<button
			type="button"
			onClick={() => openModal(mentor)}
			className={className}
		>
			{children}
		</button>
	);
}

// Format time helper function
function formatTime(timeString: string) {
	try {
		const date = parseISO(timeString);
		return format(date, "h:mm a");
	} catch (error) {
		console.log("Error parsing time:", error);
		return timeString;
	}
}

// Modal component
function Modal() {
	const { isOpen, mentor, closeModal } = useModal();

	if (!isOpen || !mentor) return null;

	const displayName = mentor.nickname || mentor.name;

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
		<div
			className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 sm:p-6 md:p-8 z-50"
			onClick={closeModal}
		>
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
			<div
				className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] relative overflow-y-auto animate-in fade-in duration-300"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Close button */}
				<button
					type="button"
					onClick={closeModal}
					className="absolute top-4 right-4 rounded-full p-1 hover:bg-gray-100 transition-colors"
					aria-label="Close"
				>
					<IoMdClose className="h-6 w-6" />
				</button>
				{/* Content */}
				<div className="p-6 sm:p-8 lg:p-16">
					<h2 className="text-2xl capitalize sm:text-3xl lg:text-4xl font-bold text-center text-primary-500 mb-6 lg:mb-10">
						{displayName}
					</h2>

					<div className="grid lg:grid-cols-2 gap-6 lg:gap-16">
						{/* Profile Image */}
						<div className="flex justify-center">
							<div className="w-full max-w-md rounded-md shadow-md relative aspect-[3/4] h-[300px] sm:h-[400px]">
								<Image
									src={mentor.image}
									alt={mentor.name}
									fill
									className="rounded-md object-cover object-top"
									quality={100}
									priority
									style={{
										imageRendering: "crisp-edges",
										WebkitFontSmoothing: "antialiased",
									}}
								/>
							</div>
						</div>

						{/* Profile Information */}
						<div className="flex flex-col">
							<div>
								<h3 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2">
									{mentor.position}
								</h3>

								{/* Display Availability */}
								{mentor.availability && mentor.availability.length > 0 ? (
									<div className="mb-4">
										<h4 className="text-primary-500 text-xs font-medium mb-2">
											Available times:
										</h4>
										<p className="text-gray-700 text-xs">
											{mentor.availability.map((slot, index) => (
												<span key={formatTime(slot.time.start)}>
													{`${slot.day}, ${formatTime(slot.time.start)} - ${formatTime(slot.time.end)} ${slot.timezone}`}
													{index < mentor.availability.length - 2 ? ", " : ""}
													{index === mentor.availability.length - 2
														? " and "
														: ""}
												</span>
											))}
										</p>
									</div>
								) : (
									<div className="mb-4">
										<h4 className="text-primary-500 font-medium mb-2">
											Available times:
										</h4>
										<p className="text-gray-700">Not Mentioned</p>
									</div>
								)}

								<div className="text-gray-600 text-sm">
									{mentor.bio ? (
										<p className="whitespace-pre-line">{mentor.bio}</p>
									) : (
										<p className="whitespace-pre-line">
											More information about this mentor will be available soon.
										</p>
									)}
								</div>
							</div>

							<div className="flex flex-col items-center sm:flex-row gap-4 sm:gap-6 mt-6">
								<a
									href={mentor.linkedinUrl || "/"}
									className="text-primary-500 hover:text-primary-600 transition-colors font-medium text-base lg:text-lg"
								>
									Message on LinkedIn
								</a>
								<a
									href={mentor.bookingUrl || "/"}
									className="bg-primary-500 text-white py-2 sm:py-3 px-6 sm:px-8 rounded-full text-center font-medium hover:bg-primary-600 transition-colors text-base lg:text-lg w-full sm:w-auto"
								>
									Book a call
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

const MentorDetailsModal = () => {
	return <Modal />;
};

export { Trigger };

export default MentorDetailsModal;
