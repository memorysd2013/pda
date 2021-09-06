import path from 'path'
import fs from 'fs'

export default {
  env: {
    NUXT_ENV_MODE: 'LOCAL',
    NUXT_ENV_VER: process.env.npm_package_version
  },

  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, './localhost.key')),
      cert: fs.readFileSync(path.resolve(__dirname, './localhost.crt'))
    }
  },

  pwa: {
    manifest: {
      name: "閎康取送件系統",
      short_name: "閎康取送件系統",
      description: "閎康取送件系統",
      display: "standalone",
      orientation: "portrait",
      theme_color: "#ffffff",
      start_url: "/?standalone=true",
    },
    icon: {
      source: '/icon.png',
      fileName: 'icon.png'
    },
    meta: {
      mobileAppIOS: false,
      nativeUI: false,
    },
    workbox: {
      enabled: false,
      autoRegister: false
    }
  },

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: '閎康取送件系統',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' },
      { name: "msapplication-TileColor", content: "#ffffff" },
      { name: "msapplication-TileImage", content: "/ms-icon-144x144.png" },
      { name: "theme-color", content: "#ffffff" },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/icons/favicon.ico' },
      { rel: "apple-touch-icon", sizes: "57x57", href: "/icons/apple-icon-57x57.png" },
      { rel: "apple-touch-icon", sizes: "60x60", href: "/icons/apple-icon-60x60.png" },
      { rel: "apple-touch-icon", sizes: "72x72", href: "/icons/apple-icon-72x72.png" },
      { rel: "apple-touch-icon", sizes: "76x76", href: "/icons/apple-icon-76x76.png" },
      { rel: "apple-touch-icon", sizes: "114x114", href: "/icons/apple-icon-114x114.png" },
      { rel: "apple-touch-icon", sizes: "120x120", href: "/icons/apple-icon-120x120.png" },
      { rel: "apple-touch-icon", sizes: "144x144", href: "/icons/apple-icon-144x144.png" },
      { rel: "apple-touch-icon", sizes: "152x152", href: "/icons/apple-icon-152x152.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/icons/apple-icon-180x180.png" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/icons/android-icon-192x192.png" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/icons/favicon-32x32.png" },
      { rel: "icon", type: "image/png", sizes: "96x96", href: "/icons/favicon-96x96.png" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/icons/favicon-16x16.png" },
      { rel: "manifest", href: "/manifest.json" },
    ],
    script: [
      { src: "https://kit.fontawesome.com/7f26feae15.js", crossorigin: "anonymous" },
      { src: '/scanner/jsqrscanner.nocache.js' },
      { src: '/scanner/24C4C259474DE5354D9FB187AD89F216.cache.js' },
    ],
  },

  router: {
    extendRoutes(routes, resolve) {
      routes.push({
        path: '/*',
        redirect: '/'
      })
      return routes
    }
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    './stylus/public.styl',
    './stylus/initial.styl',
    './stylus/transition.styl',
    './stylus/rewriteElementUI.styl',
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '@/plugins/components',
    '@/plugins/element-ui.js',
    '@/plugins/custom-sw.js',
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa',
    '@nuxtjs/style-resources',
  ],
  styleResources: {
    stylus: [
      './stylus/mixin.styl',
      './stylus/setting.styl'
    ]
  },

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {},

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
  }
}
