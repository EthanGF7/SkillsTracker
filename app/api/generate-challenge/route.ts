import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { DEEPSEEK_API_KEY, DEEPSEEK_API_URL } from '@/app/config/api'
import { saveChallengeToHistory, loadChallengeHistory, isSimilarToExisting } from '@/app/utils/challenge-history'
import type { Challenge, Skill, Level } from '@/app/types/challenge'
import { promises as fs } from 'fs'
import path from 'path'
import type { CustomSkill } from '@/app/types/custom-skill'

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

async function getCustomSkillDescription(skillName: string): Promise<CustomSkill | null> {
  try {
    const filePath = path.join(process.cwd(), 'app/data/custom-skills.json')
    const fileContent = await fs.readFile(filePath, 'utf-8')
    const data = JSON.parse(fileContent)
    return data['custom-skills'][skillName] || null
  } catch (error) {
    console.error('Error al leer habilidad personalizada:', error)
    return null
  }
}

export async function POST(request: Request) {
  try {
    const { skill, level, type } = await request.json() as { skill: string; level: Level; type: ChallengeType }
    
    if (!skill || !level || !type) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos' },
        { status: 400 }
      )
    }

    console.log('Generando reto:', { skill, level, type })

    // Obtener prompt según el tipo de habilidad
    let context = '';
    let examples: string[] = [];

    const skillPrompt = skillPrompts[skill as Skill];
    if (skillPrompt) {
      // Es una habilidad predefinida
      context = skillPrompt.context;
      examples = skillPrompt.examples[type];
    } else {
      // Es una habilidad personalizada
      const customSkill = await getCustomSkillDescription(skill);
      if (!customSkill) {
        return NextResponse.json({ error: 'Habilidad no encontrada' }, { status: 404 });
      }

      context = `Eres un experto en desarrollo de habilidades personales.
${customSkill.description}

Puntos clave:
${customSkill.keyPoints.join('\n')}`;
      
      examples = type === 'daily' 
        ? ['Practica la habilidad en una situación cotidiana', 'Aplica la habilidad en un contexto específico']
        : ['Desarrolla un proyecto semanal usando esta habilidad', 'Implementa la habilidad en diferentes situaciones'];
    }

    const systemMessage = {
      role: 'system',
      content: `${context}

IMPORTANTE:
1. Genera un reto ${type === 'daily' ? 'DIARIO' : 'SEMANAL'} específico para la habilidad "${skill}".
2. Los retos diarios deben ser concisos y realizables en un día.
3. Los retos semanales deben ser más elaborados y tener mayor impacto.
4. Adapta la complejidad al nivel "${level}".

Ejemplos de buenos retos ${type}:
${examples.map(ex => `- ${ex}`).join('\n')}

Responde SOLO con un objeto JSON con esta estructura exacta:
{
  "title": "título breve y específico",
  "description": "descripción detallada que explique el propósito y beneficios",
  "rules": ["regla1", "regla2", "regla3"],
  "extraTip": "consejo adicional para mejorar la experiencia"
}`
    };

    const userMessage = {
      role: 'user',
      content: `Genera un reto ${type} para la habilidad "${skill}" con nivel "${level}"`
    };

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
        max_tokens: 1000
      })
    })

    if (!response.ok) {
      console.error('Error en la API:', await response.text())
      return NextResponse.json(
        { error: 'Error al generar el reto' },
        { status: response.status }
      )
    }

    const data = await response.json()
    const challenge = JSON.parse(data.choices[0].message.content)

    // Validar la estructura de la respuesta
    if (!challenge.title || !challenge.description || !challenge.rules || !challenge.extraTip) {
      return NextResponse.json(
        { error: 'Respuesta inválida de la API' },
        { status: 500 }
      )
    }

    const newChallenge: Challenge = {
      id: uuidv4(),
      title: challenge.title,
      description: challenge.description,
      rules: challenge.rules,
      extraTip: challenge.extraTip,
      skill,
      level,
      type,
      createdAt: new Date().toISOString()
    }

    // Verificar si el reto es similar a uno existente
    const history = await loadChallengeHistory(type)
    const isSimilar = await isSimilarToExisting(newChallenge, history)

    if (isSimilar) {
      return NextResponse.json(
        { error: 'Reto similar ya existe' },
        { status: 400 }
      )
    }

    // Guardar el reto en el historial
    await saveChallengeToHistory(newChallenge, type)

    return NextResponse.json(newChallenge)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
