import { NextResponse } from 'next/server'
import { DEEPSEEK_API_KEY, DEEPSEEK_API_URL } from '@/app/config/api'

interface SkillDescription {
  description: string
  keyPoints: string[]
  examples: string[]
}

async function generateAIDescription(skillName: string): Promise<SkillDescription> {
  try {
    const prompt = `Genera una descripción detallada y profesional para la habilidad "${skillName}". 
    La respuesta debe estar en formato JSON con la siguiente estructura:
    {
      "description": "Una descripción detallada de la habilidad y su importancia",
      "keyPoints": ["4-5 puntos clave sobre cómo desarrollar esta habilidad"],
      "examples": ["3-4 ejemplos prácticos de cómo aplicar esta habilidad"]
    }
    La descripción debe ser motivadora, práctica y enfocada en el desarrollo personal y profesional.`;

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
    return JSON.parse(content);
  } catch (error) {
    console.error('Error generando descripción con IA:', error);
    return generateFallbackDescription(skillName);
  }
}

function generateFallbackDescription(skillName: string): SkillDescription {
  const name = skillName.toLowerCase();
  
  if (name === 'asertividad') {
    return {
      description: "La asertividad es una habilidad fundamental que permite expresar pensamientos, sentimientos y necesidades de manera clara, directa y respetuosa, manteniendo un equilibrio entre los derechos propios y los de los demás. Esta competencia es esencial para establecer relaciones interpersonales saludables y alcanzar objetivos personales y profesionales.",
      keyPoints: [
        "Expresar opiniones y necesidades de manera clara y respetuosa",
        "Establecer límites saludables en las relaciones",
        "Mantener el equilibrio entre la empatía y la firmeza",
        "Desarrollar la autoconfianza en la comunicación"
      ],
      examples: [
        "Practicar la comunicación asertiva en situaciones cotidianas",
        "Expresar desacuerdos de manera constructiva",
        "Defender puntos de vista respetando otras opiniones"
      ]
    }
  }

  return {
    description: `${name} es una habilidad esencial que potencia el desarrollo personal y profesional. Esta competencia permite mejorar el desempeño en diversos contextos, facilitando el logro de objetivos y el crecimiento continuo a través de la práctica y el aprendizaje constante.`,
    keyPoints: [
      `Desarrollar un plan estructurado para mejorar en ${name}`,
      `Practicar ${name} en diferentes situaciones y contextos`,
      `Buscar retroalimentación y oportunidades de mejora`,
      `Establecer metas específicas relacionadas con ${name}`
    ],
    examples: [
      `Aplicar ${name} en situaciones cotidianas y profesionales`,
      `Crear proyectos específicos para desarrollar ${name}`,
      `Compartir experiencias y aprendizajes sobre ${name}`
    ]
  }
}

export async function POST(request: Request) {
  try {
    const { skillName } = await request.json()
    
    if (!skillName) {
      return NextResponse.json({ error: 'Falta el nombre de la habilidad' }, { status: 400 })
    }

    const skillDescription = await generateAIDescription(skillName)
    return NextResponse.json(skillDescription)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error al generar la descripción' }, { status: 500 })
  }
}
