/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['fs', 'path'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // No incluir módulos del servidor en el bundle del cliente
      config.resolve.fallback = {
        fs: false,
        path: false,
      }
    }
    return config
  },
}

module.exports = nextConfig
