export type PlanInfo = {
  code: string
  name: string
  description: string
  price: number
  features: string[]
  cta: string
  highlighted: boolean
}

export const PLANS: PlanInfo[] = [
  {
    code: "starter",
    name: "Starter",
    description: "Perfect for small kindergartens just getting started.",
    price: 320,
    features: [
      "Up to 35 children",
      "Attendance tracking",
      "Parent messaging",
      "10 staff accounts",
      "Email support",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    code: "growth",
    name: "Growth",
    description: "For growing schools that need more power and flexibility.",
    price: 790,
    features: [
      "Up to 100 children",
      "Advanced reports & analytics",
      "Parent portal",
      "Activity planning",
      "25 staff accounts",
      "Priority support",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    code: "enterprise",
    name: "Enterprise",
    description: "For large schools or groups with multiple locations.",
    price: 1590,
    features: [
      "Unlimited children",
      "Multiple locations",
      "Custom branding",
      "Unlimited staff accounts",
      "Dedicated account manager",
      "API access",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
]

export function getPlanByCode(code: string): PlanInfo | undefined {
  return PLANS.find(p => p.code === code)
}

export function getPlanByName(name: string): PlanInfo | undefined {
  return PLANS.find(p => p.name.toLowerCase() === name.toLowerCase())
}
