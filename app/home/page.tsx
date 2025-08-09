import { Suspense } from "react"
import HeroSection from "@/components/home/hero-section"

function HeroSectionWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <HeroSection />
    </Suspense>
  )
}

export default function HomePage() {
  return <HeroSectionWrapper />
}
