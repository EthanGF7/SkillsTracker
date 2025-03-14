import { NextResponse } from 'next/server'
import { DEEPSEEK_API_KEY, DEEPSEEK_API_URL } from '@/app/config/api'

interface CustomChallenge {
  title: string
  description: string
  objectives: string[]
  metrics: string[]
  type: 'daily' | 'weekly'
}

async function generateCustomChallenge(skillName: string, type: 'daily' | 'weekly'): Promise<CustomChallenge> {
  try {
    const prompt = `Genera un reto personalizado para desarrollar la habilidad "${skillName}". 
    El reto debe ser para un período ${type === 'daily' ? 'diario' : 'semanal'}.
    La respuesta debe estar en formato JSON con la siguiente estructura:
    {
      "title": "Un título conciso y motivador para el reto",
      "description": "Una descripción detallada del reto y cómo ayuda a desarrollar la habilidad",
      "objectives": ["3-4 objetivos específicos y medibles"],
      "metrics": ["2-3 formas de medir el progreso"]
    }
    
    Ten en cuenta:
    - Para retos diarios: actividades concretas y realizables en un día
    - Para retos semanales: proyectos más elaborados con mayor impacto
    - Enfócate en resultados medibles
    - Adapta la complejidad al período de tiempo`;

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error('Error en la llamada a la API');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const challenge = JSON.parse(content);
    return { ...challenge, type };
  } catch (error) {
    console.error('Error generando reto personalizado:', error);
    // Fallback para cuando falla la IA
    return generateFallbackChallenge(skillName, type);
  }
}

function generateFallbackChallenge(skillName: string, type: 'daily' | 'weekly'): CustomChallenge {
  if (type === 'daily') {
    return {
      title: `Desarrollo diario de ${skillName}`,
      description: `Un reto diario para mejorar tu ${skillName} a través de actividades prácticas y medibles.`,
      objectives: [
        `Practicar ${skillName} en al menos 2 situaciones diferentes`,
        `Documentar tus experiencias y aprendizajes`,
        `Identificar áreas de mejora específicas`
      ],
      metrics: [
        'Número de situaciones donde se practicó la habilidad',
        'Autoevaluación de efectividad (escala 1-5)'
      ],
      type: 'daily'
    };
  }

  return {
    title: `Proyecto semanal de ${skillName}`,
    description: `Un reto semanal diseñado para desarrollar tu ${skillName} de manera estructurada y progresiva.`,
    objectives: [
      `Crear un plan de desarrollo para ${skillName}`,
      `Implementar la habilidad en diferentes contextos`,
      `Obtener retroalimentación de otros`,
      `Evaluar el progreso y ajustar estrategias`
    ],
    metrics: [
      'Cumplimiento de objetivos semanales',
      'Feedback recibido de otros participantes',
      'Registro de mejoras observadas'
    ],
    type: 'weekly'
  };
}

export async function POST(request: Request) {
  try {
    const { skillName, type } = await request.json();
    
    if (!skillName || !type) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos (skillName o type)' },
        { status: 400 }
      );
    }

    if (type !== 'daily' && type !== 'weekly') {
      return NextResponse.json(
        { error: 'Tipo de reto inválido. Debe ser "daily" o "weekly"' },
        { status: 400 }
      );
    }

    const challenge = await generateCustomChallenge(skillName, type);
    return NextResponse.json(challenge);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error al generar el reto personalizado' },
      { status: 500 }
    );
  }
}
