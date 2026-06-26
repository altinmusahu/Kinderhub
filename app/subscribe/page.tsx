import { notFound } from "next/navigation"
import SubscribeForm from "./SubscribeForm"
import Link from "next/link"
import { SubscriptionPlanService } from '@/app/api/modules/subscription_plans/subscription_plans.service'

type Props = {
  searchParams: Promise<{ plan_id?: string }>
}

export default async function SubscribePage({ searchParams }: Props) {
  const { plan_id } = await searchParams

  if (!plan_id) notFound()

  const res = await SubscriptionPlanService.getById(plan_id)

  if (!res) notFound()

  const plan = res;

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <Link href="/" className="text-sm text-indigo-600 hover:underline mb-6 inline-block">
          ← Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete your subscription</h1>
        <p className="text-gray-500 text-sm mb-8">
          Fill in your organization details to get started.
        </p>
        <SubscribeForm
          planId={plan.id}
          planName={plan.Name}
          yearlyPrice={plan.yearly_price}
        />
      </div>
    </div>
  )
}
