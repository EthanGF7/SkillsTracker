"use client"

import { Progress } from "@/components/ui/progress"

interface SkillProgressProps {
  selectedSkills: string[]
  skillsProgress: Record<string, {
    level: number
    title: "Aprendiz" | "Explorador" | "Maestro" | "Leyenda"
    progress: number
    nextLevel: number
    emoji: string
    progressClass: string
  }>
}

export default function SkillProgress({ selectedSkills, skillsProgress }: SkillProgressProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
      {selectedSkills.map((skillName) => {
        const skill = skillsProgress[skillName]
        return (
          <div key={skillName} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="text-[#6366F1] text-lg font-medium mb-4">
              {skillName}
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-[#F8FAFC] p-1.5 rounded-lg">{skill.emoji}</span>
              <span className="text-black">Nivel {skill.level}</span>
              <span className="text-[#1E293B] font-medium">{skill.title}</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-end">
                <span className="text-[#64748B] text-sm">Tu Progreso</span>
              </div>
              <Progress 
                value={skill.progress} 
                className="h-2 bg-gray-100" 
                indicatorClassName={skill.progressClass}
              />
              <div className="flex justify-end">
                <span className="text-[#64748B] text-sm">
                  {skill.progress}% para Nivel {skill.nextLevel}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}