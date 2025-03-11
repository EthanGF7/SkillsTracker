import { Rocket } from "lucide-react"

export default function Header() {
  return (
    <div className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-sm border-b border-gray-200 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center h-16">
          <div className="flex items-center text-indigo-600 text-xl font-semibold">
            <Rocket className="w-6 h-6 mr-2" />
            SkillsTracker
          </div>
        </div>
      </div>
    </div>
  )
}

