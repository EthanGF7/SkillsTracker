import { NextResponse } from 'next/server'
import { loadChallengeHistory, saveChallengeToHistory } from '@/app/utils/challenge-history'
import type { Challenge, Skill, Level } from '@/app/types/challenge'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as 'daily' | 'weekly'

    if (!type || !['daily', 'weekly'].includes(type)) {
      return NextResponse.json(
        { 
          error: 'Tipo de reto no válido',
          details: 'El parámetro type debe ser "daily" o "weekly"'
        }, 
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
          }
        }
      )
    }

    const challenges = await loadChallengeHistory(type)
    return NextResponse.json(
      {
        type,
        count: challenges.length,
        challenges
      }, 
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        }
      }
    )
  } catch (error) {
    console.error('Error al cargar el historial:', error)
    return NextResponse.json(
      { 
        error: 'Error al cargar el historial',
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

export async function POST(request: Request) {
  try {
    const challenge = await request.json()
    const { type } = challenge

    if (!type || !['daily', 'weekly'].includes(type)) {
      return NextResponse.json(
        { 
          error: 'Tipo de reto no válido',
          details: 'El reto debe incluir un tipo válido (daily/weekly)'
        }, 
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
          }
        }
      )
    }

    // Verificar campos requeridos
    const requiredFields = ['id', 'title', 'description', 'rules', 'extraTip', 'skill', 'level', 'createdAt']
    const missingFields = requiredFields.filter(field => !challenge[field as keyof Challenge])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: 'Datos de reto incompletos',
          details: `Faltan los siguientes campos: ${missingFields.join(', ')}`
        }, 
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
          }
        }
      )
    }

    // Asegurar que skill y level son del tipo correcto
    const typedChallenge: Challenge = {
      ...challenge,
      skill: challenge.skill as Skill,
      level: challenge.level as Level
    }

    await saveChallengeToHistory(typedChallenge, type)
    
    return NextResponse.json(
      { 
        status: 'success',
        message: 'Reto guardado correctamente',
        challenge: typedChallenge
      }, 
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        }
      }
    )
  } catch (error) {
    console.error('Error al guardar el reto:', error)
    return NextResponse.json(
      { 
        error: 'Error al guardar el reto',
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
