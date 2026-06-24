import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { UserService } from "@/app/api/modules/user/user.service"

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  lastname: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone_number: z.string().min(1, "Phone number is required"),
  personal_number: z.string().min(1, "Personal number is required"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
})

export async function POST(req: NextRequest) {
  try {
    const body = signupSchema.parse(await req.json())

    // Check if user already exists
    const existingUser = await UserService.findByEmail(body.email).catch(() => null)
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      )
    }

    // Create user using the existing service
    const user = await UserService.createFromSignup({
      name: body.name,
      lastname: body.lastname,
      email: body.email,
      password: body.password,
      phone_number: body.phone_number,
      personal_number: body.personal_number,
      date_of_birth: body.date_of_birth,
      role: "Admin",
      is_active: true,
    })

    return NextResponse.json(
      {
        message: "Account created successfully",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Signup failed" },
      { status: 400 }
    )
  }
}
