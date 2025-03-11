import { NextResponse } from 'next/server'

export async function GET() {
  // Configuración LTI de la herramienta
  const config = {
    title: "SkillsTracker",
    description: "Plataforma de seguimiento y desarrollo de habilidades",
    oidc_initiation_url: `${process.env.BASE_URL}/api/lti/auth`,
    target_link_uri: `${process.env.BASE_URL}/api/lti/launch`,
    custom_fields: {
      // Campos personalizados que pueden enviar los campus
      "context_memberships_url": "$ToolProxy.custom.context_memberships_url"
    },
    claims: [
      "iss",
      "sub",
      "name",
      "given_name",
      "family_name",
      "email",
      "locale",
      "https://purl.imsglobal.org/spec/lti/claim/roles",
      "https://purl.imsglobal.org/spec/lti/claim/context",
      "https://purl.imsglobal.org/spec/lti/claim/custom"
    ],
    messages: [
      {
        type: "LtiResourceLinkRequest",
        target_link_uri: `${process.env.BASE_URL}/api/lti/launch`,
        label: "SkillsTracker",
        icon_uri: `${process.env.BASE_URL}/logo.png`
      }
    ],
    public_key_jwk: {
      // En producción, generar y almacenar de forma segura
      kty: "RSA",
      e: "AQAB",
      kid: "skillstracker-key-1",
      alg: "RS256",
      n: process.env.PUBLIC_KEY_N
    }
  }

  return NextResponse.json(config)
}
