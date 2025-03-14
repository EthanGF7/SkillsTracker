"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Header from "./header"
import ResultsPage from "./results-page"

interface SkillAssessmentProps {
  selectedSkills: string[]
  onComplete: (assessments: Record<string, string>) => void
  onBack: () => void
}

// Definiciones de las habilidades
const SKILL_DEFINITIONS: Record<string, string> = {
  Asertividad: "La asertividad es una habilidad fundamental que permite expresar pensamientos, sentimientos y necesidades de manera clara, directa y respetuosa, manteniendo un equilibrio entre los derechos propios y los de los demás. Esta competencia es esencial para establecer relaciones interpersonales saludables y alcanzar objetivos personales y profesionales.",
  Liderazgo:
    "El liderazgo es la capacidad de inspirar, guiar y motivar a un grupo hacia un objetivo común con empatía y responsabilidad.",
  Organización:
    "La organización es la capacidad de planificar, estructurar y gestionar recursos de manera eficiente para alcanzar objetivos de forma ordenada y efectiva.",
  "Resolución de problemas":
    "La resolución de problemas es la capacidad de analizar situaciones, identificar soluciones efectivas y tomar decisiones para superar desafíos de manera creativa y eficiente.",
  Comunicación:
    "La comunicación es la habilidad de expresar ideas, pensamientos y sentimientos de manera clara y respetuosa, y también de escuchar y entender a los demás.",
  "Trabajo en equipo":
    "El trabajo en equipo es la capacidad de colaborar y coordinar esfuerzos con otras personas para alcanzar un objetivo común, fomentando la comunicación, el respeto y la cooperación.",
  Adaptabilidad:
    "La adaptabilidad es la capacidad de ajustarse a cambios y nuevas circunstancias de manera flexible y positiva, enfrentando desafíos con una actitud abierta y proactiva.",
  Empatía:
    "La empatía es la capacidad de comprender y compartir las emociones y perspectivas de los demás, demostrando sensibilidad, respeto y disposición para ayudar.",
  Creatividad:
    "La creatividad es la capacidad de generar ideas innovadoras, resolver problemas de manera original y encontrar nuevas formas de abordar desafíos con imaginación y pensamiento crítico.",
  "Gestión del tiempo":
    "La gestión del tiempo es la capacidad de organizar y priorizar tareas de manera eficiente, optimizando el uso del tiempo para cumplir objetivos y mantener un equilibrio entre responsabilidades y bienestar.",
}

const SKILL_LEVELS = [
  {
    id: "aprendiz",
    title: "Aprendiz",
    description: "Descubriendo el mundo de esta habilidad",
    emoji: "🐥",
    bgColor: "bg-[#FFF7E6]",
    iconColor: "text-[#FFB020]",
  },
  {
    id: "explorador",
    title: "Explorador",
    description: "Ya tienes algo de experiencia y te manejas bien.",
    emoji: "🚀",
    bgColor: "bg-[#E6F2FF]",
    iconColor: "text-[#2E7CF6]",
  },
  {
    id: "maestro",
    title: "Maestro",
    description: "Dominas la habilidad y puedes enseñar a otros.",
    emoji: "⭐️",
    bgColor: "bg-[#FFE6F0]",
    iconColor: "text-[#FF4081]",
  },
  {
    id: "leyenda",
    title: "Leyenda",
    description: "Innovas y marcas la diferencia en el campo.",
    emoji: "🏆",
    bgColor: "bg-[#E6FFF0]",
    iconColor: "text-[#00C853]",
  },
]

export default function SkillAssessment({ selectedSkills, onComplete, onBack }: SkillAssessmentProps) {
  const [currentSkillIndex, setCurrentSkillIndex] = useState(0)
  const [assessments, setAssessments] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)

  const handleSelectLevel = (level: string) => {
    setAssessments((prev) => ({
      ...prev,
      [selectedSkills[currentSkillIndex]]: level,
    }))
  }

  const handleNext = () => {
    if (currentSkillIndex < selectedSkills.length - 1) {
      setCurrentSkillIndex(currentSkillIndex + 1)
    } else {
      setShowResults(true)
    }
  }

  const handleBack = () => {
    if (showResults) {
      setShowResults(false)
    } else if (currentSkillIndex > 0) {
      setCurrentSkillIndex(currentSkillIndex - 1)
    } else {
      onBack()
    }
  }

  if (showResults) {
    return <ResultsPage results={assessments} onBack={handleBack} />
  }

  const currentSkill = selectedSkills[currentSkillIndex]
  const selectedLevel = assessments[currentSkill]
  const isLastSkill = currentSkillIndex === selectedSkills.length - 1

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAFF] to-[#F0F4FF]">
      <Header />

      <div className="container mx-auto px-6 pt-24 pb-8">
        <div className="max-w-[800px] mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-8">
            {/* Progress indicator */}
            <div className="flex items-center justify-center mb-10">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                1
              </div>
              <span className="ml-2 text-indigo-600">{currentSkill}</span>
            </div>

            {/* Skill title */}
            <h2 className="text-2xl font-medium text-indigo-600 text-center mb-6">{currentSkill}</h2>

            {/* Skill description */}
            <p className="text-gray-600 text-center max-w-[600px] mx-auto mb-12 leading-relaxed">
              {SKILL_DEFINITIONS[currentSkill]}
            </p>

            {/* Skill levels grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {SKILL_LEVELS.map((level) => (
                <div
                  key={level.id}
                  className={`bg-white rounded-lg p-6 text-center cursor-pointer transition-all border border-indigo-100
                    ${selectedLevel === level.id ? 'ring-2 ring-indigo-600' : 'hover:border-indigo-300'}
                    ${level.bgColor}`}
                  onClick={() => handleSelectLevel(level.id)}
                >
                  <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center text-2xl">
                    {level.emoji}
                  </div>
                  <h3 className="text-indigo-600 font-medium mb-2">{level.title}</h3>
                  <p className="text-sm text-gray-600">{level.description}</p>
                </div>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                onClick={handleBack}
                variant="outline"
                className="text-indigo-600"
              >
                Anterior
              </Button>
              <Button
                onClick={handleNext}
                className="bg-indigo-600 text-white"
                disabled={!selectedLevel}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
