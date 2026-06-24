import { NextRequest, NextResponse } from "next/server"
import { SubscriptionPlanService } from "../../modules/subscription_plans/subscription_plans.service"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const subscriptionPlan = await SubscriptionPlanService.getById(id)
    return NextResponse.json(subscriptionPlan)
  } catch {
    return NextResponse.json({ error: "Subscription plan not found" }, { status: 404 })
  }
}