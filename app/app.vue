<script setup>
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const title = 'Akciová Hra — Burzovní simulátor'
const description = 'Multiplayer burzovní simulátor s reálnými historickými daty. Obchodujte, soutěžte a zjistěte, kdo vydělá nejvíce.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterCard: 'summary'
})

const navLinks = [
  { label: 'Lobby', to: '/game' },
  { label: 'Hrát', to: '/game/play' },
  { label: 'Žebříček', to: '/game/leaderboard' },
  { label: 'Správa', to: '/game/admin' },
  { label: 'Analytika', to: '/' }
]
</script>

<template>
  <UApp>
    <UHeader>
      <template #left>
        <NuxtLink to="/game" class="flex items-center gap-2 text-white font-bold text-sm hover:opacity-80 transition-opacity">
          <UIcon name="i-lucide-trending-up" class="h-5 w-5 text-emerald-400" />
          Akciová Hra
        </NuxtLink>

        <nav class="hidden md:flex items-center gap-1 ml-4">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
            active-class="text-white bg-slate-800/60"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>
      </template>

      <template #right>
        <UColorModeButton />
      </template>
    </UHeader>

    <UMain>
      <NuxtPage />
    </UMain>

    <USeparator />

    <UFooter>
      <template #left>
        <p class="text-sm text-muted">
          Akciová Hra • Burzovní simulátor • © {{ new Date().getFullYear() }}
        </p>
      </template>
    </UFooter>
  </UApp>
</template>
