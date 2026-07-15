import Link from "next/link"

type Props = {
  searchParams: Promise<{ session_id?: string }>
}

export default async function SubscribeSuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center px-4 py-16">
      <div className="w-full max-w-md text-center py-12">
        <div className="text-5xl mb-4">✓</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment received!</h1>
        <p className="text-gray-500 mb-1">
          Your subscription is now active. A confirmation has been sent to your email.
        </p>
        {session_id && (
          <p className="text-gray-300 text-xs mt-4 font-mono break-all">Checkout session: {session_id}</p>
        )}
        <Link
          href="/"
          className="mt-8 inline-block text-indigo-600 font-semibold hover:underline"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  )
}
