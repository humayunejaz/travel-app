"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plane, Users, MapPin, Calendar, Mail, Shield, Gift } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function HeroSection() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [invitationId, setInvitationId] = useState<string | null>(null)
  const [showInvitationAlert, setShowInvitationAlert] = useState(false)

  useEffect(() => {
    const invitation = searchParams.get("invitation")
    if (invitation) {
      setInvitationId(invitation)
      setShowInvitationAlert(true)
    }
  }, [searchParams])

  const handleInvitationAccept = async () => {
    if (invitationId) {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push(`/auth?invitation=${invitationId}`)
    }
  }

  const authLink = invitationId ? `/auth?invitation=${invitationId}` : "/auth"

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center space-x-2">
              <Plane className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Travel App</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href={authLink}>Sign In</Link>
              </Button>
              <Button asChild>
                <Link href={authLink}>Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Invitation Alert */}
      {showInvitationAlert && (
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
          <Alert className="border-blue-200 bg-blue-50">
            <Gift className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>You've been invited to collaborate on a trip!</strong> Sign up or sign in to accept your
              invitation and start planning together.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Plan Your Adventures
            <span className="text-blue-600"> Together</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            Create trips, invite friends and colleagues, and collaborate on your travel plans. Whether you're planning a
            family vacation or organizing corporate travel, we make it easy.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            {invitationId ? (
              <Button size="lg" onClick={handleInvitationAccept}>
                Accept Invitation
              </Button>
            ) : (
              <Button size="lg" asChild>
                <Link href={authLink}>Start Planning</Link>
              </Button>
            )}
            <Button variant="outline" size="lg" asChild>
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div id="features" className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                <Users className="h-5 w-5 flex-none text-blue-600" />
                Collaborate with Anyone
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">
                  Invite friends, family, or colleagues to collaborate on your trips. Share planning responsibilities
                  and make decisions together.
                </p>
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                <MapPin className="h-5 w-5 flex-none text-blue-600" />
                Organize Destinations
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">
                  Add multiple destinations, set dates, and organize all your travel details in one place. Keep
                  everything structured and accessible.
                </p>
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                <Mail className="h-5 w-5 flex-none text-blue-600" />
                Email Invitations
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">
                  Send email invitations to collaborators with personalized messages. They can accept or decline with
                  just one click.
                </p>
              </dd>
            </div>
          </dl>
        </div>

        {/* How It Works */}
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">How It Works</h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              Get started in minutes and start collaborating on your next adventure
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                  <Plane className="h-6 w-6 text-white" />
                </div>
                <CardTitle>1. Create Your Trip</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Add destinations, dates, and trip details. Set privacy preferences and describe your adventure.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <CardTitle>2. Invite Collaborators</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Send email invitations to friends, family, or colleagues. Set their permissions and add personal
                  messages.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <CardTitle>3. Plan Together</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Collaborate on trip details, make decisions together, and keep everyone in the loop throughout the
                  planning process.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mx-auto mt-16 max-w-2xl text-center sm:mt-20 lg:mt-24">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Ready to Start Planning?</h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Join thousands of travelers who are already using our platform to plan amazing trips together.
          </p>
          <div className="mt-8 flex items-center justify-center gap-x-6">
            {invitationId ? (
              <Button size="lg" onClick={handleInvitationAccept}>
                Accept Your Invitation
              </Button>
            ) : (
              <Button size="lg" asChild>
                <Link href={authLink}>Create Your First Trip</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Plane className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-semibold text-gray-900">Travel App</span>
            </div>
            <div className="flex items-center space-x-6">
              <Shield className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">Secure & Private</span>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center">
            <p className="text-sm text-gray-500">© 2024 Travel App. Built for travelers, by travelers.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
