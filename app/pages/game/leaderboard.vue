<template>
  <div class="min-h-screen bg-slate-950 p-4 md:p-8">
    <div class="max-w-4xl mx-auto space-y-8">

      <!-- Header -->
      <div class="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8 shadow-2xl text-center">
        <div class="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-yellow-500/5 blur-3xl pointer-events-none" />
        <div class="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
        <div class="relative z-10">
          <div class="inline-flex p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 mb-4">
            <UIcon name="i-lucide-trophy" class="h-8 w-8 text-yellow-400" />
          </div>
          <h1 class="text-4xl font-extrabold text-white tracking-tight">Žebříček hráčů</h1>
          <p class="text-slate-400 mt-2" v-if="round">{{ round.name }} · Tah {{ round.current_turn }} · {{ round.current_date }}</p>

          <!-- Round selector -->
          <div class="mt-4 flex justify-center">
            <USelectMenu
              v-model="selectedRoundId"
              :items="roundOptions"
              placeholder="Vyberte kolo..."
              class="w-64"
              @update:model-value="changeRound"
            />
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="pending" class="space-y-3">
        <div v-for="i in 4" :key="i" class="h-20 rounded-xl bg-slate-900/60 animate-pulse border border-slate-800" />
      </div>

      <!-- Status badge -->
      <div v-if="round" class="flex items-center justify-between">
        <span
          class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset"
          :class="{
            'bg-yellow-500/10 text-yellow-400 ring-yellow-500/20': round.status === 'setup',
            'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20': round.status === 'active',
            'bg-slate-700/50 text-slate-400 ring-slate-600/20': round.status === 'finished'
          }"
        >
          <span
            v-if="round.status === 'active'"
            class="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse mr-2"
          />
          {{ statusLabel(round.status) }}
          <template v-if="round.status === 'active'"> · Auto-obnovení za {{ countdown }}s</template>
        </span>
        <UButton size="sm" variant="ghost" color="neutral" icon="i-lucide-refresh-cw" @click="doRefresh">
          Obnovit
        </UButton>
      </div>

      <!-- Podium (top 3) -->
      <div v-if="rankings.length >= 3" class="grid grid-cols-3 gap-4 items-end">
        <!-- 2nd place -->
        <div class="text-center">
          <div class="mx-auto w-16 h-16 rounded-full bg-slate-700/80 border-2 border-slate-500 flex items-center justify-center mb-2">
            <span class="text-2xl font-black text-slate-300">2</span>
          </div>
          <p class="font-bold text-white text-sm truncate">{{ rankings[1].name }}</p>
          <p class="text-xs text-slate-400 font-mono mt-0.5">{{ fmt(rankings[1].total_value) }}</p>
          <div class="mt-2 rounded-t-lg h-16 bg-gradient-to-t from-slate-700 to-slate-600 border border-slate-600/50" />
        </div>

        <!-- 1st place -->
        <div class="text-center -mt-4">
          <div class="inline-flex p-1 rounded-full bg-yellow-400/20 mb-1">
            <UIcon name="i-lucide-crown" class="h-5 w-5 text-yellow-400" />
          </div>
          <div class="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500/30 to-amber-600/30 border-2 border-yellow-500/60 flex items-center justify-center mb-2 shadow-lg shadow-yellow-500/10">
            <span class="text-3xl font-black text-yellow-400">1</span>
          </div>
          <p class="font-bold text-white truncate">{{ rankings[0].name }}</p>
          <p class="text-xs text-emerald-400 font-mono font-bold mt-0.5">{{ fmt(rankings[0].total_value) }}</p>
          <div class="mt-2 rounded-t-lg h-24 bg-gradient-to-t from-yellow-900/60 to-yellow-700/40 border border-yellow-600/30" />
        </div>

        <!-- 3rd place -->
        <div class="text-center">
          <div class="mx-auto w-14 h-14 rounded-full bg-slate-800/80 border-2 border-amber-700/60 flex items-center justify-center mb-2">
            <span class="text-xl font-black text-amber-700">3</span>
          </div>
          <p class="font-bold text-white text-sm truncate">{{ rankings[2].name }}</p>
          <p class="text-xs text-slate-400 font-mono mt-0.5">{{ fmt(rankings[2].total_value) }}</p>
          <div class="mt-2 rounded-t-lg h-10 bg-gradient-to-t from-amber-900/40 to-amber-800/20 border border-amber-800/30" />
        </div>
      </div>

      <!-- Full Rankings Table -->
      <div v-if="rankings.length" class="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div class="divide-y divide-slate-800/60">
          <div
            v-for="(player, idx) in rankings"
            :key="player.id"
            class="flex items-center gap-4 p-4 hover:bg-slate-800/30 transition-colors"
            :class="{ 'bg-yellow-500/5': idx === 0 }"
          >
            <!-- Rank -->
            <div class="w-8 text-center shrink-0">
              <span v-if="idx === 0" class="text-yellow-400 font-black text-lg">🥇</span>
              <span v-else-if="idx === 1" class="text-slate-400 font-black text-lg">🥈</span>
              <span v-else-if="idx === 2" class="text-amber-700 font-black text-lg">🥉</span>
              <span v-else class="text-slate-500 font-bold text-sm">{{ idx + 1 }}</span>
            </div>

            <!-- Name -->
            <div class="flex-1 min-w-0">
              <p class="font-bold text-white truncate">{{ player.name }}</p>
              <p class="text-xs text-slate-500">
                Hotovost: <span class="text-slate-400">{{ fmt(player.cash) }}</span> ·
                Akcie: <span class="text-slate-400">{{ fmt(player.holdings_value) }}</span>
              </p>
            </div>

            <!-- Profit bar -->
            <div class="hidden sm:flex items-center gap-2 w-32">
              <div class="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="player.profit >= 0 ? 'bg-emerald-500' : 'bg-rose-500'"
                  :style="{ width: `${Math.min(Math.abs(player.profit_percent), 100)}%` }"
                />
              </div>
              <span class="text-xs font-semibold shrink-0 w-12 text-right"
                :class="player.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'">
                {{ player.profit >= 0 ? '+' : '' }}{{ player.profit_percent.toFixed(1) }}%
              </span>
            </div>

            <!-- Total value -->
            <div class="text-right shrink-0">
              <p class="font-bold text-white font-mono">{{ fmt(player.total_value) }}</p>
              <p class="text-xs font-mono" :class="player.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'">
                {{ player.profit >= 0 ? '+' : '' }}{{ fmt(player.profit) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="!pending && round" class="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center">
        <p class="text-slate-400">Žádní hráči v tomto kole</p>
      </div>

      <!-- Navigation -->
      <div class="flex justify-center gap-4">
        <NuxtLink to="/game">
          <UButton variant="ghost" color="neutral" icon="i-lucide-arrow-left">Lobby</UButton>
        </NuxtLink>
        <NuxtLink to="/game/admin">
          <UButton variant="ghost" color="neutral" icon="i-lucide-settings-2">Správa</UButton>
        </NuxtLink>
        <NuxtLink to="/game/play">
          <UButton variant="soft" color="primary" icon="i-lucide-play-circle">Hrát</UButton>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Akciová Hra — Žebříček',
  description: 'Živé hodnocení hráčů podle hodnoty jejich portfólia'
})

const route = useRoute()
const router = useRouter()

// Load all rounds for the dropdown
const { data: roundsData } = await useFetch<any>('/api/game/rounds', { lazy: true })
const roundOptions = computed(() =>
  (roundsData.value?.data ?? []).map((r: any) => ({ label: r.name, value: r.id }))
)

const selectedRoundId = ref<any>(
  route.query.round ? { value: Number(route.query.round) } : null
)

// Auto-select first active round if none specified
watch(roundOptions, (opts) => {
  if (!selectedRoundId.value && opts.length) {
    const active = (roundsData.value?.data ?? []).find((r: any) => r.status === 'active')
    const first = active ?? roundsData.value?.data?.[0]
    if (first) {
      selectedRoundId.value = opts.find((o: any) => o.value === first.id)
    }
  }
}, { immediate: true })

const roundId = computed(() => selectedRoundId.value?.value ?? Number(route.query.round) ?? null)

const { data, pending, refresh } = await useFetch<any>(
  () => roundId.value ? `/api/game/leaderboard/${roundId.value}` : null,
  { lazy: true, watch: [roundId] }
)

const round = computed(() => data.value?.data?.round ?? null)
const rankings = computed<any[]>(() => data.value?.data?.rankings ?? [])

function changeRound(option: any) {
  router.replace({ query: { round: option?.value } })
}

function statusLabel(status: string) {
  if (status === 'setup') return 'Příprava'
  if (status === 'active') return 'Aktivní'
  if (status === 'finished') return 'Ukončeno'
  return status
}

// Auto-refresh countdown for active rounds
const countdown = ref(30)
let refreshInterval: ReturnType<typeof setInterval> | null = null
let countdownInterval: ReturnType<typeof setInterval> | null = null

async function doRefresh() {
  await refresh()
  countdown.value = 30
}

watch(round, (r) => {
  if (refreshInterval) clearInterval(refreshInterval)
  if (countdownInterval) clearInterval(countdownInterval)
  if (r?.status === 'active') {
    refreshInterval = setInterval(() => { refresh(); countdown.value = 30 }, 30000)
    countdownInterval = setInterval(() => { countdown.value-- }, 1000)
  }
}, { immediate: true })

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
  if (countdownInterval) clearInterval(countdownInterval)
})

function fmt(val: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)
}
</script>
