import { NextResponse } from 'next/server'
import { DEEPSEEK_API_KEY, DEEPSEEK_API_URL } from '@/app/config/api'

export async function GET() {
  try {
    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { 
          valid: false,
          error: 'API Key no configurada'
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

    // Hacer una petición simple a la API
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
            content: "Responde solo con 'OK'"
          }
        ],
        temperature: 0.1,
        max_tokens: 10,
        stream: false
      })
    })

    console.log('Status de la API:', response.status)
    console.log('Headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Error de la API:', errorText)
      return NextResponse.json(
        {
          valid: false,
          error: 'Error de autenticación',
          details: {
            status: response.status,
            statusText: response.statusText,
            error: errorText
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

    const data = await response.json()
    console.log('Respuesta:', JSON.stringify(data, null, 2))

    return NextResponse.json(
      {
        valid: true,
        details: {
          model: data.model,
          created: data.created,
          response: data.choices?.[0]?.message?.content
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        }
      }
    )

  } catch (error) {
    console.error('Error completo:', error)
    return NextResponse.json(
      {
        valid: false,
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
