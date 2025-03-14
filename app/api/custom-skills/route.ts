import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import type { CustomSkillResponse } from '@/app/types/custom-skill'

interface CustomSkill extends CustomSkillResponse {
  id: string
  name: string
  createdAt: string
}

interface CustomSkillsData {
  'custom-skills': Record<string, Omit<CustomSkill, 'id' | 'name'>>
}

export async function POST(request: Request) {
  try {
    const skillData: CustomSkill = await request.json()
    
    if (!skillData.name || !skillData.description) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 })
    }

    const filePath = path.join(process.cwd(), 'app/data/custom-skills.json')
    let data: CustomSkillsData = { 'custom-skills': {} }
    
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8')
      data = JSON.parse(fileContent)
    } catch (error) {
      // Si el archivo no existe o está vacío, usamos el objeto por defecto
    }

    data['custom-skills'][skillData.name] = {
      description: skillData.description,
      keyPoints: skillData.keyPoints,
      examples: skillData.examples,
      createdAt: skillData.createdAt
    }

    await fs.writeFile(filePath, JSON.stringify(data, null, 2))

    return NextResponse.json(skillData)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error al guardar la habilidad' }, { status: 500 })
  }
}
