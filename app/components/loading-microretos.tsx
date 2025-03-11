'use client'

import { useEffect, useState } from 'react'
import { Progress } from "@/components/ui/progress"
import { generateMicroChallenge } from '@/app/actions/generate-challenge'

interface LoadingMicroretosProps {
  selectedSkills: string[]
  skillLevels: Record<string, string>
  onComplete: (challenges: any) => void
}

export default function LoadingMicroretos({ selectedSkills, skillLevels, onComplete }: LoadingMicroretosProps) {
  const [progress, setProgress] = useState<Record<string, number>>({})
  const [currentChallenges, setCurrentChallenges] = useState<Record<string, any>>({})
  const [showMessage, setShowMessage] = useState(false)
  const [showLongLoadingMessage, setShowLongLoadingMessage] = useState(false)
  const [isGenerating, setIsGenerating] = useState(true)

  // Mostrar mensaje después de 4 segundos
  useEffect(() => {
    const messageTimer = setTimeout(() => {
      setShowMessage(true)
    }, 4000)

    return () => clearTimeout(messageTimer)
  }, [])

  // Mostrar mensaje de carga prolongada después de 15 segundos
  useEffect(() => {
    const longLoadingTimer = setTimeout(() => {
      if (isGenerating) {
        setShowLongLoadingMessage(true)
      }
    }, 15000)

    return () => clearTimeout(longLoadingTimer)
  }, [isGenerating])

  useEffect(() => {
    const generateAllChallenges = async () => {
      const totalSteps = selectedSkills.length * 2 // 2 microretos por habilidad
      let completedSteps = 0

      setProgress(
        selectedSkills.reduce((acc, skill) => ({
          ...acc,
          [skill]: 0
        }), {})
      )

      for (const skill of selectedSkills) {
        try {
          // Generar microreto diario
          const dailyChallenge = await generateMicroChallenge({
            skill,
            level: skillLevels[skill],
            type: 'daily'
          })
          completedSteps++
          setProgress(prev => ({
            ...prev,
            [skill]: (completedSteps / totalSteps) * 100
          }))

          await new Promise(resolve => setTimeout(resolve, 500))

          // Generar microreto semanal
          const weeklyChallenge = await generateMicroChallenge({
            skill,
            level: skillLevels[skill],
            type: 'weekly'
          })
          completedSteps++
          setProgress(prev => ({
            ...prev,
            [skill]: (completedSteps / totalSteps) * 100
          }))

          setCurrentChallenges(prev => ({
            ...prev,
            [skill]: {
              daily: dailyChallenge,
              weekly: weeklyChallenge
            }
          }))

        } catch (error) {
          console.error(`Error generando microretos para ${skill}:`, error)
          completedSteps += 2
          setProgress(prev => ({
            ...prev,
            [skill]: 100
          }))
        }
      }

      // Cuando termina la generación
      setIsGenerating(false)
      setShowMessage(false)
      setShowLongLoadingMessage(false)
      onComplete(currentChallenges)
    }

    generateAllChallenges()
  }, [selectedSkills, skillLevels])

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="w-full max-w-2xl p-8 bg-white rounded-3xl shadow-sm">
        {showMessage && (
          <div className="text-2xl font-semibold text-center mb-8">
            ¡Un momento, estamos generando los mejores microretos para ti! 🚀
          </div>
        )}

        <div className="space-y-6">
          {selectedSkills.map(skill => (
            <div key={skill} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  {skill} - Nivel {skillLevels[skill]}
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round(progress[skill] || 0)}%
                </span>
              </div>
              <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${progress[skill] || 0}%` }}
                />
                <div 
                  className="absolute top-0 left-0 h-full w-full"
                  style={{
                    animation: progress[skill] < 100 ? 'shimmer 2s infinite' : 'none',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                    transform: 'translateX(-100%)'
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {showLongLoadingMessage && (
          <div className="mt-6 text-center text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
            La generación está tomando más tiempo de lo habitual. 
            Estamos asegurándonos de crear los mejores microretos posibles para ti. 
            ¡Gracias por tu paciencia! 🙏
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <div 
            className="rounded-full h-8 w-8 border-b-2 border-indigo-600"
            style={{
              animation: 'spin 1s linear infinite'
            }}
          />
        </div>

        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    </div>
  )
}
