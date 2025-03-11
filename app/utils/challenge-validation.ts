import { loadChallengeHistory } from './challenge-history'

interface Challenge {
  id: string
  title: string
  description: string
  skill: string
  level: string
  type: 'daily' | 'weekly'
  createdAt: string
  rules: string[]
  extraTip: string
}

export function isTitleDuplicated(
  newChallenge: Partial<Challenge>,
  existingChallenges: Challenge[]
): boolean {
  // Filtrar retos del mismo skill en los últimos 30 días
  const recentDate = new Date()
  recentDate.setDate(recentDate.getDate() - 30)

  const relevantChallenges = existingChallenges.filter(challenge => {
    const challengeDate = new Date(challenge.createdAt)
    return (
      challenge.skill === newChallenge.skill &&
      challenge.type === newChallenge.type &&
      challengeDate > recentDate
    )
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

    // Verificar que el reto tenga todos los campos necesarios
    const requiredFields: (keyof Challenge)[] = [
      'title',
      'description',
      'skill',
      'level',
      'type',
      'rules',
      'extraTip'
    ]

    const missingFields = requiredFields.filter(
      field => !newChallenge[field]
    )

    if (missingFields.length > 0) {
      return {
        isValid: false,
        error: `Faltan campos requeridos: ${missingFields.join(', ')}`
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
