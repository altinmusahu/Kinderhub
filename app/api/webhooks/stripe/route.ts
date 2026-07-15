import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { stripe } from "@/lib/stripe"
import { TenantSubscriptionService } from "@/app/api/modules/tenant_subscriptions/tenant_subscriptions.service"
import { TenantService } from "@/app/api/modules/tenants/tenant.service"

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const tenantSubscriptionId = session.metadata?.tenant_subscription_id
  if (!tenantSubscriptionId) return

  const subscription = await TenantSubscriptionService.getByStripeCheckoutSessionId(session.id)
  if (!subscription || subscription.status === "active") return

  const stripeSubscriptionId = typeof session.subscription === "string" ? session.subscription : null
  await TenantSubscriptionService.markActive(subscription.id, stripeSubscriptionId)

  const tenantId = session.metadata?.tenant_id
  const customerId = typeof session.customer === "string" ? session.customer : null
  if (tenantId && customerId) {
    await TenantService.setStripeCustomerIdAsAdmin(tenantId, customerId)
  }
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET is not configured" }, { status: 500 })
  }

  const signature = req.headers.get("stripe-signature")
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 })
  }

  const payload = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid signature"
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 })
  }

  try {
    if (event.type === "checkout.session.completed") {
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
    }
    return NextResponse.json({ received: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process webhook" },
      { status: 500 }
    )
  }
}
