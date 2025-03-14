import { loadChallengeHistory } from './challenge-history'

interface BaseChallenge {
  id?: string
  title: string
  description: string
  type: 'daily' | 'weekly'
  createdAt?: string
}

interface StandardChallenge extends BaseChallenge {
  skill: string
  level: string
  rules: string[]
  extraTip: string
}

interface CustomChallenge extends BaseChallenge {
  skillName: string
  objectives: string[]
  metrics: string[]
}

type Challenge = StandardChallenge | CustomChallenge

function isCustomChallenge(challenge: any): challenge is CustomChallenge {
  return 'objectives' in challenge && 'metrics' in challenge && !('rules' in challenge)
}

function isStandardChallenge(challenge: any): challenge is StandardChallenge {
  return 'rules' in challenge && 'extraTip' in challenge && !('objectives' in challenge)
}

export function isTitleDuplicated(
  newChallenge: Partial<Challenge>,
  existingChallenges: Challenge[]
): boolean {
  // Filtrar retos del mismo skill en los últimos 30 días
  const recentDate = new Date()
  recentDate.setDate(recentDate.getDate() - 30)

  const relevantChallenges = existingChallenges.filter(challenge => {
    const challengeDate = new Date(challenge.createdAt || '')
    const skillMatch = isCustomChallenge(challenge) && isCustomChallenge(newChallenge)
      ? challenge.skillName === newChallenge.skillName
      : isStandardChallenge(challenge) && isStandardChallenge(newChallenge)
        ? challenge.skill === newChallenge.skill
        : false
    
    return skillMatch && challenge.type === newChallenge.type && challengeDate > recentDate
  })

  return relevantChallenges.some(
    challenge => challenge.title?.toLowerCase() === newChallenge.title?.toLowerCase()
  )
}

export async function validateNewChallenge(newChallenge: Partial<Challenge>): Promise<{
  isValid: boolean
  error?: string
}> {
  try {
    // Cargar el historial correspondiente al tipo de reto
    const existingChallenges = await loadChallengeHistory(newChallenge.type || 'daily')

    // Verificar si el título está duplicado
    if (isTitleDuplicated(newChallenge, existingChallenges)) {
      return {
        isValid: false,
        error: 'El título del reto ya existe para esta habilidad en los últimos 30 días'
      }
    }

    // Verificar campos según el tipo de reto
    if (isCustomChallenge(newChallenge)) {
      // Validación para retos personalizados
      const missingFields = ['title', 'description', 'skillName', 'type', 'objectives', 'metrics'].filter(
        field => !(field in newChallenge)
      )

      if (missingFields.length > 0) {
        return {
          isValid: false,
          error: `Faltan campos requeridos para reto personalizado: ${missingFields.join(', ')}`
        }
      }

      // Validar que los arrays no estén vacíos
      const challenge = newChallenge as CustomChallenge
      if (!challenge.objectives?.length || !challenge.metrics?.length) {
        return {
          isValid: false,
          error: 'Los objetivos y métricas son obligatorios para retos personalizados'
        }
      }
    } else if (isStandardChallenge(newChallenge)) {
      // Validación para retos estándar
      const missingFields = ['title', 'description', 'skill', 'level', 'type', 'rules', 'extraTip'].filter(
        field => !(field in newChallenge)
      )

      if (missingFields.length > 0) {
        return {
          isValid: false,
          error: `Faltan campos requeridos para reto estándar: ${missingFields.join(', ')}`
        }
      }

      // Validar que rules no esté vacío
      const challenge = newChallenge as StandardChallenge
      if (!challenge.rules?.length) {
        return {
          isValid: false,
          error: 'Las reglas son obligatorias para retos estándar'
        }
      }
    } else {
      return {
        isValid: false,
        error: 'El formato del reto no es válido'
      }
    }

    return { isValid: true }
  } catch (error) {
    console.error('Error validando el nuevo reto:', error)
    return {
      isValid: false,
      error: 'Error al validar el reto'
    }
  }
}
