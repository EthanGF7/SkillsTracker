import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { DEEPSEEK_API_KEY, DEEPSEEK_API_URL } from '@/app/config/api'
import { saveChallengeToHistory, loadChallengeHistory, isSimilarToExisting } from '@/app/utils/challenge-history'
import type { Challenge, Skill } from '@/app/types/challenge'

type ChallengeType = 'daily' | 'weekly';

const skillPrompts: Record<Skill, { context: string; examples: { daily: string[]; weekly: string[] } }> = {
  'Empatía': {
    context: 'Eres un experto en desarrollo de habilidades emocionales y sociales. Tu objetivo es crear retos que ayuden a desarrollar la empatía en situaciones cotidianas y profesionales.',
    examples: {
      daily: [
        'Practica la escucha activa con tres personas diferentes hoy',
        'Observa y anota las emociones de las personas con las que interactúas',
        'Intenta ver una situación desde el punto de vista de otra persona'
      ],
      weekly: [
        'Mantén un diario de empatía durante una semana, documentando las emociones de otros',
        'Organiza una actividad grupal donde cada persona comparta una experiencia personal',
        'Realiza un proyecto que beneficie a un grupo diferente al tuyo'
      ]
    }
  },
  'Creatividad': {
    context: 'Eres un experto en desarrollo del pensamiento creativo. Tu objetivo es crear retos que estimulen la innovación y el pensamiento lateral.',
    examples: {
      daily: [
        'Encuentra cinco usos no convencionales para un objeto común',
        'Dibuja o escribe algo usando tu mano no dominante',
        'Resuelve un problema cotidiano de una manera totalmente nueva'
      ],
      weekly: [
        'Crea un proyecto artístico usando solo materiales reciclados',
        'Desarrolla una historia usando perspectivas de diferentes personajes',
        'Diseña una solución innovadora para un problema de tu comunidad'
      ]
    }
  },
  'Comunicación': {
    context: 'Eres un experto en habilidades de comunicación. Tu objetivo es crear retos que mejoren la capacidad de expresar ideas y escuchar efectivamente.',
    examples: {
      daily: [
        'Explica un concepto complejo usando solo analogías simples',
        'Practica comunicación no verbal consciente durante una conversación',
        'Da y recibe feedback constructivo en una situación específica'
      ],
      weekly: [
        'Prepara y da una presentación sobre un tema que te apasione',
        'Organiza un debate grupal sobre un tema controvertido',
        'Crea un podcast o video explicativo sobre un tema complejo'
      ]
    }
  },
  'Trabajo en equipo': {
    context: 'Eres un experto en dinámicas de grupo y colaboración. Tu objetivo es crear retos que mejoren la capacidad de trabajar efectivamente con otros.',
    examples: {
      daily: [
        'Ofrece ayuda proactivamente a tres compañeros diferentes',
        'Participa activamente en una reunión de equipo',
        'Resuelve un conflicto menor usando la comunicación efectiva'
      ],
      weekly: [
        'Organiza un proyecto colaborativo con roles bien definidos',
        'Implementa un sistema de feedback grupal constructivo',
        'Coordina una actividad que requiera la participación de varios equipos'
      ]
    }
  },
  'Liderazgo': {
    context: 'Eres un experto en desarrollo de liderazgo. Tu objetivo es crear retos que desarrollen habilidades de liderazgo efectivo y motivación de equipos.',
    examples: {
      daily: [
        'Toma la iniciativa en una situación que requiera dirección',
        'Practica la delegación efectiva de una tarea',
        'Motiva a un compañero que enfrenta un desafío'
      ],
      weekly: [
        'Desarrolla un plan de mejora para tu equipo o grupo',
        'Implementa un sistema de reconocimiento y motivación',
        'Lidera un proyecto desde su concepción hasta su finalización'
      ]
    }
  },
  'Organización': {
    context: 'Eres un experto en gestión del tiempo y organización. Tu objetivo es crear retos que mejoren la capacidad de planificar y estructurar actividades.',
    examples: {
      daily: [
        'Implementa la técnica Pomodoro durante un día completo',
        'Reorganiza tu espacio de trabajo para máxima eficiencia',
        'Prioriza y completa las tres tareas más importantes del día'
      ],
      weekly: [
        'Crea y sigue un sistema de organización personal completo',
        'Implementa un método de gestión de proyectos para tus actividades',
        'Desarrolla un plan de productividad semanal detallado'
      ]
    }
  },
  'Adaptabilidad': {
    context: 'Eres un experto en gestión del cambio y resiliencia. Tu objetivo es crear retos que mejoren la capacidad de adaptación a nuevas situaciones.',
    examples: {
      daily: [
        'Cambia una rutina establecida por una nueva',
        'Enfrenta una situación fuera de tu zona de confort',
        'Practica respuestas positivas ante cambios inesperados'
      ],
      weekly: [
        'Aprende una nueva habilidad completamente diferente',
        'Implementa cambios significativos en tu rutina semanal',
        'Desarrolla estrategias para manejar situaciones imprevistas'
      ]
    }
  },
  'Resolución de problemas': {
    context: 'Eres un experto en pensamiento crítico y resolución de problemas. Tu objetivo es crear retos que mejoren la capacidad de analizar y resolver situaciones complejas.',
    examples: {
      daily: [
        'Resuelve un problema usando el método de los cinco porqués',
        'Aplica el pensamiento lateral a un desafío cotidiano',
        'Analiza un problema desde tres perspectivas diferentes'
      ],
      weekly: [
        'Desarrolla un proyecto usando metodología de design thinking',
        'Crea un sistema para resolver problemas recurrentes',
        'Implementa soluciones innovadoras para desafíos complejos'
      ]
    }
  },
  'Gestión del tiempo': {
    context: 'Eres un experto en productividad y administración del tiempo. Tu objetivo es crear retos que mejoren la eficiencia y planificación personal.',
    examples: {
      daily: [
        'Aplica la matriz de Eisenhower a tus tareas diarias',
        'Elimina tres actividades que desperdicien tiempo',
        'Implementa bloques de tiempo enfocado'
      ],
      weekly: [
        'Crea un sistema de seguimiento del tiempo detallado',
        'Desarrolla un plan de productividad personalizado',
        'Optimiza tu rutina semanal para máxima eficiencia'
      ]
    }
  }
}

export async function POST(request: Request) {
  try {
    const { skill, level, type } = await request.json() as { skill: Skill; level: string; type: ChallengeType }
    
    if (!skill || !level || !type) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos' },
        { status: 400 }
      )
    }

    console.log('Generando reto:', { skill, level, type })

    const skillPrompt = skillPrompts[skill]
    if (!skillPrompt) {
      return NextResponse.json(
        { error: 'Habilidad no válida' },
        { status: 400 }
      )
    }

    const systemMessage = {
      role: 'system',
      content: `${skillPrompt.context}

IMPORTANTE: 
1. Genera un reto ${type === 'daily' ? 'DIARIO' : 'SEMANAL'} específico para la habilidad "${skill}".
2. Los retos diarios deben ser concisos y realizables en un día.
3. Los retos semanales deben ser más elaborados y tener mayor impacto.
4. NO repitas ejemplos similares a retos anteriores.
5. Adapta la complejidad al nivel "${level}".

Ejemplos de buenos retos ${type === 'daily' ? 'DIARIOS' : 'SEMANALES'} para ${skill}:
${skillPrompt.examples[type as 'daily' | 'weekly'].map((ex: string) => `- ${ex}`).join('\n')}

Responde SOLO con un objeto JSON con esta estructura exacta:
{
  "title": "título breve y específico",
  "description": "descripción detallada que explique el propósito y beneficios",
  "rules": ["regla1", "regla2", "regla3"],
  "extraTip": "consejo adicional para mejorar la experiencia"
}`
    }

    const userMessage = {
      role: 'user',
      content: `Genera un reto ${type === 'daily' ? 'DIARIO' : 'SEMANAL'} de nivel "${level}" que se centre específicamente en desarrollar la habilidad de ${skill}. ${type === 'daily' ? 'El reto debe ser conciso y realizable en un día.' : 'El reto debe ser más elaborado y tener un impacto significativo durante la semana.'}`
    }

    console.log('Conectando a:', DEEPSEEK_API_URL)
    
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        messages: [systemMessage, userMessage],
        model: 'deepseek-chat',
        temperature: 0.7,
        max_tokens: 1000,
        stream: false
      })
    })

    if (!response.ok) {
      console.error('Error de la API:', response.status, response.statusText)
      const errorText = await response.text()
      console.error('Respuesta de error completa:', errorText)
      return NextResponse.json(
        { 
          error: 'Error de la API',
          details: {
            status: response.status,
            statusText: response.statusText,
            error: errorText,
            requestBody: JSON.stringify({
              messages: [systemMessage, userMessage],
              model: 'deepseek-chat',
              temperature: 0.7,
              max_tokens: 1000,
              stream: false
            })
          }
        }, 
        { 
          status: response.status,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
          }
        }
      )
    }

    console.log('Response headers:', Object.fromEntries(response.headers.entries()))
    const data = await response.json()
    console.log('Respuesta completa de la API:', JSON.stringify(data, null, 2))
    console.log('Choices:', data.choices)
    console.log('Primer choice:', data.choices?.[0])
    console.log('Mensaje:', data.choices?.[0]?.message)
    console.log('Contenido:', data.choices?.[0]?.message?.content)

    if (!data.choices?.[0]?.message?.content) {
      return NextResponse.json(
        { 
          error: 'Respuesta inválida de la API',
          details: {
            data,
            headers: Object.fromEntries(response.headers.entries())
          }
        }, 
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
          }
        }
      )
    }

    let challenge: any
    try {
      const content = data.choices[0].message.content

      // Asegurarse de que es un JSON válido
      let parsedContent
      try {
        parsedContent = JSON.parse(content)
      } catch (e) {
        console.error('Error parseando respuesta:', content)
        throw new Error('La respuesta no es un JSON válido')
      }

      // Validar estructura
      if (!parsedContent.title || !parsedContent.description || !Array.isArray(parsedContent.rules)) {
        throw new Error('La respuesta no tiene la estructura correcta')
      }

      challenge = parsedContent
      console.log('Challenge parseado:', challenge)
    } catch (error) {
      console.error('Error procesando el contenido del mensaje:', error)
      return NextResponse.json(
        { 
          error: 'Error procesando el contenido del mensaje',
          details: {
            error: error instanceof Error ? error.message : 'Error desconocido',
            content: data.choices[0].message.content
          }
        }, 
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
          }
        }
      )
    }

    // 4. Verificar que el reto sea único
    const existingChallenges = await loadChallengeHistory(type)
    const newChallenge: Challenge = {
      id: uuidv4(),
      ...challenge,
      skill: skill as Skill,
      level,
      type,
      createdAt: new Date().toISOString()
    }

    const isSimilar = await isSimilarToExisting(newChallenge, existingChallenges)
    if (isSimilar) {
      console.log('Reto similar encontrado, generando uno nuevo...')
      return NextResponse.json(
        { error: 'Reto similar encontrado, intentando de nuevo...' },
        { status: 409 }
      )
    }

    // 5. Guardar el nuevo reto
    await saveChallengeToHistory(newChallenge, type)

    // 6. Devolver el reto generado
    return NextResponse.json(newChallenge, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    })

  } catch (error) {
    console.error('Error completo:', error)
    return NextResponse.json(
      { 
        error: 'Error inesperado',
        details: error instanceof Error ? error.message : 'Error desconocido'
      }, 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        }
      }
    )
  }
}
