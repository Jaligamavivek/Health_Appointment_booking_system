"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="space-y-2 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">H</span>
              </div>
              <h1 className="text-2xl font-bold text-neutral-900">HealthCare</h1>
            </div>
            <div className="text-6xl mb-4">✅</div>
            <CardTitle className="text-2xl text-green-600">Account Created!</CardTitle>
            <CardDescription className="text-center">
              We've sent you a confirmation email. Please check your inbox and click the verification link to activate your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Next Steps:</h3>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Check your email inbox</li>
                <li>2. Click the verification link</li>
                <li>3. Return here to sign in</li>
              </ol>
            </div>
            <div className="text-center">
              <Link href="/auth/login">
                <Button className="w-full">
                  Go to Sign In
                </Button>
              </Link>
            </div>
            <div className="text-center text-sm text-neutral-600">
              Didn't receive an email? Check your spam folder or{" "}
              <Link href="/auth/sign-up" className="text-blue-600 hover:underline">
                try signing up again
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}