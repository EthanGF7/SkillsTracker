"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"
import Header from "./header"
import SkillAssessment from "./skill-assessment"

interface Skill {
  id: string
  name: string
}

const defaultSkills: Skill[] = [
  { id: "1", name: "Comunicación" },
  { id: "2", name: "Trabajo en equipo" },
  { id: "3", name: "Liderazgo" },
  { id: "4", name: "Organización" },
  { id: "5", name: "Adaptabilidad" },
  { id: "6", name: "Resolución de problemas" },
  { id: "7", name: "Empatía" },
  { id: "8", name: "Creatividad" },
  { id: "9", name: "Gestión del tiempo" },
]

export default function SkillsSelection() {
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set())
  const [newSkill, setNewSkill] = useState("")
  const [showAssessment, setShowAssessment] = useState(false)

  const toggleSkill = (skillId: string) => {
    const newSelected = new Set(selectedSkills)
    if (newSelected.has(skillId)) {
      newSelected.delete(skillId)
    } else {
      newSelected.add(skillId)
    }
    setSelectedSkills(newSelected)
  }

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      const skillId = `custom-${Date.now()}`
      defaultSkills.push({ id: skillId, name: newSkill.trim() })
      setNewSkill("")
      toggleSkill(skillId)
    }
  }

  const handleStartAssessment = () => {
    setShowAssessment(true)
  }

  const handleAssessmentComplete = (assessments: Record<string, string>) => {
    console.log("Skill assessments:", assessments)
    // Handle the completion of the assessment
  }

  if (showAssessment) {
    const selectedSkillNames = Array.from(selectedSkills)
      .map((id) => defaultSkills.find((skill) => skill.id === id)?.name ?? "")
      .filter(Boolean)

    return (
      <SkillAssessment
        selectedSkills={selectedSkillNames}
        onComplete={handleAssessmentComplete}
        onBack={() => setShowAssessment(false)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAFF] to-[#F0F4FF]">
      <Header />

      <div className="container mx-auto px-6 pt-24 pb-8">
        <div className="max-w-[600px] mx-auto">
          <h1 className="text-2xl font-semibold text-center text-indigo-600 mb-16">
            Bienvenido a tu Viaje de Desarrollo Personal
          </h1>

          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <h2 className="text-xl font-medium text-center text-[#1e1b4b] mb-10">
              ¿Qué habilidades te gustaría mejorar?
            </h2>

            <div className="grid grid-cols-3 gap-4 mb-8 max-w-[500px] mx-auto">
              {defaultSkills.map((skill) => (
                <div key={skill.id} className="flex justify-center">
                  <button
                    onClick={() => toggleSkill(skill.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border
                      min-w-[120px] max-w-[160px] w-auto
                      ${
                        selectedSkills.has(skill.id)
                          ? "bg-[#E6E5FF] text-[#1e1b4b] border-[#E6E5FF]"
                          : "bg-white text-[#1e1b4b] border-gray-300 hover:border-[#E6E5FF]"
                      }`}
                  >
                    {skill.name}
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-600 text-center">Si es necesario, añade una Soft Skill:</p>
              <div className="flex space-x-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddSkill()
                    }
                  }}
                  placeholder="Escribe una nueva Soft Skill"
                  className="bg-white border-gray-300 rounded-lg text-center flex-grow"
                />
                <Button onClick={handleAddSkill} className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Plus className="w-4 h-4" />
                  <span className="sr-only">Añadir Skill</span>
                </Button>
              </div>
            </div>

            <Button
              onClick={handleStartAssessment}
              className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg h-12"
              disabled={selectedSkills.size === 0}
            >
              Empezar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

