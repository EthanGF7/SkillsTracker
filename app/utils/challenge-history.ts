import { promises as fs } from 'fs'
import path from 'path'
import type { Challenge } from '../types/challenge'

// Constantes
const DATA_DIR = path.join(process.cwd(), 'app/data')
const HISTORY_RETENTION_DAYS = 90

function getHistoryFilePath(type: 'daily' | 'weekly'): string {
  return path.join(DATA_DIR, `${type}-challenges.json`)
}

// Funciones principales
export async function loadChallengeHistory(type: 'daily' | 'weekly'): Promise<Challenge[]> {
  try {
    // Asegurar que el directorio existe
    await fs.mkdir(DATA_DIR, { recursive: true })
    
    const filePath = getHistoryFilePath(type)
    try {
      const data = await fs.readFile(filePath, 'utf8')
      const parsed = JSON.parse(data)
      return Array.isArray(parsed) ? parsed : []
    } catch (error) {
      // Si el archivo no existe o está corrupto, crear uno nuevo
      await fs.writeFile(filePath, '[]')
      return []
    }
  } catch (error) {
    console.error(`Error loading ${type} challenges:`, error)
    return []
  }
}

export async function saveChallengeToHistory(challenge: Challenge, type: 'daily' | 'weekly'): Promise<void> {
  try {
    // Asegurar que el directorio existe
    await fs.mkdir(DATA_DIR, { recursive: true })
    
    const filePath = getHistoryFilePath(type)
    let challenges: Challenge[] = []
    
    try {
      const data = await fs.readFile(filePath, 'utf8')
      const parsed = JSON.parse(data)
      challenges = Array.isArray(parsed) ? parsed : []
    } catch {
      // Si hay error al leer, empezar con array vacío
      challenges = []
    }
    
    // Añadir el nuevo reto al principio
    challenges.unshift(challenge)
    
    // Limpiar retos antiguos
    const cleanedChallenges = cleanOldChallenges(challenges)
    
    // Guardar al archivo
    await fs.writeFile(filePath, JSON.stringify(cleanedChallenges, null, 2))
  } catch (error) {
    console.error(`Error saving ${type} challenge:`, error)
    throw new Error('Error al guardar el reto')
  }
}

export async function isSimilarToExisting(_newChallenge: Challenge, _existingChallenges: Challenge[]): Promise<boolean> {
  // Deshabilitada temporalmente la validación de similitud
  return false
}

function cleanOldChallenges(challenges: Challenge[]): Challenge[] {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - HISTORY_RETENTION_DAYS)
  
  return challenges.filter(challenge => {
    try {
      return new Date(challenge.createdAt) > cutoffDate
    } catch {
      return false
    }
  })
}
