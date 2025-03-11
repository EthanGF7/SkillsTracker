import { NextResponse } from 'next/server'
import { LTIError } from '@/app/lib/lti/types'
import { generateNonce, generateState } from '@/app/lib/lti/utils'

// Tipos para la gestión LTI
interface OIDCPayload {
  iss: string              // Identificador del campus virtual
  login_hint: string       // Identificador de sesión
  target_link_uri: string  // URL de destino después de la autenticación
  lti_message_hint?: string // Información adicional del contexto
  client_id?: string       // Identificador del cliente
}

// Almacenamiento temporal de estados y nonces (en producción usar Redis/DB)
const stateStore = new Map<string, {
  nonce: string
  expires: number
  targetUri: string
  iss: string
}>()

// Limpiar estados expirados periódicamente
const cleanupStates = () => {
  const now = Date.now()
  for (const [state, data] of stateStore.entries()) {
    if (data.expires < now) {
      stateStore.delete(state)
    }
  }
}

// Limpiar cada 5 minutos
setInterval(cleanupStates, 5 * 60 * 1000)

export async function POST(request: Request) {
  try {
    const payload = await request.json() as OIDCPayload
    
    // Validar payload
    if (!payload.iss || !payload.login_hint || !payload.target_link_uri) {
      throw new LTIError('MISSING_REQUIRED_PARAMS', {
        required: ['iss', 'login_hint', 'target_link_uri'],
        received: Object.keys(payload)
      })
    }

    // Verificar que el emisor está registrado
    // En producción, verificar contra base de datos
    const platformConfig = process.env.ALLOWED_PLATFORMS ? 
      JSON.parse(process.env.ALLOWED_PLATFORMS) : {}

    if (!platformConfig[payload.iss]) {
      throw new LTIError('INVALID_ISSUER', { iss: payload.iss })
    }

    // Generar state y nonce
    const state = generateState()
    const nonce = generateNonce()

    // Guardar en el store temporal (válido por 5 minutos)
    stateStore.set(state, {
      nonce,
      expires: Date.now() + 5 * 60 * 1000,
      targetUri: payload.target_link_uri,
      iss: payload.iss
    })

    // Construir URL de autenticación
    const authUrl = new URL(platformConfig[payload.iss].authEndpoint)
    authUrl.searchParams.append('scope', 'openid')
    authUrl.searchParams.append('response_type', 'id_token')
    authUrl.searchParams.append('client_id', payload.client_id || process.env.LTI_CLIENT_ID || '')
    authUrl.searchParams.append('redirect_uri', process.env.LTI_REDIRECT_URI || '')
    authUrl.searchParams.append('login_hint', payload.login_hint)
    authUrl.searchParams.append('state', state)
    authUrl.searchParams.append('nonce', nonce)
    authUrl.searchParams.append('prompt', 'none')
    
    if (payload.lti_message_hint) {
      authUrl.searchParams.append('lti_message_hint', payload.lti_message_hint)
    }

    return NextResponse.json({ 
      url: authUrl.toString() 
    })

  } catch (error) {
    console.error('Error en autenticación LTI:', error)
    if (error instanceof LTIError) {
      return NextResponse.json(
        { error: error.code, details: error.details },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    )
  }
}
