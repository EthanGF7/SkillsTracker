import { JWKKey, LTIError, LTISession } from './types'
import crypto from 'crypto'

export async function verifyToken(token: string): Promise<any> {
  try {
    const [headerB64, payloadB64, signature] = token.split('.')
    
    // Decodificar el payload
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString())
    
    // En producción, verificar la firma usando la clave pública del emisor
    // Por ahora solo verificamos la estructura
    return payload
  } catch (error) {
    throw new LTIError('TOKEN_VERIFICATION_FAILED', { cause: error })
  }
}

export async function createSessionToken(session: LTISession): Promise<string> {
  try {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    }

    const payload = {
      ...session,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 horas
    }

    const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url')
    const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url')
    
    const signature = crypto
      .createHmac('sha256', process.env.SESSION_SECRET || 'temporary-secret')
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64url')

    return `${headerB64}.${payloadB64}.${signature}`
  } catch (error) {
    throw new LTIError('TOKEN_CREATION_FAILED', { cause: error })
  }
}

export function generateNonce(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function generateState(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function validateLTIRequest(payload: any): boolean {
  const requiredClaims = [
    'iss',
    'sub',
    'aud',
    'exp',
    'iat',
    'nonce',
    'https://purl.imsglobal.org/spec/lti/claim/message_type',
    'https://purl.imsglobal.org/spec/lti/claim/version',
    'https://purl.imsglobal.org/spec/lti/claim/deployment_id'
  ]

  return requiredClaims.every(claim => payload.hasOwnProperty(claim))
}

export function mapLTIRoles(roles: string[]): string[] {
  const roleMap: Record<string, string> = {
    'http://purl.imsglobal.org/vocab/lis/v2/institution/person#Administrator': 'admin',
    'http://purl.imsglobal.org/vocab/lis/v2/institution/person#Instructor': 'instructor',
    'http://purl.imsglobal.org/vocab/lis/v2/institution/person#Student': 'student'
  }

  return roles.map(role => roleMap[role] || 'user')
}
