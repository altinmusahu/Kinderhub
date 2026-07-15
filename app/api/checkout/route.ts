import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import Stripe from "stripe"
import { stripe } from "@/lib/stripe"
import { TenantService } from "@/app/api/modules/tenants/tenant.service"
import { SubscriptionPlanService } from "@/app/api/modules/subscription_plans/subscription_plans.service"
import { TenantSubscriptionService } from "@/app/api/modules/tenant_subscriptions/tenant_subscriptions.service"
import { TenantSubscriptionRepository } from "@/app/api/modules/tenant_subscriptions/tenant_subscriptions.repository"

// Managed Payments is a preview feature — not yet reflected in the installed Stripe SDK's
// TypeScript types, so the extra params are passed through an untyped params object.
const STRIPE_MANAGED_PAYMENTS_VERSION = "2026-02-25.preview"

const bodySchema = z.object({
  tenant_id: z.uuid(),
  plan_id: z.uuid(),
  auto_renew: z.boolean(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = bodySchema.parse(body)

    const [tenant, plan] = await Promise.all([
      TenantService.getByIdAsAdmin(parsed.tenant_id),
      SubscriptionPlanService.getById(parsed.plan_id),
    ])

    if (!plan.is_active) {
      return NextResponse.json({ message: "This plan is no longer available" }, { status: 400 })
    }

    const priceId = await SubscriptionPlanService.getOrCreateStripePriceId(plan)

    let stripeCustomerId = tenant.stripe_customer_id
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        name: tenant.name,
        metadata: { tenant_id: tenant.id },
      })
      stripeCustomerId = customer.id
      await TenantService.setStripeCustomerIdAsAdmin(tenant.id, stripeCustomerId)
    }

    const today = new Date()
    const nextYear = new Date(today)
    nextYear.setFullYear(today.getFullYear() + 1)
    const fmt = (d: Date) => d.toISOString().split("T")[0]

    const pendingSubscription = await TenantSubscriptionService.create({
      tenant_id: tenant.id,
      plan_id: plan.id,
      status: "pending",
      starts_at: fmt(today),
      ends_at: fmt(nextYear),
      price_at_purchase: plan.yearly_price,
      auto_renew: parsed.auto_renew,
      created_at: fmt(today),
      stripe_checkout_session_id: null,
      stripe_subscription_id: null,
    })

    const origin = req.nextUrl.origin

    const sessionParams = {
      mode: "payment",
      customer: stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      managed_payments: { enabled: true },
      success_url: `${origin}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/subscribe?plan_id=${plan.id}`,
      metadata: {
        tenant_id: tenant.id,
        plan_id: plan.id,
        tenant_subscription_id: pendingSubscription.id,
      },
    }

    const session = await stripe.checkout.sessions.create(
      sessionParams as Stripe.Checkout.SessionCreateParams,
      { apiVersion: STRIPE_MANAGED_PAYMENTS_VERSION } as Stripe.RequestOptions
    )

    await TenantSubscriptionRepository.setStripeCheckoutSessionId(pendingSubscription.id, session.id)

    return NextResponse.json({ url: session.url })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message ?? "Invalid request" }, { status: 400 })
    }
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Something went wrong" },
      { status: 400 }
    )
  }
}
