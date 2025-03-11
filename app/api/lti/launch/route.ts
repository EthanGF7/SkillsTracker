import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { LTIError, LTISession } from '@/app/lib/lti/types'
import { validateLTIRequest, mapLTIRoles, createSessionToken, verifyToken } from '@/app/lib/lti/utils'

interface LTILaunchPayload {
  iss: string                    // Identificador del emisor (campus)
  sub: string                    // Identificador del usuario
  aud: string                    // Client ID de nuestra aplicación
  exp: number                    // Tiempo de expiración
  iat: number                    // Tiempo de emisión
  nonce: string                  // Nonce para prevenir replay attacks
  name?: string                  // Nombre del usuario
  email?: string                 // Email del usuario
  'https://purl.imsglobal.org/spec/lti/claim/message_type': string
  'https://purl.imsglobal.org/spec/lti/claim/version': string
  'https://purl.imsglobal.org/spec/lti/claim/deployment_id': string
  'https://purl.imsglobal.org/spec/lti/claim/target_link_uri': string
  'https://purl.imsglobal.org/spec/lti/claim/roles': string[]
  'https://purl.imsglobal.org/spec/lti/claim/context': {
    id: string
    label?: string
    title?: string
    type?: string[]
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id_token, state } = body
    
    if (!id_token || !state) {
      throw new LTIError('TOKEN_MISSING', { 
        message: 'Se requieren id_token y state' 
      })
    }

    // Verificar y decodificar el token
    const payload = await verifyToken(id_token) as LTILaunchPayload

    if (!payload) {
      throw new LTIError('TOKEN_INVALID', {
        message: 'No se pudo decodificar el token'
      })
    }

    // Validar claims requeridos
    if (!validateLTIRequest(payload)) {
      throw new LTIError('INVALID_LTI_REQUEST', {
        message: 'Faltan claims requeridos en el token',
        received: Object.keys(payload)
      })
    }

    if (
      payload['https://purl.imsglobal.org/spec/lti/claim/message_type'] !== 'LtiResourceLinkRequest' ||
      payload['https://purl.imsglobal.org/spec/lti/claim/version'] !== '1.3.0'
    ) {
      throw new LTIError('UNSUPPORTED_LTI_VERSION', {
        messageType: payload['https://purl.imsglobal.org/spec/lti/claim/message_type'],
        version: payload['https://purl.imsglobal.org/spec/lti/claim/version']
      })
    }

    // Crear sesión
    const session: LTISession = {
      user: {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        roles: mapLTIRoles(payload['https://purl.imsglobal.org/spec/lti/claim/roles'])
      },
      context: payload['https://purl.imsglobal.org/spec/lti/claim/context'],
      platform: payload.iss,
      deploymentId: payload['https://purl.imsglobal.org/spec/lti/claim/deployment_id']
    }

    // Crear token de sesión
    const sessionToken = await createSessionToken(session)
    
    // Establecer cookie de sesión
    const cookieStore = cookies()
    cookieStore.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 horas
      path: '/'
    })

    // Determinar la URL de redirección basada en el rol del usuario
    const redirectUrl = session.user.roles.includes('instructor') 
      ? '/instructor/dashboard'
      : '/dashboard'

    return NextResponse.json({ 
      success: true,
      redirect: redirectUrl
    })

  } catch (error) {
    console.error('Error en lanzamiento LTI:', error)
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
