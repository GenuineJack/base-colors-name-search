/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enables strict mode for React (helps catch potential errors early)
  reactStrictMode: true,
  
  // Optional: Ensures URLs don't require a trailing slash
  trailingSlash: false,

  // Optional: Enables modern JavaScript output for better performance
  swcMinify: true,

  // Optional: Adds custom base path (if needed)
  // Uncomment and replace `/my-app` if your app is deployed in a subdirectory
  // basePath: '/my-app',

  // Future Webpack or Build settings (leave as-is unless needed)
  webpack(config, { isServer }) {
    // Example: Customize Webpack settings here
    return config;
  },

  // Optional: Internationalization settings (only needed if your app supports multiple languages)
  // i18n: {
  //   locales: ['en'],
  //   defaultLocale: 'en',
  // },
};

module.exports = nextConfig;
