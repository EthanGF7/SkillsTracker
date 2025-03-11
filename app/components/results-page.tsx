"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Rocket } from "lucide-react"
import Dashboard from "./dashboard"
import LoadingMicroretos from "./loading-microretos"

interface ResultsPageProps {
  results: Record<string, string>
  onBack: () => void
}

const LEVEL_INFO = {
  aprendiz: {
    title: "Aprendiz",
    description: "Descubriendo el mundo de esta habilidad",
    emoji: "🐥",
    bgColor: "bg-[#FFF7E6]",
    textColor: "text-[#8B6F47]",
  },
  explorador: {
    title: "Explorador",
    description: "Ya tienes algo de experiencia y te manejas bien",
    emoji: "🚀",
    bgColor: "bg-[#E6F2FF]",
    textColor: "text-[#2E7CF6]",
  },
  maestro: {
    title: "Maestro",
    description: "Dominas la habilidad y puedes enseñar a otros",
    emoji: "⭐️",
    bgColor: "bg-[#FFE6F0]",
    textColor: "text-[#FF4081]",
  },
  leyenda: {
    title: "Leyenda",
    description: "Innovas y marcas la diferencia en el campo",
    emoji: "🏆",
    bgColor: "bg-[#E6FFF0]",
    textColor: "text-[#00C853]",
  },
}

export default function ResultsPage({ results, onBack }: ResultsPageProps) {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [skillLevels, setSkillLevels] = useState<Record<string, string>>(results)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedChallenges, setGeneratedChallenges] = useState<Record<string, any> | null>(null)

  const handleSkillSelection = (skill: string, level: string) => {
    setSelectedSkills(prev => {
      if (prev.includes(skill)) {
        return prev.filter(s => s !== skill)
      }
      return [...prev, skill]
    })
    setSkillLevels(prev => ({
      ...prev,
      [skill]: level
    }))
  }

  const handleChallengesGenerated = (challenges: Record<string, any>) => {
    setGeneratedChallenges(challenges)
    setIsGenerating(false)
  }

  const startGeneratingChallenges = () => {
    setIsGenerating(true)
  }

  if (generatedChallenges) {
    return <Dashboard selectedSkills={selectedSkills} skillLevels={skillLevels} initialChallenges={generatedChallenges} />
  }

  if (isGenerating) {
    return (
      <LoadingMicroretos
        selectedSkills={selectedSkills}
        skillLevels={skillLevels}
        onComplete={handleChallengesGenerated}
      />
    )
  }

  const [showDashboard, setShowDashboard] = useState(false)

  if (showDashboard) {
    return <Dashboard selectedSkills={Object.keys(skillLevels)} skillLevels={skillLevels} />
  }

  const skillCount = Object.keys(skillLevels).length
  const rowCount = Math.ceil(skillCount / 4)

  // Calculate the number of cards in the last row
  const lastRowCount = skillCount % 4 || 4

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAFF] to-[#F0F4FF]">
      {/* Header */}
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

      <div className="container mx-auto px-6 pt-24 pb-8">
        <div className="max-w-[1000px] mx-auto">
          {/* Title */}
          <h1 className="text-2xl font-semibold text-center text-indigo-900 mb-8">Tus Resultados</h1>

          {/* Main Content Card */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            {/* Congratulations Message */}
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-indigo-600 mb-4">¡Enhorabuena! 🎉</h2>
              <p className="text-lg text-gray-600 mb-2">
                Ahora, solo queda practicar y llevar tus habilidades al siguiente nivel. 🚀
              </p>
              <p className="text-sm text-gray-600">
                Parece que hay trabajo por hacer, pero ya tienes nociones sobre las habilidades que quieres mejorar.
                <br />
                ¡Sigamos avanzando!
              </p>
            </div>

            {/* Skills Grid - With responsive rows */}
            <div className="flex flex-col items-center gap-6 mb-12">
              {Array.from({ length: rowCount }).map((_, rowIndex) => {
                const isLastRow = rowIndex === rowCount - 1
                const itemsInThisRow = isLastRow ? lastRowCount : 4
                const startIndex = rowIndex * 4
                const rowItems = Object.entries(skillLevels).slice(startIndex, startIndex + 4)

                return (
                  <div
                    key={rowIndex}
                    className="grid gap-6"
                    style={{
                      gridTemplateColumns: `repeat(${itemsInThisRow}, minmax(220px, 1fr))`,
                      maxWidth: `${Math.min(itemsInThisRow * 236, 944)}px`, // 220px card + 16px gap
                    }}
                  >
                    {rowItems.map(([skill, level]) => {
                      const levelInfo = LEVEL_INFO[level as keyof typeof LEVEL_INFO]
                      const levelNumber = Object.keys(LEVEL_INFO).indexOf(level) + 1
                      return (
                        <Card
                          key={skill}
                          className="w-[220px] p-6 flex flex-col items-center text-center border-2 border-indigo-200"
                        >
                          <h3 className="font-bold text-indigo-600 mb-4">{skill}</h3>
                          <div
                            className={`w-20 h-20 rounded-full ${levelInfo.bgColor} flex items-center justify-center mb-4`}
                          >
                            <span className="text-4xl">{levelInfo.emoji}</span>
                          </div>
                          <div className="space-y-1 mb-4">
                            <div className="font-bold text-indigo-600">Nivel {levelNumber}</div>
                            <div className="font-bold text-indigo-600">{levelInfo.title}</div>
                          </div>
                          <p className="text-sm text-black">{levelInfo.description}</p>
                        </Card>
                      )
                    })}
                  </div>
                )
              })}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <Button
                onClick={onBack}
                variant="ghost"
                className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
              >
                Anterior
              </Button>
              <Button 
                onClick={() => setShowDashboard(true)}
                className="px-8 bg-indigo-600 hover:bg-indigo-700 rounded-full"
              >
                Crear plan personalizado
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
