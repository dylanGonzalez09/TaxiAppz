/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.BASEPATH,
  reactStrictMode: false,
  
  // async headers() {
  //   return [
  //     {
  //       // Match the service worker file directly
  //       source: '/en/firebase-messaging-sw.js',
  //       headers: [
  //         {
  //           key: 'Service-Worker-Allowed',
  //           value: '/'  // This allows the SW to control the whole domain
  //         },
  //         {
  //           key: 'Cache-Control',
  //           value: 'public, max-age=0, must-revalidate'  // Important for SW updates
  //         }
  //       ]
  //     }
  //   ];
  // },
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/en/login',
        permanent: true,
        locale: false,
      },
      {
        source: '/:lang(en|fr|ar|po)',
        destination: '/:lang/dashboards/client',
        permanent: true,
        locale: false
      }
    ]
  },
  webpack(config, { isServer }) {
    if (!isServer) {
      config.resolve.fallback = {
        net: false,
        fs: false,
        path: false,
        os: false,
        tls: false,
        http: false,
        https: false,
        stream: false,
        child_process: false,
        dns: false,
        'timers/promises': false,
      };
    }

    return config;
  }
}

export default nextConfig;