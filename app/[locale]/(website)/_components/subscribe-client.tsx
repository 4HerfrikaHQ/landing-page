"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@base-ui/react"
import { ArrowRight } from "lucide-react"
import { subscribeAction } from "./subscribe-action"

type SubscribeFormClientProps = {
  label: string
  placeholder: string
  description: string
}

export const SubscribeFormClient = ({ label, placeholder, description }: SubscribeFormClientProps) => {
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    startTransition(async () => {
      const result = await subscribeAction(formData)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Thanks for subscribing!")
        form.reset()
      }
    })
  }

  return (
    <div className="bg-muted/20 p-12 rounded-2xl md:mt-4 lg:-mt-8">
      <p className="font-bold text-white text-2xl">{label}</p>

      <div className="mx-auto mt-4 md:max-w-md sm:ms-0">
        <form className="mt-4" onSubmit={handleSubmit}>
          <div className="flex flex-row lg:items-start">
            <label htmlFor="email" className="sr-only">
              {placeholder}
            </label>

            <input
              id="email"
              name="email"
              className="bg-white w-full rounded-tl-md rounded-bl-md border-border px-6 py-3 shadow-sm placeholder:text-primary-500/60 focus:ring-primary-500 focus:border-primary-500 sm:max-w-xs"
              type="email"
              placeholder={placeholder}
              required
            />

            <Button
              className="rounded-br-md rounded-tr-md rounded-tl-none rounded-bl-none bg-primary-500/60 px-8 py-4 font-bold text-white hover:bg-primary-500/65 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={isPending}
            >
              <ArrowRight className="h-4 w-4 text-white" />
            </Button>
          </div>
          <p className="text-lg text-white/60 mt-2">{description}</p>
        </form>
      </div>
    </div>
  )
}
