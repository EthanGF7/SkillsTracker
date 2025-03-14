"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"
import Header from "./header"
import SkillAssessment from "./skill-assessment"
import CustomSkillForm from "./custom-skill-form"

interface Skill {
  id: string
  name: string
}

interface SkillDescription {
  description: string
  keyPoints: string[]
  examples: string[]
}

interface Challenge {
  title: string
  description: string
  objectives: string[]
  metrics: string[]
  type: 'daily' | 'weekly'
  weeklyChallenge?: {
    title: string
    description: string
    objectives: string[]
    metrics: string[]
    type: 'weekly'
  }
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
  const [showCustomSkillForm, setShowCustomSkillForm] = useState(false)
  const [showAssessment, setShowAssessment] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentSkillDescription, setCurrentSkillDescription] = useState<SkillDescription | null>(null)
  const [currentSkillName, setCurrentSkillName] = useState<string>("")
  const [currentStep, setCurrentStep] = useState(1)

  const fetchSkillDescription = async (skillName: string) => {
    try {
      const response = await fetch('/api/generate-skill-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillName })
      });

      if (!response.ok) {
        throw new Error('Error al generar la descripción');
      }

      const data = await response.json();
      setCurrentSkillDescription(data);
      setCurrentSkillName(skillName);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const toggleSkill = async (skillId: string) => {
    const newSelected = new Set(selectedSkills);
    const skill = defaultSkills.find(s => s.id === skillId);
    
    if (newSelected.has(skillId)) {
      newSelected.delete(skillId);
      if (skill && skill.name === currentSkillName) {
        setCurrentSkillDescription(null);
        setCurrentSkillName("");
      }
    } else {
      newSelected.add(skillId);
      if (skill) {
        await fetchSkillDescription(skill.name);
      }
    }
    setSelectedSkills(newSelected);
  };

  const handleAddCustomSkill = async (skillName: string) => {
    try {
      setIsLoading(true);
      const skillId = `custom-${Date.now()}`;
      defaultSkills.push({ id: skillId, name: skillName.trim() });
      await toggleSkill(skillId);
      setShowCustomSkillForm(false);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartAssessment = () => {
    setCurrentStep(2);
    setShowAssessment(true);
  }

  const handleAssessmentComplete = (assessments: Record<string, string>) => {
    console.log("Skill assessments:", assessments)
  }

  if (showAssessment) {
    const selectedSkillNames = Array.from(selectedSkills)
      .map((id) => defaultSkills.find((skill) => skill.id === id)?.name ?? "")
      .filter(Boolean)

    return (
      <SkillAssessment
        selectedSkills={selectedSkillNames}
        onComplete={handleAssessmentComplete}
        onBack={() => {
          setShowAssessment(false);
          setCurrentStep(1);
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAFF] to-[#F0F4FF]">
      <Header />

      <div className="container mx-auto px-6 pt-24 pb-8">
        <div className="max-w-[800px] mx-auto">
          <h1 className="text-2xl font-semibold text-center text-indigo-600 mb-16">
            Bienvenido a tu Viaje de Desarrollo Personal
          </h1>

          <div className="flex items-center justify-center mb-10">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                1
              </div>
              <div className="text-sm font-medium ml-2">{currentSkillName || "Asertividad"}</div>
            </div>
            <div className="w-16 h-[2px] mx-4 bg-gray-200"></div>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                2
              </div>
              <div className="text-sm font-medium ml-2">Creatividad</div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <h2 className="text-xl font-medium text-center text-[#1e1b4b] mb-10">
              ¿Qué habilidades te gustaría mejorar?
            </h2>

            {currentSkillDescription && (
              <div className="text-center mb-10">
                <h3 className="text-xl font-medium text-indigo-600 mb-4">{currentSkillName}</h3>
                <p className="text-gray-600 max-w-[600px] mx-auto leading-relaxed">
                  {currentSkillDescription.description}
                </p>
              </div>
            )}

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
              {showCustomSkillForm ? (
                <CustomSkillForm
                  onSkillCreated={handleAddCustomSkill}
                  onCancel={() => setShowCustomSkillForm(false)}
                />
              ) : (
                <Button 
                  onClick={() => setShowCustomSkillForm(true)}
                  className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg h-12"
                  disabled={isLoading}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Añadir Nueva Habilidad
                </Button>
              )}
            </div>

            <Button
              onClick={handleStartAssessment}
              className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg h-12"
              disabled={selectedSkills.size === 0 || isLoading}
            >
              {isLoading ? "Cargando..." : "Empezar"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
