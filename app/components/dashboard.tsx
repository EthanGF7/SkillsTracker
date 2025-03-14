"use client"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Image from "next/image"
import Link from "next/link"
import Header from "./header"
import { useState, useEffect } from "react"
import SkillProgress from "./skill-progress"
import { generateMicroChallenge } from "@/app/actions/generate-challenge"

interface MicroChallenge {
  title: string
  description: string
  rules: string[]
  extraTip: string
  completed?: boolean
}

interface SkillChallenges {
  daily: MicroChallenge
  weekly: MicroChallenge
}

type SkillLevel = "Aprendiz" | "Explorador" | "Maestro" | "Leyenda"

interface SkillProgress {
  level: number
  title: SkillLevel
  progress: number
  nextLevel: number
  emoji: string
  progressClass: string
  completedChallenges: {
    daily: boolean
    weekly: boolean
  }
}

interface DashboardProps {
  selectedSkills: string[]
  skillLevels: Record<string, string>
  initialChallenges?: Record<string, SkillChallenges>
}

export default function Dashboard({ selectedSkills, skillLevels, initialChallenges }: DashboardProps) {
  // Estados de la vista
  const [activeView, setActiveView] = useState<"microretos" | "softskills" | "progreso">("microretos")
  const [selectedSkill, setSelectedSkill] = useState(selectedSkills[0])
  
  // Estados de carga y error
  const [loadingState, setLoadingState] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)
  const [showWaitingMessage, setShowWaitingMessage] = useState(false)

  // Estados de retos y progreso
  const [currentChallenges, setCurrentChallenges] = useState<Record<string, SkillChallenges>>(() => {
    // Intentar cargar retos guardados del localStorage
    if (typeof window !== 'undefined') {
      const savedChallenges = localStorage.getItem('savedChallenges')
      if (savedChallenges) {
        try {
          return JSON.parse(savedChallenges)
        } catch (e) {
          console.error('Error parsing saved challenges:', e)
        }
      }
    }
    return initialChallenges || {}
  })

  const [generatedSkills, setGeneratedSkills] = useState<Set<string>>(
    new Set(initialChallenges ? Object.keys(initialChallenges) : [])
  )

  const [completedChallenges, setCompletedChallenges] = useState<Record<string, Set<"daily" | "weekly">>>(() => {
    return selectedSkills.reduce((acc, skill) => {
      acc[skill] = new Set()
      return acc
    }, {} as Record<string, Set<"daily" | "weekly">>)
  })

  // Estado para el progreso de las habilidades
  const [skillsProgress, setSkillsProgress] = useState<Record<string, SkillProgress>>(() => {
    return selectedSkills.reduce((acc, skillName) => {
      const userLevel = skillLevels[skillName].toLowerCase()
      const levelInfo = {
        aprendiz: { level: 1, title: "Aprendiz" as const, emoji: "🐥", progressClass: "bg-green-500" },
        explorador: { level: 2, title: "Explorador" as const, emoji: "🚀", progressClass: "bg-blue-500" },
        maestro: { level: 3, title: "Maestro" as const, emoji: "⭐️", progressClass: "bg-purple-500" },
        leyenda: { level: 4, title: "Leyenda" as const, emoji: "🏆", progressClass: "bg-yellow-500" }
      }[userLevel]

      if (!levelInfo) {
        throw new Error(`Nivel no válido: ${userLevel}`)
      }

      acc[skillName] = {
        level: levelInfo.level,
        title: levelInfo.title,
        progress: 0,
        nextLevel: levelInfo.level < 4 ? levelInfo.level + 1 : 4,
        emoji: levelInfo.emoji,
        progressClass: levelInfo.progressClass,
        completedChallenges: {
          daily: false,
          weekly: false
        }
      }
      return acc
    }, {} as Record<string, SkillProgress>)
  })

  // Estado para animaciones
  const [showCompletionAnimation, setShowCompletionAnimation] = useState<{
    skill: string,
    type: "daily" | "weekly"
  } | null>(null)

  // Estado para controlar las generaciones en curso
  const [generationInProgress, setGenerationInProgress] = useState(false)

  // Efecto para guardar los retos en localStorage cuando cambien
  useEffect(() => {
    if (typeof window !== 'undefined' && Object.keys(currentChallenges).length > 0) {
      localStorage.setItem('savedChallenges', JSON.stringify(currentChallenges))
    }
  }, [currentChallenges])

  // Efecto para generar retos cuando se selecciona una habilidad
  useEffect(() => {
    if (!selectedSkill || !skillsProgress[selectedSkill] || generationInProgress) {
      return
    }

    const generateRetos = async () => {
      // Si ya tenemos retos en el estado actual, no generamos nuevos
      if (currentChallenges[selectedSkill]) {
        return
      }

      setGenerationInProgress(true)
      setLoadingState(prev => ({ ...prev, [selectedSkill]: true }))
      setError(null)

      try {
        const level = skillsProgress[selectedSkill].title
        let daily, weekly

        // Intentar generar los retos con reintentos
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            // Generar un nuevo reto diario
            daily = await generateMicroChallenge({
              skill: selectedSkill,
              level,
              type: 'daily'
            })

            // Pequeña pausa para evitar sobrecarga de la API
            await new Promise(resolve => setTimeout(resolve, 1000))

            // Generar un nuevo reto semanal
            weekly = await generateMicroChallenge({
              skill: selectedSkill,
              level,
              type: 'weekly'
            })

            if (daily && weekly) {
              break // Si ambos retos se generaron correctamente, salimos del bucle
            }
          } catch (e) {
            console.error(`Intento ${attempt + 1} fallido:`, e)
            if (attempt === 2) throw e // En el último intento, propagamos el error
            await new Promise(resolve => setTimeout(resolve, 2000)) // Esperar antes de reintentar
          }
        }

        if (!daily || !weekly) {
          throw new Error('Error generando los retos')
        }

        // Actualizar el estado con los nuevos retos
        setCurrentChallenges(prev => {
          const updated = {
            ...prev,
            [selectedSkill]: { daily, weekly }
          }
          // Guardar en localStorage inmediatamente
          if (typeof window !== 'undefined') {
            localStorage.setItem('savedChallenges', JSON.stringify(updated))
          }
          return updated
        })

        // Actualizar el conjunto de habilidades generadas
        setGeneratedSkills(prev => new Set([...prev, selectedSkill]))
      } catch (error) {
        console.error('Error:', error)
        setError(error instanceof Error ? error.message : 'Error generando los retos')
      } finally {
        setShowWaitingMessage(false)
        setGenerationInProgress(false)
        setLoadingState(prev => ({ ...prev, [selectedSkill]: false }))
      }
    }

    generateRetos()
  }, [selectedSkill, skillsProgress, currentChallenges, generationInProgress])

  // Función para marcar un reto como completado
  const markChallengeAsCompleted = (skillName: string, type: 'daily' | 'weekly') => {
    setCurrentChallenges(prev => ({
      ...prev,
      [skillName]: {
        ...prev[skillName],
        [type]: {
          ...prev[skillName][type],
          completed: true
        }
      }
    }))
  }

  // Función para actualizar el progreso cuando se complete un microreto
  const handleCompleteMicroChallenge = (skillName: string, challengeType: 'daily' | 'weekly') => {
    if (!skillsProgress[skillName]) {
      console.error('Habilidad no encontrada:', skillName)
      return
    }

    // Mostrar la animación de completado
    setShowCompletionAnimation({ skill: skillName, type: challengeType })
    
    // Ocultar la animación después de 1.5 segundos
    setTimeout(() => {
      setShowCompletionAnimation(null)
    }, 1500)

    // Calcular el nuevo progreso (incrementar 10%)
    const currentProgress = skillsProgress[skillName].progress
    const newProgress = Math.min(currentProgress + 10, 100)

    // Si llega al 100%, se podría implementar el cambio de nivel aquí
    const shouldLevelUp = newProgress === 100 && skillsProgress[skillName].level < 4

    // Actualizar el progreso de la habilidad
    const updatedProgress = {
      ...skillsProgress[skillName],
      progress: newProgress,
      completedChallenges: {
        ...skillsProgress[skillName].completedChallenges,
        [challengeType]: true
      }
    }

    // Si debe subir de nivel
    if (shouldLevelUp) {
      const levelTitles: SkillLevel[] = ["Aprendiz", "Explorador", "Maestro", "Leyenda"]
      const levelEmojis = ["🐥", "🚀", "⭐️", "🏆"]
      const levelColors = ["bg-green-500", "bg-blue-500", "bg-purple-500", "bg-yellow-500"]
      
      const newLevel = skillsProgress[skillName].level + 1
      updatedProgress.level = newLevel
      updatedProgress.title = levelTitles[newLevel - 1]
      updatedProgress.emoji = levelEmojis[newLevel - 1]
      updatedProgress.progressClass = levelColors[newLevel - 1]
      updatedProgress.progress = 0 // Reiniciar progreso al subir de nivel
      updatedProgress.nextLevel = newLevel < 4 ? newLevel + 1 : 4
    }

    setSkillsProgress({
      ...skillsProgress,
      [skillName]: updatedProgress
    })

    // Marcar el reto como completado
    markChallengeAsCompleted(skillName, challengeType)
  }

  // Función para generar un nuevo reto
  const handleGenerateNewChallenge = async (skill: string) => {
    if (generationInProgress) return

    setGenerationInProgress(true)
    setLoadingState(prev => ({ ...prev, [skill]: true }))
    setError(null)

    try {
      const level = skillsProgress[skill].title
      console.log(`Generando nuevos retos para ${skill} (${level})`)

      const [daily, weekly] = await Promise.all([
        generateMicroChallenge({ skill, level, type: 'daily' }),
        generateMicroChallenge({ skill, level, type: 'weekly' })
      ])

      if (!daily || !weekly) {
        throw new Error('Error generando los retos')
      }

      setCurrentChallenges(prev => ({
        ...prev,
        [skill]: { daily, weekly }
      }))

    } catch (error) {
      console.error('Error:', error)
      setError(error instanceof Error ? error.message : 'Error generando los retos')
    } finally {
      setGenerationInProgress(false)
      setLoadingState(prev => ({ ...prev, [skill]: false }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAFF] to-[#F0F4FF]">
      <Header />
      {showWaitingMessage && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-100 p-4 text-center z-50">
          <p className="text-yellow-800">
            Estamos generando tus microretos personalizados. ¡Solo unos segundos más!
          </p>
        </div>
      )}
      <div className="flex min-h-screen bg-[#EEF1FB] pt-16">
        {/* Sidebar */}
        <aside className="w-[240px] bg-[#D8DDFD] py-6 px-4">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-full overflow-hidden">
              <Image
                src="/marta.jpg"
                alt="Marta"
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-lg text-[#1E293B] font-medium">Marta</span>
          </div>

          <div className="mb-3">
            <h2 className="text-xl text-[#1E293B] font-semibold">Menú</h2>
          </div>

          <div className="space-y-1">
            <Button
              variant="ghost"
              className={`w-full justify-start px-3 py-2 h-9 text-[15px] font-medium ${
                activeView === "microretos" 
                  ? "bg-[#6366F1] text-white hover:bg-[#6366F1] hover:text-white" 
                  : "text-[#1E293B] hover:bg-white/50 hover:text-[#1E293B]"
              } rounded-xl`}
              onClick={() => setActiveView("microretos")}
            >
              <svg className="w-[18px] h-[18px] mr-2.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM17 13H13V17H11V13H7V11H11V7H13V11H17V13ZM11 12H13V14H11V12ZM11 6H13V10H11V6Z" className="fill-current"/>
              </svg>
              Microretos
            </Button>
            <Button
              variant="ghost"
              className={`w-full justify-start px-3 py-2 h-9 text-[15px] font-medium ${
                activeView === "softskills" 
                  ? "bg-[#6366F1] text-white hover:bg-[#6366F1] hover:text-white" 
                  : "text-[#1E293B] hover:bg-white/50 hover:text-[#1E293B]"
              } rounded-xl`}
              onClick={() => setActiveView("softskills")}
            >
              <svg className="w-[18px] h-[18px] mr-2.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" className="fill-current"/>
              </svg>
              Soft Skills
            </Button>
            <Button
              variant="ghost"
              className={`w-full justify-start px-3 py-2 h-9 text-[15px] font-medium ${
                activeView === "progreso" 
                  ? "bg-[#6366F1] text-white hover:bg-[#6366F1] hover:text-white" 
                  : "text-[#1E293B] hover:bg-white/50 hover:text-[#1E293B]"
              } rounded-xl`}
              onClick={() => setActiveView("progreso")}
            >
              <svg className="w-[18px] h-[18px] mr-2.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.5 18.49L9.5 12.48L13.5 16.48L22 6.92L20.59 5.51L13.5 13.48L9.5 9.48L2 16.99L3.5 18.49Z" className="fill-current"/>
              </svg>
              Progreso
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start px-3 py-2 h-9 text-[15px] font-medium text-[#1E293B] hover:bg-white/50 hover:text-[#1E293B] rounded-xl"
            >
              <svg className="w-[18px] h-[18px] mr-2.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 2H4C2.9 2 2 2.9 2 4V22L12 18L22 22V4C22 2.9 20.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16ZM11 12H13V14H11V12ZM11 6H13V10H11V6Z" className="fill-current"/>
              </svg>
              Chat IA
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 py-6 px-8">
          {showWaitingMessage && Object.values(loadingState).some(loading => loading) && (
            <div className="fixed top-0 left-0 right-0 bg-yellow-100 p-4 text-center">
              <p className="text-yellow-800">
                Estamos generando tus microretos personalizados. ¡Solo unos segundos más!
              </p>
            </div>
          )}
          {activeView === "microretos" && (
            <>
              {/* Top Navigation - Solo para microretos */}
              <nav className="mb-8">
                <ul className="flex gap-12 text-base">
                  {selectedSkills.map((skill) => (
                    <li key={skill} className="relative">
                      <Link 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault()
                          setSelectedSkill(skill)
                        }}
                        className={`${
                          selectedSkill === skill
                            ? "text-[#6366F1] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#6366F1]"
                            : "text-[#64748B] hover:text-[#6366F1]"
                        } pb-2 block`}
                      >
                        {skill}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Contenido de Microretos */}
              <div className="space-y-6">
                {/* Progreso de la habilidad */}
                <div className="bg-white rounded-2xl p-6 shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl text-[#6366F1] font-semibold">{selectedSkill}</h2>
                    <span className="text-[#64748B] text-sm">Tu Progreso</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#F8FAFC] p-1.5 rounded-lg">{skillsProgress[selectedSkill].emoji}</span>
                      <span className="text-[#64748B]">Nivel {skillsProgress[selectedSkill].level}</span>
                      <span className="text-[#1E293B] font-medium">{skillsProgress[selectedSkill].title}</span>
                    </div>
                    <div className="flex-1">
                      <Progress value={skillsProgress[selectedSkill].progress} className="h-2 bg-[#E2E8F0]" indicatorClassName="bg-[#22C55E]" />
                    </div>
                    <span className="text-[#64748B] text-sm">{skillsProgress[selectedSkill].progress}% para Nivel {skillsProgress[selectedSkill].nextLevel}</span>
                  </div>
                </div>

                {/* Contenedor de Microretos */}
                <div className="bg-white rounded-2xl p-8">
                  {loadingState[selectedSkill] ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : error ? (
                    <div className="text-center p-8">
                      <p className="text-red-600 mb-4">{error}</p>
                      <Button 
                        onClick={() => {
                          const generateForSkill = async (skill: string) => {
                            if (generationInProgress) return

                            setGenerationInProgress(true)
                            setLoadingState(prev => ({ ...prev, [skill]: true }))

                            try {
                              const level = skillsProgress[skill].title
                              console.log(`Generando retos para ${skill} (${level})`)

                              const [daily, weekly] = await Promise.all([
                                generateMicroChallenge({ skill, level, type: 'daily' }),
                                generateMicroChallenge({ skill, level, type: 'weekly' })
                              ])

                              if (!daily || !weekly) {
                                throw new Error('Error generando los retos')
                              }

                              setCurrentChallenges(prev => ({
                                ...prev,
                                [skill]: { daily, weekly }
                              }))

                            } catch (error) {
                              console.error('Error:', error)
                              setError(error instanceof Error ? error.message : 'Error generando los retos')
                            } finally {
                              setGenerationInProgress(false)
                              setLoadingState(prev => ({ ...prev, [skill]: false }))
                            }
                          }

                          generateForSkill(selectedSkill)
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        Intentar de nuevo
                      </Button>
                    </div>
                  ) : !currentChallenges[selectedSkill] ? (
                    <div className="text-center p-8">
                      <p className="text-gray-600 mb-4">No hay retos generados para esta habilidad</p>
                      <Button 
                        onClick={() => {
                          const generateForSkill = async (skill: string) => {
                            if (generationInProgress) return

                            setGenerationInProgress(true)
                            setLoadingState(prev => ({ ...prev, [skill]: true }))

                            try {
                              const level = skillsProgress[skill].title
                              console.log(`Generando retos para ${skill} (${level})`)

                              const [daily, weekly] = await Promise.all([
                                generateMicroChallenge({ skill, level, type: 'daily' }),
                                generateMicroChallenge({ skill, level, type: 'weekly' })
                              ])

                              if (!daily || !weekly) {
                                throw new Error('Error generando los retos')
                              }

                              setCurrentChallenges(prev => ({
                                ...prev,
                                [skill]: { daily, weekly }
                              }))

                            } catch (error) {
                              console.error('Error:', error)
                              setError(error instanceof Error ? error.message : 'Error generando los retos')
                            } finally {
                              setGenerationInProgress(false)
                              setLoadingState(prev => ({ ...prev, [skill]: false }))
                            }
                          }

                          generateForSkill(selectedSkill)
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        Generar retos
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Microreto del día */}
                      <div className={`bg-blue-100 rounded-lg p-8 shadow-sm relative overflow-hidden ${
                        skillsProgress[selectedSkill].completedChallenges.daily
                          ? "opacity-90 after:absolute after:inset-0 after:bg-blue-50 after:bg-opacity-60"
                          : ""
                      }`}>
                        {/* Marca de completado permanente */}
                        {skillsProgress[selectedSkill].completedChallenges.daily && (
                          <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Completado
                          </div>
                        )}

                        {/* Animación de completado */}
                        {showCompletionAnimation?.skill === selectedSkill && 
                         showCompletionAnimation?.type === "daily" && (
                          <div className="absolute inset-0 bg-green-500 bg-opacity-20 z-10 flex items-center justify-center animate-fadeOut">
                            <div className="bg-white rounded-full p-4 shadow-lg animate-scaleUp">
                              <svg className="w-12 h-12 text-green-500 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                        )}
                        
                        <div className="inline-block bg-blue-600 text-white text-base font-medium px-6 py-2 rounded-full mb-4">
                          Microreto del día
                        </div>
                        
                        <h3 className="text-[#334155] text-xl font-semibold mb-4">
                          "{currentChallenges[selectedSkill]?.daily.title}"
                        </h3>
                        
                        <p className="text-[#64748B] mb-4">
                          {currentChallenges[selectedSkill]?.daily.description}
                        </p>
                        
                        <div className={`space-y-4 ${
                          skillsProgress[selectedSkill].completedChallenges.daily ? "opacity-75" : ""
                        }`}>
                          <div>
                            <p className="text-[#334155] font-medium mb-2">
                              📝 Reglas:
                            </p>
                            <ol className="list-decimal list-inside space-y-1 text-[#64748B]">
                              {currentChallenges[selectedSkill]?.daily.rules.map((rule, index) => (
                                <li key={index} className={skillsProgress[selectedSkill].completedChallenges.daily ? "line-through" : ""}>
                                  {rule}
                                </li>
                              ))}
                            </ol>
                          </div>
                          
                          <div>
                            <p className={`text-[#334155] ${skillsProgress[selectedSkill].completedChallenges.daily ? "line-through" : ""}`}>
                              📌 Extra: {currentChallenges[selectedSkill]?.daily.extraTip}
                            </p>
                          </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                          <button
                            onClick={() => handleCompleteMicroChallenge(selectedSkill, "daily")}
                            disabled={skillsProgress[selectedSkill].completedChallenges.daily}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                              skillsProgress[selectedSkill].completedChallenges.daily
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-[#4F46E5] hover:bg-[#4338CA]"
                            } text-white`}
                          >
                            {skillsProgress[selectedSkill].completedChallenges.daily ? (
                              <>
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Completado
                              </>
                            ) : (
                              <>
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                  <path d="M9 11L12 14L15 11M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Marcar como completado
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Microreto de la semana */}
                      <div className={`bg-green-100 rounded-lg p-8 shadow-sm relative overflow-hidden ${
                        skillsProgress[selectedSkill].completedChallenges.weekly
                          ? "opacity-90 after:absolute after:inset-0 after:bg-green-50 after:bg-opacity-60"
                          : ""
                      }`}>
                        {/* Marca de completado permanente */}
                        {skillsProgress[selectedSkill].completedChallenges.weekly && (
                          <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Completado
                          </div>
                        )}

                        {/* Animación de completado */}
                        {showCompletionAnimation?.skill === selectedSkill && 
                         showCompletionAnimation?.type === "weekly" && (
                          <div className="absolute inset-0 bg-green-500 bg-opacity-20 z-10 flex items-center justify-center animate-fadeOut">
                            <div className="bg-white rounded-full p-4 shadow-lg animate-scaleUp">
                              <svg className="w-12 h-12 text-green-500 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                        )}
                        
                        <div className="inline-block bg-green-600 text-white text-base font-medium px-6 py-2 rounded-full mb-4">
                          Microreto de la semana
                        </div>
                        
                        <h3 className="text-[#334155] text-xl font-semibold mb-4">
                          "{currentChallenges[selectedSkill]?.weekly.title}"
                        </h3>
                        
                        <p className="text-[#64748B] mb-4">
                          {currentChallenges[selectedSkill]?.weekly.description}
                        </p>
                        
                        <div className={`space-y-4 ${
                          skillsProgress[selectedSkill].completedChallenges.weekly ? "opacity-75" : ""
                        }`}>
                          <div>
                            <p className="text-[#334155] font-medium mb-2">
                              📝 Reglas:
                            </p>
                            <ol className="list-decimal list-inside space-y-1 text-[#64748B]">
                              {currentChallenges[selectedSkill]?.weekly.rules.map((rule, index) => (
                                <li key={index} className={skillsProgress[selectedSkill].completedChallenges.weekly ? "line-through" : ""}>
                                  {rule}
                                </li>
                              ))}
                            </ol>
                          </div>
                          
                          <div>
                            <p className={`text-[#334155] ${skillsProgress[selectedSkill].completedChallenges.weekly ? "line-through" : ""}`}>
                              📌 Extra: {currentChallenges[selectedSkill]?.weekly.extraTip}
                            </p>
                          </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                          <button
                            onClick={() => handleCompleteMicroChallenge(selectedSkill, "weekly")}
                            disabled={skillsProgress[selectedSkill].completedChallenges.weekly}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                              skillsProgress[selectedSkill].completedChallenges.weekly
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-[#4F46E5] hover:bg-[#4338CA]"
                            } text-white`}
                          >
                            {skillsProgress[selectedSkill].completedChallenges.weekly ? (
                              <>
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Completado
                              </>
                            ) : (
                              <>
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                  <path d="M9 11L12 14L15 11M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Marcar como completado
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Vista de Soft Skills */}
          {activeView === "softskills" && (
            <div className="bg-white rounded-2xl">
              <SkillProgress 
                selectedSkills={selectedSkills} 
                skillsProgress={skillsProgress}
              />
            </div>
          )}

          {/* Vista de Progreso */}
          {activeView === "progreso" && (
            <div className="bg-white rounded-2xl">
              <h2 className="text-2xl font-semibold mb-6">Tu Progreso</h2>
              {/* Contenido de la vista de progreso */}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
