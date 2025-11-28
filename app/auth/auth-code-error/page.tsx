import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="space-y-2 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-4xl">⚠️</span>
              </div>
            </div>
            <CardTitle className="text-2xl">Authentication Error</CardTitle>
            <CardDescription>There was an error verifying your email</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-neutral-600 text-center">
              The verification link may have expired or been used already. Please try signing up again or contact support if the problem persists.
            </p>
            <div className="space-y-2">
              <Link href="/auth/sign-up" className="block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Try Sign Up Again</Button>
              </Link>
              <Link href="/auth/login" className="block">
                <Button variant="outline" className="w-full">Back to Login</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
