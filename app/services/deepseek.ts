import { DEEPSEEK_API_KEY } from "@/app/config/api"

type SkillLevel = "Aprendiz" | "Explorador" | "Maestro" | "Leyenda"

interface MicroChallenge {
  title: string
  description: string
  rules: string[]
  extraTip: string
}

interface GenerateMicroChallengeParams {
  skill: string
  level: SkillLevel
  type: "daily" | "weekly"
}

const LEVEL_DESCRIPTIONS = {
  "Aprendiz": "principiante que está comenzando a desarrollar esta habilidad",
  "Explorador": "persona con conocimientos básicos que busca expandir su comprensión",
  "Maestro": "individuo con experiencia sólida buscando perfeccionar su habilidad",
  "Leyenda": "experto que busca alcanzar la excelencia y ayudar a otros"
}

const CHALLENGE_TYPES = {
  "daily": {
    duration: "para completar en un día",
    complexity: "simple pero efectivo"
  },
  "weekly": {
    duration: "para completar en una semana",
    complexity: "más elaborado y profundo"
  }
}

export async function generateMicroChallenge({
  skill,
  level,
  type
}: GenerateMicroChallengeParams): Promise<MicroChallenge> {
  console.log('Llamando al endpoint con:', { skill, level, type })
  
  try {
    console.log('Iniciando petición a /api/generate-challenge')
    const response = await fetch('/api/generate-challenge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ skill, level, type })
    })

    console.log('Respuesta del endpoint:', {
      status: response.status,
      ok: response.ok
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Error en la respuesta:', errorText)
      throw new Error(`Error al generar el reto: ${response.statusText}`)
    }

    const challenge = await response.json()
    console.log('Reto recibido:', challenge)
    
    if (!challenge.title || !challenge.description || !Array.isArray(challenge.rules) || !challenge.extraTip) {
      console.error('Reto incompleto:', challenge)
      throw new Error('Respuesta incompleta del servidor')
    }

    return challenge as MicroChallenge
  } catch (error) {
    console.error('Error en generateMicroChallenge:', error)
    
    // Devolver un reto por defecto en caso de error
    return {
      title: "Reto de Práctica Básica",
      description: "Debido a un error técnico, te proponemos un reto básico para practicar.",
      rules: [
        "Identifica una situación donde puedas aplicar esta habilidad",
        "Practica la habilidad durante 15 minutos",
        "Reflexiona sobre tu desempeño"
      ],
      extraTip: "Mantén un registro de tu progreso para ver tu mejora con el tiempo."
    }
  }
}
