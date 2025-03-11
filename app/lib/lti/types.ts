// Tipos para la gestión LTI

export interface LTIContext {
  id: string
  label?: string
  title?: string
  type?: string[]
}

export interface LTIUser {
  id: string
  name?: string
  email?: string
  roles: string[]
}

export interface LTISession {
  user: LTIUser
  context: LTIContext
  platform: string
  deploymentId: string
}

export interface LTIPlatformConfig {
  issuer: string
  authEndpoint: string
  keysetUrl: string
  accessTokenUrl?: string
  clientId: string
}

export interface JWKKey {
  kty: string
  e: string
  n: string
  kid: string
  alg: string
}

export class LTIError extends Error {
  constructor(
    public code: string,
    public details?: any
  ) {
    super(`LTI Error: ${code}`)
    this.name = 'LTIError'
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, LTIError)
    }
  }
}
