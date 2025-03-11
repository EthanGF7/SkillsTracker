import { NextResponse } from 'next/server'
import { DEEPSEEK_API_KEY, DEEPSEEK_API_URL, validateApiConfig } from '@/app/config/api'

export async function GET() {
  const startTime = new Date().toISOString()
  
  try {
    // 1. Validar configuración
    console.log('Iniciando prueba de API key...')
    const config = validateApiConfig()

    if (!config.apiKey.present) {
      console.error('Error: API Key no configurada')
      return NextResponse.json(
        { 
          timestamp: startTime,
          status: 'error',
          error: 'API Key no configurada',
          details: {
            message: 'No se encontró la API key en las variables de entorno',
            solution: 'Asegúrate de tener un archivo .env.local con DEEPSEEK_API_KEY configurada',
            config
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

    // 2. Preparar la petición
    console.log('Preparando petición a:', DEEPSEEK_API_URL)
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "user",
            content: "Test de conexión: Por favor responde 'OK' si recibes este mensaje."
          }
        ]
      })
    }

    console.log('Headers configurados:', JSON.stringify({
      ...requestOptions.headers,
      'Authorization': 'Bearer [HIDDEN]'
    }, null, 2))
    
    // 3. Hacer la petición
    console.log('Enviando petición...')
    const requestStartTime = new Date().toISOString()
    const response = await fetch(`${DEEPSEEK_API_URL}/v1/chat/completions`, requestOptions)
    const requestEndTime = new Date().toISOString()
    
    console.log('Respuesta recibida. Status:', response.status, response.statusText)
    
    // 4. Leer y verificar la respuesta
    const responseText = await response.text()
    console.log('Respuesta completa:', responseText)

    let jsonData
    try {
      jsonData = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Error parseando la respuesta:', parseError)
      return NextResponse.json(
        {
          timestamp: startTime,
          status: 'error',
          error: 'Error parseando la respuesta',
          details: {
            message: 'La respuesta de la API no es un JSON válido',
            responseText: responseText,
            parseError: parseError instanceof Error ? parseError.message : 'Error desconocido',
            requestInfo: {
              url: `${DEEPSEEK_API_URL}/v1/chat/completions`,
              method: requestOptions.method,
              headers: {
                ...requestOptions.headers,
                'Authorization': 'Bearer [HIDDEN]'
              },
              startTime: requestStartTime,
              endTime: requestEndTime
            }
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

    if (!response.ok) {
      console.error('Error en la respuesta de la API:', jsonData)
      return NextResponse.json(
        {
          timestamp: startTime,
          status: 'error',
          error: 'Error en la API',
          details: {
            statusCode: response.status,
            statusText: response.statusText,
            apiResponse: jsonData,
            requestInfo: {
              url: `${DEEPSEEK_API_URL}/v1/chat/completions`,
              method: requestOptions.method,
              headers: {
                ...requestOptions.headers,
                'Authorization': 'Bearer [HIDDEN]'
              },
              startTime: requestStartTime,
              endTime: requestEndTime
            }
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

    // 5. Devolver resultado exitoso
    console.log('Prueba completada con éxito')
    return NextResponse.json({
      timestamp: startTime,
      status: 'success',
      message: 'API key válida y funcionando correctamente',
      details: {
        apiConfig: {
          ...config,
          apiKey: {
            ...config.apiKey,
            value: '[HIDDEN]'
          }
        },
        request: {
          url: `${DEEPSEEK_API_URL}/v1/chat/completions`,
          method: requestOptions.method,
          startTime: requestStartTime,
          endTime: requestEndTime,
          duration: new Date(requestEndTime).getTime() - new Date(requestStartTime).getTime()
        },
        response: {
          status: response.status,
          statusText: response.statusText,
          data: jsonData
        }
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    })

  } catch (error) {
    console.error('Error completo:', error)
    return NextResponse.json(
      {
        timestamp: startTime,
        status: 'error',
        error: 'Error inesperado',
        details: {
          message: error instanceof Error ? error.message : 'Error desconocido',
          stack: error instanceof Error ? error.stack : undefined,
          name: error instanceof Error ? error.name : undefined,
          config: validateApiConfig()
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
}
