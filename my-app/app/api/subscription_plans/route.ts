import { NextResponse } from "next/server"
import { SubscriptionPlanService } from "../modules/subscription_plans/subscription_plans.service"

export async function GET() {
  try {
    const subscriptionPlans = await SubscriptionPlanService.getAll()
    return NextResponse.json(subscriptionPlans)
  } catch {
    return NextResponse.json({ error: "Failed to fetch subscription plans" }, { status: 500 })
  }
}