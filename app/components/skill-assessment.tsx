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

  // Calculate dynamic styles based on number of skills
  const isLargeSet = selectedSkills.length > 6
  const containerMaxWidth = isLargeSet ? "100%" : `${Math.min(selectedSkills.length * 150, 600)}px`
  const circleSize = isLargeSet ? "w-8 h-8" : "w-12 h-12"
  const fontSize = isLargeSet ? "text-base" : "text-lg"
  const labelSize = isLargeSet ? "text-xs" : "text-sm"
  const labelMaxWidth = isLargeSet ? "max-w-[80px]" : "max-w-[120px]"

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAFF] to-[#F0F4FF]">
      <Header />

      <div className="container mx-auto px-6 pt-24 pb-8">
        <div className="max-w-[1000px] mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-8">
            {/* Progress Steps */}
            <div className="mb-16">
              <div
                className="relative mx-auto"
                style={{
                  maxWidth: containerMaxWidth,
                  height: isLargeSet ? "120px" : "100px",
                }}
              >
                {/* Progress bar container */}
                <div className="relative flex justify-between items-center">
                  {/* Lines container */}
                  <div className="absolute top-4" style={{ left: "12px", right: "12px" }}>
                    {/* Background line */}
                    <div className="absolute h-1 bg-gray-200 w-full" />

                    {/* Active line */}
                    <div
                      className="absolute h-1 bg-indigo-600 transition-all duration-300"
                      style={{
                        width:
                          currentSkillIndex === selectedSkills.length - 1
                            ? "100%"
                            : `${(currentSkillIndex / (selectedSkills.length - 1)) * 100}%`,
                      }}
                    />
                  </div>

                  {/* Circles and Labels */}
                  {selectedSkills.map((skill, index) => (
                    <div
                      key={skill}
                      className="relative"
                      style={{
                        flex: 1,
                        minWidth: isLargeSet ? "60px" : "100px",
                      }}
                    >
                      {/* Circle */}
                      <div
                        className={`relative z-10 rounded-full 
                          flex items-center justify-center font-medium mx-auto
                          ${circleSize} ${fontSize}
                          ${index <= currentSkillIndex ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-400"}`}
                      >
                        {index + 1}
                      </div>
                      {/* Label */}
                      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-full text-center">
                        <span
                          className={`${labelSize} ${labelMaxWidth} inline-block
                            ${index <= currentSkillIndex ? "text-indigo-600 font-medium" : "text-gray-400"}`}
                        >
                          {skill}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Skill Content */}
            <div className="max-w-[900px] mx-auto">
              <h2 className="text-2xl font-medium text-center text-indigo-600 mb-4">{currentSkill}</h2>
              <p className="text-center text-indigo-600/90 mb-12 max-w-[800px] mx-auto text-lg leading-relaxed">
                {SKILL_DEFINITIONS[currentSkill]}
              </p>

              <div className="flex justify-center gap-6 mb-12">
                {SKILL_LEVELS.map((level) => (
                  <Card
                    key={level.id}
                    className={`w-[220px] p-6 cursor-pointer transition-all border
                      ${
                        selectedLevel === level.id
                          ? "border-indigo-600 shadow-md bg-indigo-50"
                          : "border-gray-200 hover:border-indigo-600"
                      }
                    `}
                    onClick={() => handleSelectLevel(level.id)}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div
                        className={`w-20 h-20 rounded-full ${level.bgColor} flex items-center justify-center mb-6 text-4xl`}
                      >
                        {level.emoji}
                      </div>
                      <h3 className="font-bold text-lg mb-3 text-indigo-600">{level.title}</h3>
                      <p className="text-sm text-black leading-relaxed">{level.description}</p>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <button onClick={handleBack} className="text-indigo-600 hover:text-indigo-700 font-medium">
                  Anterior
                </button>
                <Button
                  onClick={handleNext}
                  className="px-8 bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                  disabled={!selectedLevel}
                >
                  {isLastSkill ? "Ver Resultados" : "Siguiente"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
