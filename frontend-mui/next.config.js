/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/users/:path*',
                destination: 'http://localhost:8080/users/:path*',
            },
            {
                source: '/pokemon/:path*',
                destination: 'http://localhost:8080/pokemon/:path*',
            },
            {
                source: '/evolution-chains/:path*',
                destination: 'http://localhost:8080/evolution-chains/:path*',
            },
            {
                source: '/games/:path*',
                destination: 'http://localhost:8080/games/:path*',
            }
        ]
    }
}

module.exports = nextConfig
