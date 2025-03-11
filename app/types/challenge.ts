export interface Challenge {
  id: string
  title: string
  description: string
  rules: string[]
  extraTip: string
  skill: Skill
  level: Level
  type: 'daily' | 'weekly'
  createdAt: string
}

export type Skill = 
  | 'Comunicación' 
  | 'Trabajo en equipo' 
  | 'Liderazgo'
  | 'Organización'
  | 'Adaptabilidad'
  | 'Resolución de problemas'
  | 'Empatía'
  | 'Creatividad'
  | 'Gestión del tiempo'

export type Level = 'Explorador' | 'Practicante' | 'Experto'
