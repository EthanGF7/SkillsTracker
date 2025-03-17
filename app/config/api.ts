// Configuración de la API de DeepSeek
export const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || ''

// Configuración de la URL base
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  }
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }
  if (process.env.NODE_ENV === 'production') {
    return process.env.URL || ''
  }
  return 'http://localhost:3000'
}

// URLs de la API
export const API_URLS = {
  generateChallenge: `${getBaseUrl()}/api/generate-challenge`,
  generateCustomChallenge: `${getBaseUrl()}/api/generate-custom-challenge`,
  generateSkillDescription: `${getBaseUrl()}/api/generate-skill-description`
}

// Configuración de la URL de la API de DeepSeek
export const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

// Función para validar la configuración
export function validateApiConfig() {
  const config = {
    apiKey: {
      present: Boolean(DEEPSEEK_API_KEY),
      length: DEEPSEEK_API_KEY?.length || 0,
      envVar: 'DEEPSEEK_API_KEY'
    },
    apiUrl: DEEPSEEK_API_URL,
    baseUrl: getBaseUrl(),
    environment: process.env.NODE_ENV || 'development'
  }

  // Imprimir información de depuración
  console.log('Configuración de la API:', {
    ...config,
    apiKey: {
      ...config.apiKey,
      // No mostrar la key completa por seguridad
      value: DEEPSEEK_API_KEY ? `${DEEPSEEK_API_KEY.substring(0, 4)}...${DEEPSEEK_API_KEY.substring(DEEPSEEK_API_KEY.length - 4)}` : 'no configurada'
    }
  })

  // Asegúrate de que el API key está configurado
  if (!DEEPSEEK_API_KEY) {
    console.error('⚠️ DEEPSEEK_API_KEY no está configurado en las variables de entorno')
  }

  return config
}

// Validar configuración al cargar el módulo
validateApiConfig()
