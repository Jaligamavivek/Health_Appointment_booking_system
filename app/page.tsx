import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <span className="text-xl font-bold text-slate-900">HealthCare</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-slate-700 hover:text-slate-900">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button className="bg-slate-900 hover:bg-slate-800 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block mb-6">
              <span className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                Premium Healthcare Management Platform
              </span>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
              Healthcare Made
              <span className="block text-slate-600">Simple & Accessible</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
              Connect with qualified healthcare professionals, manage appointments seamlessly, and access your medical records anytime, anywhere.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/auth/sign-up">
                <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-6 text-lg">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline" className="border-2 border-slate-300 hover:border-slate-900 px-8 py-6 text-lg">
                  Sign In
                </Button>
              </Link>
            </div>
            <p className="text-sm text-slate-500 mt-6">No credit card required • Free forever</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mt-20">
            <div className="text-center">
              <p className="text-4xl font-bold text-slate-900 mb-2">10,000+</p>
              <p className="text-slate-600">Active Patients</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-slate-900 mb-2">500+</p>
              <p className="text-slate-600">Healthcare Providers</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-slate-900 mb-2">98%</p>
              <p className="text-slate-600">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Everything You Need</h2>
            <p className="text-xl text-slate-600">Comprehensive healthcare management in one platform</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "📅",
                title: "Easy Scheduling",
                description: "Book appointments with your preferred doctors in just a few clicks. Real-time availability and instant confirmation."
              },
              {
                icon: "💊",
                title: "Digital Prescriptions",
                description: "Receive and manage prescriptions digitally. Access your medication history anytime from any device."
              },
              {
                icon: "📋",
                title: "Medical Records",
                description: "All your health records in one secure place. Share with doctors instantly when needed."
              },
              {
                icon: "🔔",
                title: "Smart Reminders",
                description: "Never miss an appointment with automated email and SMS reminders sent before your visit."
              },
              {
                icon: "⭐",
                title: "Doctor Ratings",
                description: "Read reviews and ratings from other patients to make informed decisions about your healthcare."
              },
              {
                icon: "🔒",
                title: "Secure & Private",
                description: "Your data is encrypted and protected with industry-standard security. HIPAA compliant."
              }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl border border-slate-200 hover:shadow-lg transition-shadow">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-xl text-slate-600">Get started in three simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Create Account",
                description: "Sign up in seconds with your email. No credit card required to get started."
              },
              {
                step: "02",
                title: "Find Your Doctor",
                description: "Browse our network of qualified healthcare professionals and read patient reviews."
              },
              {
                step: "03",
                title: "Book Appointment",
                description: "Choose your preferred time slot and get instant confirmation. It's that simple!"
              }
            ].map((step, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  {step.step}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">What Our Users Say</h2>
            <p className="text-xl text-slate-600">Trusted by thousands of patients and doctors</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Patient",
                content: "HealthCare has made managing my appointments so much easier. The digital prescriptions feature is a game-changer!",
                rating: 5
              },
              {
                name: "Dr. Michael Chen",
                role: "Cardiologist",
                content: "As a doctor, this platform helps me manage my schedule efficiently and provide better care to my patients.",
                rating: 5
              },
              {
                name: "Emily Rodriguez",
                role: "Patient",
                content: "I love how I can access all my medical records in one place. The interface is intuitive and easy to use.",
                rating: 5
              }
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl border border-slate-200">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-amber-400 text-xl">★</span>
                  ))}
                </div>
                <p className="text-slate-700 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div>
                  <p className="font-bold text-slate-900">{testimonial.name}</p>
                  <p className="text-sm text-slate-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-slate-900 rounded-3xl p-12 text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-slate-300 mb-8">
              Join thousands of satisfied users managing their healthcare with ease
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/auth/sign-up">
                <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 px-8 py-6 text-lg">
                  Create Free Account
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-slate-900 font-bold">H</span>
                </div>
                <span className="font-bold text-lg">HealthCare</span>
              </div>
              <p className="text-slate-400 text-sm">
                Premium healthcare management platform for modern patients and doctors.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400 text-sm">
            <p>© 2024 HealthCare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
