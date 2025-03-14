import { validateNewChallenge } from '../utils/challenge-validation'

interface GenerateMicroChallengeParams {
  skill: string
  level: string
  type: 'daily' | 'weekly'
}

export async function generateMicroChallenge({ skill, level, type }: GenerateMicroChallengeParams) {
  let attempts = 0
  const maxAttempts = 3

  while (attempts < maxAttempts) {
    try {
      console.log('Generando microreto:', { skill, level, type })
      
      // Determinar si es una habilidad personalizada (las que no están en la lista base)
      const baseSkills = ['Liderazgo', 'Comunicación', 'Organización', 'Resolución de problemas', 
                         'Trabajo en equipo', 'Adaptabilidad', 'Empatía', 'Creatividad', 'Gestión del tiempo']
      
      const isCustomSkill = !baseSkills.includes(skill)
      const endpoint = isCustomSkill ? 
        'http://localhost:3000/api/generate-custom-challenge' : 
        'http://localhost:3000/api/generate-challenge'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(isCustomSkill ? { 
          skillName: skill, 
          type 
        } : { 
          skill, 
          level, 
          type 
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('Error de la API:', error)
        throw new Error(error.error || 'Error al generar el microreto')
      }

      const challenge = await response.json()
      console.log('Reto generado:', challenge)

      // Validar el reto generado
      const validation = await validateNewChallenge(challenge)
      console.log('Resultado de validación:', validation)
      
      if (validation.isValid) {
        return challenge
      }

      console.log('Reto no válido, intentando de nuevo...')
      attempts++
      
      if (attempts === maxAttempts) {
        throw new Error('No se pudo generar un reto único después de varios intentos. Por favor, inténtalo de nuevo.')
      }

      // Pequeña pausa antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (error) {
      console.error('Error generando microreto:', error)
      if (attempts === maxAttempts - 1) {
        throw error
      }
      attempts++
      // Esperar más tiempo entre reintentos si hay error
      await new Promise(resolve => setTimeout(resolve, 3000))
    }
  }
}
