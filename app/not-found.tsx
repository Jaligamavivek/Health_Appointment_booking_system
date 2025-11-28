"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-slate-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-slate-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 text-center max-w-2xl">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-slate-800 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-slate-700 mb-4">Page Not Found</h2>
          <p className="text-lg text-slate-600 mb-8">
            Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Link href="/">
            <Button className="bg-slate-800 hover:bg-slate-900 text-white shadow-lg hover:shadow-xl transition-all">
              ← Back to Home
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" className="border-slate-300 hover:bg-slate-50">
              Go to Dashboard
            </Button>
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-6">
          <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm">
            <div className="text-3xl mb-2">🏠</div>
            <h3 className="font-semibold text-slate-800 mb-1">Home</h3>
            <p className="text-sm text-slate-600">Return to homepage</p>
          </div>
          <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm">
            <div className="text-3xl mb-2">📅</div>
            <h3 className="font-semibold text-slate-800 mb-1">Book</h3>
            <p className="text-sm text-slate-600">Schedule appointment</p>
          </div>
          <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm">
            <div className="text-3xl mb-2">👤</div>
            <h3 className="font-semibold text-slate-800 mb-1">Account</h3>
            <p className="text-sm text-slate-600">Manage your profile</p>
          </div>
        </div>
      </div>
    </div>
  )
}
