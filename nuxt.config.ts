export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: ["@nuxtjs/supabase", "@pinia/nuxt"],

  supabase: {
    redirect: false,
    url: process.env.NUXT_PUBLIC_SUPABASE_URL,
    key: process.env.NUXT_PUBLIC_SUPABASE_KEY,
  },

  runtimeConfig: {
    allowedEmail: process.env.ALLOWED_EMAIL,
    allowedPassword: process.env.ALLOWED_PASSWORD,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_KEY,
    },
  },

  routeRules: {
    "/user/**": { ssr: false },
  },

  css: ["~/assets/styles/tokens.scss"],
});
