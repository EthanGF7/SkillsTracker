"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Header from "./header"
import SkillsSelection from "./skills-selection"

interface OnboardingFlowProps {
  onComplete: () => void
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(1)
  const [showSkillsSelection, setShowSkillsSelection] = useState(false)

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      setShowSkillsSelection(true)
    }
  }

  if (showSkillsSelection) {
    return <SkillsSelection />
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-blue-50 to-blue-100 flex flex-col items-center p-4 pt-24">
      <Header />
      <div className="w-full max-w-3xl">
        {/* Progress Steps */}
        <div className="flex flex-col items-center mb-12">
          <h1 className="text-2xl font-semibold text-indigo-600 mb-8">Bienvenido a tu Viaje de Desarrollo Personal</h1>
          <div className="flex items-center justify-center w-full mb-12">
            <div className="relative flex items-center justify-between w-full max-w-[320px] px-4 cursor-pointer">
              {/* Progress Line Background */}
              <div
                className="absolute h-1 bg-gray-200 top-1/2 -translate-y-1/2"
                style={{
                  left: "24px",
                  right: "24px",
                }}
              />

              {/* Active Progress Line */}
              <div
                className="absolute h-1 bg-indigo-600 top-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out"
                style={{
                  left: "24px",
                  width: step === 1 ? "0%" : step === 2 ? "50%" : "100%",
                  maxWidth: "calc(100% - 48px)",
                }}
              />

              {/* Step Circles */}
              {[1, 2, 3].map((number) => (
                <button
                  key={number}
                  onClick={() => setStep(number)}
                  className={`relative flex items-center justify-center w-12 h-12 rounded-full text-lg font-medium transition-colors duration-300 
                    ${step >= number ? "bg-indigo-600 text-white" : "bg-gray-300 text-gray-600"}
                    hover:bg-indigo-500 hover:text-white cursor-pointer
                    focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2`}
                >
                  {number}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <Card className="bg-white/80 backdrop-blur-sm p-8 text-center max-w-md mx-auto">
          {step === 1 && (
            <>
              <p className="text-gray-600 mb-4">
                <span className="text-indigo-600 font-medium block mb-2">
                  Esta herramienta te ayudará a evaluar y desarrollar tus Soft Skills emergentes.
                </span>
                A través de una serie de pasos, descubrirás tus fortalezas y áreas de mejora.
              </p>
              <Button onClick={handleNextStep} className="w-full bg-indigo-600 hover:bg-indigo-700">
                Siguiente
              </Button>
            </>
          )}
          {step === 2 && (
            <>
              <div className="text-gray-600 mb-4">
                <span className="text-indigo-600 font-bold block mb-2">El proceso incluye:</span>
                <ul className="text-left list-disc pl-5 space-y-1 text-gray-600">
                  <li>Autoevaluación inicial</li>
                  <li>Selección de habilidades a desarrollar</li>
                  <li>Plan personalizado de desarrollo</li>
                  <li>Retos y actividades prácticas</li>
                  <li>Análisis de tu progreso</li>
                </ul>
              </div>
              <Button onClick={handleNextStep} className="w-full bg-indigo-600 hover:bg-indigo-700">
                Continuar
              </Button>
            </>
          )}
          {step === 3 && (
            <>
              <div className="text-gray-600 mb-4">
                <span className="text-indigo-600 font-bold block mb-2">Recuerda:</span>
                <ul className="text-left list-disc pl-5 space-y-1 text-gray-600">
                  <li>Sé honesto en tus respuestas para obtener los mejores resultados</li>
                  <li>El desarrollo personal es un viaje continuo</li>
                  <li>Celebra tus logros y aprende de los desafíos</li>
                </ul>
              </div>
              <Button onClick={handleNextStep} className="w-full bg-indigo-600 hover:bg-indigo-700">
                Comenzar
              </Button>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
