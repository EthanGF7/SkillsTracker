export interface CustomSkill {
  name: string
  description: string
  createdAt: string
  keyPoints: string[]
  examples: string[]
}

export interface CustomSkillResponse {
  description: string
  keyPoints: string[]
  examples: string[]
}
