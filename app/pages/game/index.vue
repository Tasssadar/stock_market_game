<template>
  <div class="min-h-screen bg-slate-950 p-4 md:p-8">
    <div class="max-w-5xl mx-auto space-y-8">

      <!-- Hero -->
      <div class="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8 shadow-2xl">
        <div class="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div class="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div class="flex items-center gap-2 mb-3">
              <span class="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
                <UIcon name="i-lucide-trending-up" class="mr-1.5 h-3.5 w-3.5" />
                Burzovní simulátor
              </span>
            </div>
            <h1 class="text-4xl font-extrabold tracking-tight text-white bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Akciová Hra
            </h1>
            <p class="mt-2 text-slate-400 max-w-xl">
              Obchodujte s akciemi pomocí reálných historických dat. Kdo vydělá nejvíce?
            </p>
          </div>
          <div class="flex flex-col sm:flex-row gap-3 shrink-0">
            <NuxtLink to="/game/admin">
              <UButton size="lg" color="neutral" variant="outline" icon="i-lucide-settings-2" class="w-full">
                Správa hry
              </UButton>
            </NuxtLink>
            <NuxtLink to="/game/play">
              <UButton size="lg" color="primary" icon="i-lucide-play-circle" class="w-full">
                Hrát
              </UButton>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Active Rounds -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-white flex items-center gap-2">
            <UIcon name="i-lucide-layers" class="h-5 w-5 text-emerald-400" />
            Herní kola
          </h2>
          <UButton variant="ghost" color="neutral" size="sm" icon="i-lucide-refresh-cw" @click="refresh">
            Obnovit
          </UButton>
        </div>

        <!-- Loading -->
        <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="i in 3" :key="i" class="h-40 rounded-xl bg-slate-900/60 animate-pulse border border-slate-800" />
        </div>

        <!-- Empty -->
        <div v-else-if="!rounds.length" class="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center">
          <div class="inline-flex p-4 rounded-full bg-slate-900 border border-slate-800 text-slate-600 mb-4">
            <UIcon name="i-lucide-inbox" class="h-8 w-8" />
          </div>
          <h3 class="text-lg font-semibold text-slate-300">Žádná kola</h3>
          <p class="text-sm text-slate-500 mt-1">Admin musí nejprve vytvořit kolo ve správě hry.</p>
          <NuxtLink to="/game/admin" class="mt-4 inline-block">
            <UButton variant="outline" color="neutral" icon="i-lucide-plus">
              Vytvořit kolo
            </UButton>
          </NuxtLink>
        </div>

        <!-- Rounds grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="round in rounds"
            :key="round.id"
            class="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-700 hover:bg-slate-900/80 transition-all duration-200 group"
          >
            <!-- Status accent bar -->
            <div
              class="absolute top-0 left-0 right-0 h-0.5"
              :class="{
                'bg-yellow-500': round.status === 'setup',
                'bg-emerald-500': round.status === 'active',
                'bg-slate-600': round.status === 'finished'
              }"
            />

            <div class="flex items-start justify-between gap-3">
              <div class="flex-1 min-w-0">
                <h3 class="text-base font-bold text-white truncate">{{ round.name }}</h3>
                <p class="text-xs text-slate-500 mt-0.5">
                  Začátek: {{ round.start_date }} · {{ round.turn_length_days }}d/tah
                </p>
              </div>
              <span
                class="shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset"
                :class="{
                  'bg-yellow-500/10 text-yellow-400 ring-yellow-500/20': round.status === 'setup',
                  'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20': round.status === 'active',
                  'bg-slate-700/50 text-slate-400 ring-slate-600/20': round.status === 'finished'
                }"
              >
                {{ statusLabel(round.status) }}
              </span>
            </div>

            <div class="mt-4 flex items-center justify-between">
              <div class="flex items-center gap-4 text-xs text-slate-500">
                <span class="flex items-center gap-1">
                  <UIcon name="i-lucide-users" class="h-3.5 w-3.5" />
                  {{ round.player_count }} hráčů
                </span>
                <span class="flex items-center gap-1">
                  <UIcon name="i-lucide-repeat-2" class="h-3.5 w-3.5" />
                  Tah {{ round.current_turn }}
                </span>
              </div>
              <div class="flex gap-2">
                <NuxtLink :to="`/game/leaderboard?round=${round.id}`">
                  <UButton size="xs" variant="ghost" color="neutral" icon="i-lucide-trophy" />
                </NuxtLink>
                <NuxtLink :to="`/game/play?round=${round.id}`">
                  <UButton size="xs" variant="soft" color="primary" icon="i-lucide-log-in">
                    Vstoupit
                  </UButton>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick nav to leaderboard -->
      <div v-if="rounds.some((r: any) => r.status === 'active')" class="rounded-xl border border-emerald-800/40 bg-emerald-950/30 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="p-2.5 rounded-lg bg-emerald-500/10">
            <UIcon name="i-lucide-trophy" class="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <p class="text-sm font-semibold text-white">Sledujte žebříček</p>
            <p class="text-xs text-slate-400">Živé hodnocení hráčů a jejich portfólií</p>
          </div>
        </div>
        <NuxtLink :to="`/game/leaderboard?round=${activeRound?.id}`">
          <UButton color="primary" variant="soft" icon="i-lucide-external-link">
            Otevřít žebříček
          </UButton>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Akciová Hra — Herní lobby',
  description: 'Vyberte herní kolo a začněte obchodovat s akciemi.'
})

const { data, pending, refresh } = await useFetch<any>('/api/game/rounds', { lazy: true })

const rounds = computed<any[]>(() => data.value?.data ?? [])
const activeRound = computed(() => rounds.value.find((r: any) => r.status === 'active'))

function statusLabel(status: string) {
  if (status === 'setup') return 'Příprava'
  if (status === 'active') return 'Aktivní'
  if (status === 'finished') return 'Ukončeno'
  return status
}
</script>
