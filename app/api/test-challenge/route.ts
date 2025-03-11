import { NextResponse } from 'next/server'
import { DEEPSEEK_API_KEY, DEEPSEEK_API_URL } from '@/app/config/api'

export async function GET() {
  try {
    // 1. Probar crear directorio
    const fs = require('fs').promises
    const path = require('path')
    const dataDir = path.join(process.cwd(), 'data')
    
    console.log('Intentando crear directorio:', dataDir)
    try {
      await fs.mkdir(dataDir, { recursive: true })
      console.log('Directorio creado o ya existente')
    } catch (error) {
      console.error('Error creando directorio:', error)
    }

    // 2. Probar escribir archivo
    const testFile = path.join(dataDir, 'test.json')
    console.log('Intentando escribir archivo:', testFile)
    try {
      await fs.writeFile(testFile, JSON.stringify({ test: 'ok' }))
      console.log('Archivo escrito correctamente')
    } catch (error) {
      console.error('Error escribiendo archivo:', error)
    }

    // 3. Probar leer archivo
    console.log('Intentando leer archivo:', testFile)
    try {
      const content = await fs.readFile(testFile, 'utf-8')
      console.log('Archivo leído correctamente:', content)
    } catch (error) {
      console.error('Error leyendo archivo:', error)
    }

    // 4. Probar API
    console.log('Probando API...')
    const response = await fetch(`${DEEPSEEK_API_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "user",
            content: "Genera un reto simple en formato JSON con esta estructura exacta: {\"title\": \"Test\", \"description\": \"Test description\", \"rules\": [\"rule1\"], \"extraTip\": \"tip\"}"
          }
        ],
        temperature: 0.1,
        max_tokens: 200,
        stream: false
      })
    })

    const data = await response.json()
    console.log('Respuesta de la API:', JSON.stringify(data, null, 2))

    // 5. Probar parsear respuesta
    const content = data.choices[0].message.content
    console.log('Contenido recibido:', content)
    
    const cleanContent = content.trim().replace(/^```json\n?|\n?```$/g, '')
    console.log('Contenido limpio:', cleanContent)
    
    const challenge = JSON.parse(cleanContent)
    console.log('Challenge parseado:', challenge)

    return NextResponse.json({
      success: true,
      filesystem: {
        dataDir,
        testFile,
        canWrite: true,
        canRead: true
      },
      api: {
        response: data,
        parsedChallenge: challenge
      }
    })

  } catch (error) {
    console.error('Error completo:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined
    })
  }
}
