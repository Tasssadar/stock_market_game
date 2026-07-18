<template>
  <UCard v-if="news" class="border-slate-800 bg-slate-900/60" :ui="{ body: 'p-4 space-y-3' }">
    <template #header>
      <div class="flex items-center justify-between gap-3 flex-wrap">
        <h2 class="text-sm font-bold text-white flex items-center gap-2">
          <UIcon
            :name="news.polarity === 'positive' ? 'i-lucide-newspaper' : 'i-lucide-siren'"
            class="h-4 w-4"
            :class="news.polarity === 'positive' ? 'text-emerald-400' : 'text-rose-400'"
          />
          Tržní zprávy
        </h2>
        <span
          class="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset"
          :class="news.polarity === 'positive'
            ? 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/20'
            : 'bg-rose-500/10 text-rose-300 ring-rose-500/20'"
        >
          Tah {{ news.turn }}
        </span>
      </div>
    </template>

    <p class="text-2xl font-semibold" :class="news.polarity === 'positive' ? 'text-emerald-300' : 'text-rose-300'">
      {{ news.headline }}
    </p>
    <p class="text-base text-slate-200 whitespace-pre-line leading-relaxed" v-html="news.body"></p>
    <div class="text-xs text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
      <span>Společnost: <span class="text-slate-200">{{ news.companyName }}</span></span>
      <span>Hráč(i): <span class="text-slate-200">{{ news.playerNames }}</span></span>
      <span>
        Změna:
        <span class="font-mono" :class="news.polarity === 'positive' ? 'text-emerald-300' : 'text-rose-300'">
          {{ news.amount }}
        </span>
      </span>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { RenderedNews } from '~/composables/useRoundNews'

defineProps<{
  news: RenderedNews | null
}>()
</script>
