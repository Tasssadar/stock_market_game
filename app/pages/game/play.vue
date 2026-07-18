<template>
  <div class="min-h-screen bg-slate-950">

    <!-- Join Screen -->
    <div v-if="!loggedIn" class="flex items-center justify-center min-h-screen p-4">
      <div class="w-full max-w-md space-y-6">
        <div class="text-center space-y-2">
          <div class="inline-flex p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-2">
            <UIcon name="i-lucide-trending-up" class="h-10 w-10 text-emerald-400" />
          </div>
          <h1 class="text-3xl font-extrabold text-white">Akciová Hra</h1>
          <p class="text-slate-400">Vyberte kolo a hráče</p>
        </div>

        <UCard class="border-slate-800 bg-slate-900/80 backdrop-blur-md" :ui="{ body: 'p-6 space-y-4' }">
          <UFormField label="Herní kolo" name="round">
            <USelectMenu
              v-model="joinForm.roundId"
              :items="roundOptions"
              placeholder="Vyberte kolo..."
              class="w-full"
            />
          </UFormField>

          <UFormField label="Hráč" name="player">
            <USelectMenu
              v-model="joinForm.playerId"
              :items="playerOptions"
              :loading="playersLoading"
              :disabled="!joinForm.roundId"
              placeholder="Vyberte hráče..."
              class="w-full"
            />
          </UFormField>

          <UButton
            color="primary"
            size="lg"
            class="w-full"
            icon="i-lucide-log-in"
            :loading="joinLoading"
            @click="joinGame"
          >
            Vstoupit do hry
          </UButton>

          <p v-if="joinError" class="text-sm text-rose-400 text-center">{{ joinError }}</p>
        </UCard>

        <div class="text-center">
          <NuxtLink to="/game" class="text-sm text-slate-500 hover:text-slate-300 transition-colors">
            ← Zpět do lobby
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Game Dashboard -->
    <div v-else class="max-w-7xl mx-auto p-4 md:p-6 space-y-6">

      <!-- Top bar -->
      <div class="flex items-center justify-between flex-wrap gap-4">
        <div class="space-y-3">
          <div class="flex items-center gap-3 flex-wrap">
            <h1 class="text-2xl font-bold text-white">{{ portfolio?.player?.name }}</h1>
            <span class="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
              {{ portfolio?.round?.name }}
            </span>
            <span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset"
              :class="roundStatus === 'active' ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20' : 'bg-slate-700/50 text-slate-400 ring-slate-600/20'">
              <span class="h-1.5 w-1.5 rounded-full mr-1.5" :class="roundStatus === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'" />
              {{ roundStatusLabel }}
            </span>
          </div>
          <div class="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 w-fit">
            <p class="text-[11px] uppercase tracking-[0.16em] font-semibold text-emerald-300/80">Aktuální kolo</p>
            <div class="flex flex-wrap items-baseline gap-x-5 gap-y-1 mt-1">
              <p class="text-3xl md:text-4xl leading-none font-extrabold text-white">
                Tah {{ portfolio?.round?.current_turn }}
              </p>
              <p class="text-base md:text-lg font-semibold text-emerald-200">
                Do: {{ portfolio?.round?.current_date }}
              </p>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <UFormField v-if="isMultiMode" label="Přepnout hráče" name="multiPlayer" class="min-w-[180px]">
            <USelectMenu
              v-model="multiPlayerSelection"
              :items="multiPlayerOptions"
              placeholder="Hráč..."
              class="w-full"
            />
          </UFormField>
          <UButton size="sm" variant="ghost" color="neutral" icon="i-lucide-refresh-cw" :loading="portfolioLoading" @click="refreshPortfolio()">
            Obnovit
          </UButton>
          <UButton size="sm" variant="ghost" color="neutral" icon="i-lucide-log-out" @click="leaveGame">
            Opustit
          </UButton>
        </div>
      </div>

      <!-- Portfolio Summary Cards -->
      <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <div class="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p class="text-xs text-slate-500 uppercase tracking-wider font-medium">Hotovost</p>
          <p class="mt-1.5 text-xl font-bold text-white font-mono">{{ fmt(portfolio?.player?.cash ?? 0) }}</p>
        </div>
        <div class="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p class="text-xs text-slate-500 uppercase tracking-wider font-medium">Půjčka</p>
          <p class="mt-1.5 text-xl font-bold text-amber-400 font-mono">{{ fmt(portfolio?.player?.loan_balance ?? 0) }}</p>
        </div>
        <div class="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p class="text-xs text-slate-500 uppercase tracking-wider font-medium">Celkem půjčeno</p>
          <p class="mt-1.5 text-xl font-bold text-slate-300 font-mono">{{ fmt(portfolio?.player?.total_loaned ?? 0) }}</p>
        </div>
        <div class="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p class="text-xs text-slate-500 uppercase tracking-wider font-medium">Hodnota akcií</p>
          <p class="mt-1.5 text-xl font-bold text-blue-400 font-mono">{{ fmt(portfolio?.holdings_value ?? 0) }}</p>
        </div>
        <div class="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p class="text-xs text-slate-500 uppercase tracking-wider font-medium">Celková hodnota</p>
          <p class="mt-1.5 text-xl font-bold text-white font-mono">{{ fmt(portfolio?.total_value ?? 0) }}</p>
        </div>
        <div class="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p class="text-xs text-slate-500 uppercase tracking-wider font-medium">Zisk / Ztráta</p>
          <p class="mt-1.5 text-xl font-bold font-mono" :class="(portfolio?.profit ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'">
            {{ (portfolio?.profit ?? 0) >= 0 ? '+' : '' }}{{ fmt(portfolio?.profit ?? 0) }}
            <span class="text-sm ml-1">({{ (portfolio?.profit_percent ?? 0).toFixed(1) }}%)</span>
          </p>
        </div>
      </div>

      <!-- Main Area: Chart + Trade Panel -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <!-- Chart Area -->
        <div class="lg:col-span-8 space-y-4">

          <!-- Ticker selector -->
          <UCard class="border-slate-800 bg-slate-900/60" :ui="{ body: 'p-4' }">
            <USelectMenu
              v-model="selectedTicker"
              :items="tickerOptions"
              searchable
              placeholder="Vyberte akcii k zobrazení..."
              class="w-full"
            />
          </UCard>

          <!-- Chart -->
          <UCard class="border-slate-800 bg-slate-900/60" :ui="{ body: 'p-4' }">
            <template #header>
              <div class="flex items-center justify-between">
                <h2 class="text-sm font-bold text-white flex items-center gap-2">
                  <UIcon name="i-lucide-line-chart" class="h-4 w-4 text-blue-400" />
                  <span v-if="selectedTickerSymbol">{{ selectedTickerSymbol }}</span>
                  <span v-else>Vývoj cen</span>
                  <span class="text-slate-500 font-normal">(do tahu {{ portfolio?.round?.current_turn }})</span>
                </h2>
                <p class="text-xs text-slate-500">Do: {{ portfolio?.round?.current_date }}</p>
              </div>
            </template>

            <div class="relative min-h-[300px] flex items-center justify-center">
              <div v-if="chartLoading" class="text-slate-500 flex flex-col items-center gap-2">
                <UIcon name="i-lucide-loader-2" class="h-8 w-8 animate-spin text-emerald-400" />
                <p class="text-sm">Načítám data...</p>
              </div>
              <div v-else-if="!chartData.length" class="text-center py-8">
                <UIcon name="i-lucide-mouse-pointer-click" class="h-10 w-10 text-slate-600 mx-auto mb-3" />
                <p class="text-sm text-slate-500">Vyberte akcii pro zobrazení grafu</p>
              </div>
              <div v-else class="w-full h-[300px]">
                <LineChart
                  :data="chartData"
                  :categories="chartCategories"
                  :height="300"
                  :x-formatter="xFormatter"
                  x-label="Datum"
                  y-label="Cena (USD)"
                />
              </div>
            </div>
          </UCard>
        </div>

        <!-- Right Panel: Holdings + Trade -->
        <div class="lg:col-span-4 space-y-4">

          <!-- Holdings -->
          <UCard class="border-slate-800 bg-slate-900/60" :ui="{ body: 'p-4 space-y-2' }">
            <template #header>
              <h2 class="text-sm font-bold text-white flex items-center gap-2">
                <UIcon name="i-lucide-briefcase" class="h-4 w-4 text-emerald-400" />
                Moje pozice
              </h2>
            </template>
            <div v-if="!portfolio?.holdings?.length" class="text-center py-4">
              <p class="text-sm text-slate-500">Nemáte žádné akcie</p>
            </div>
            <div v-else class="space-y-2">
              <button
                v-for="h in portfolio.holdings"
                :key="h.ticker"
                type="button"
                class="w-full flex items-center justify-between p-2.5 rounded-lg transition-colors text-left"
                :class="selectedTickerSymbol === h.ticker
                  ? 'bg-emerald-500/10 ring-1 ring-emerald-500/30'
                  : 'bg-slate-800/60 hover:bg-slate-800'"
                @click="selectTickerForSell(h.ticker)"
              >
                <div>
                  <p class="text-sm font-bold text-white">{{ h.ticker }}</p>
                  <p class="text-xs text-slate-500">{{ fmtShares(h.shares) }} ks · {{ fmtSmall(h.current_price) }}/ks</p>
                  <div v-if="h.performance_by_turn?.length" class="mt-1.5 space-y-0.5">
                    <p
                      v-for="roundPerf in h.performance_by_turn.slice(-1)"
                      :key="`${h.ticker}-${roundPerf.turn}`"
                      class="text-[11px] leading-tight"
                      :class="roundGainClass(roundPerf.gain_amount)"
                    >
                      Tah {{ roundPerf.turn }}: {{ fmtSigned(roundPerf.gain_amount) }} ({{ fmtSignedPercent(roundPerf.gain_percent) }})
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm font-bold text-white">{{ fmt(h.value) }}</p>
                </div>
              </button>
            </div>
          </UCard>

          <!-- Trade Panel -->
          <UCard
            class="border-slate-800 bg-slate-900/60"
            :ui="{ body: 'p-4 space-y-4' }"
          >
            <template #header>
              <h2 class="text-sm font-bold text-white flex items-center gap-2">
                <UIcon name="i-lucide-arrow-left-right" class="h-4 w-4 text-yellow-400" />
                Obchodovat
                <span v-if="selectedTickerSymbol" class="text-emerald-400 font-mono">{{ selectedTickerSymbol }}</span>
              </h2>
            </template>

            <div v-if="roundStatus !== 'active'" class="text-center py-4">
              <UIcon name="i-lucide-lock" class="h-8 w-8 text-slate-600 mx-auto mb-2" />
              <p class="text-sm text-slate-500">
                {{ roundStatus === 'setup' ? 'Kolo ještě nezačalo' : 'Kolo je ukončeno' }}
              </p>
            </div>

            <div v-else-if="!selectedTickerSymbol" class="text-center py-4">
              <p class="text-sm text-slate-500">Nejprve vyberte akcii</p>
            </div>

            <template v-else>
              <!-- Action toggle -->
              <div class="flex rounded-lg overflow-hidden border border-slate-700">
                <button
                  type="button"
                  class="flex-1 py-2 text-sm font-semibold transition-colors"
                  :class="tradeForm.action === 'buy' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800/60 text-slate-400 hover:text-white'"
                  :disabled="isSelectedTickerSellOnly"
                  @click="setTradeAction('buy')"
                >
                  Koupit
                </button>
                <button
                  type="button"
                  class="flex-1 py-2 text-sm font-semibold transition-colors"
                  :class="tradeForm.action === 'sell' ? 'bg-rose-500 text-white' : 'bg-slate-800/60 text-slate-400 hover:text-white'"
                  @click="setTradeAction('sell')"
                >
                  Prodat
                </button>
              </div>

              <p v-if="isSelectedTickerSellOnly" class="text-xs text-amber-400">
                Tato akcie není v aktuálním období k dispozici k nákupu. Lze pouze prodat.
              </p>

              <UFormField label="Počet kusů" name="shares">
                <UInput v-model.number="tradeForm.shares" type="number" min="0.01" step="0.01" placeholder="Počet akcií" class="w-full" />
              </UFormField>

              <!-- Price preview -->
              <div v-if="tradePreview" class="rounded-lg bg-slate-800/60 p-3 space-y-1 text-xs">
                <div class="flex justify-between text-slate-400">
                  <span>Aktuální cena:</span>
                  <span class="font-mono text-white">{{ fmtSmall(tradePreview.price) }}</span>
                </div>
                <div class="flex justify-between text-slate-400">
                  <span>Celkem:</span>
                  <span class="font-mono font-bold text-white">{{ fmt(tradePreview.total) }}</span>
                </div>
                <div v-if="tradeForm.action === 'buy'" class="space-y-1">
                  <div class="flex justify-between text-slate-400">
                    <span>Hotovost po nákupu:</span>
                    <span class="font-mono" :class="tradePreview.remainingCash >= 0 ? 'text-emerald-400' : 'text-rose-400'">
                      {{ fmt(tradePreview.remainingCash) }}
                    </span>
                  </div>
                  <div class="flex justify-between text-slate-400">
                    <span>Půjčka po nákupu:</span>
                    <span class="font-mono" :class="tradePreview.remainingLoanBalance >= 0 ? 'text-amber-400' : 'text-rose-400'">
                      {{ fmt(tradePreview.remainingLoanBalance) }}
                    </span>
                  </div>
                  <div v-if="!tradePreview.canAfford" class="text-rose-400 text-[11px]">
                    Nedostatek prostředků (hotovost + půjčka)
                  </div>
                </div>
                <div v-else class="flex justify-between text-slate-400">
                  <span>Vlastníte / prodáváte:</span>
                  <span class="font-mono" :class="tradePreview.ownedShares + 0.0001 >= tradeForm.shares ? 'text-emerald-400' : 'text-rose-400'">
                    {{ fmtShares(tradePreview.ownedShares) }} / {{ fmtShares(tradeForm.shares) }} ks
                  </span>
                </div>
              </div>

              <UButton
                :color="tradeForm.action === 'buy' ? 'success' : 'error'"
                class="w-full"
                :loading="trading"
                :icon="tradeForm.action === 'buy' ? 'i-lucide-arrow-up-right' : 'i-lucide-arrow-down-right'"
                @click="executeTrade"
              >
                {{ tradeForm.action === 'buy' ? 'Koupit' : 'Prodat' }} {{ tradeForm.shares ? fmtShares(tradeForm.shares) : '' }} ks
              </UButton>
            </template>
          </UCard>
        </div>
      </div>

      <!-- Stock News -->
      <UCard v-if="currentNews" class="border-slate-800 bg-slate-900/60" :ui="{ body: 'p-4 space-y-3' }">
        <template #header>
          <div class="flex items-center justify-between gap-3 flex-wrap">
            <h2 class="text-sm font-bold text-white flex items-center gap-2">
              <UIcon
                :name="currentNews.polarity === 'positive' ? 'i-lucide-newspaper' : 'i-lucide-siren'"
                class="h-4 w-4"
                :class="currentNews.polarity === 'positive' ? 'text-emerald-400' : 'text-rose-400'"
              />
              Tržní zprávy
            </h2>
            <span
              class="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset"
              :class="currentNews.polarity === 'positive'
                ? 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/20'
                : 'bg-rose-500/10 text-rose-300 ring-rose-500/20'"
            >
              Tah {{ currentNews.turn }}
            </span>
          </div>
        </template>

        <p class="text-sm font-semibold" :class="currentNews.polarity === 'positive' ? 'text-emerald-300' : 'text-rose-300'">
          {{ currentNews.headline }}
        </p>
        <p class="text-sm text-slate-200 whitespace-pre-line leading-relaxed" v-html="currentNews.body"></p>
        <div class="text-xs text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
          <span>Společnost: <span class="text-slate-200">{{ currentNews.companyName }}</span></span>
          <span>Hráč(i): <span class="text-slate-200">{{ currentNews.playerNames }}</span></span>
          <span>Změna: <span class="font-mono" :class="currentNews.polarity === 'positive' ? 'text-emerald-300' : 'text-rose-300'">{{ currentNews.amount }}</span></span>
        </div>
      </UCard>

      <!-- Trade History -->
      <UCard class="border-slate-800 bg-slate-900/60" :ui="{ body: 'p-4' }">
        <template #header>
          <h2 class="text-sm font-bold text-white flex items-center gap-2">
            <UIcon name="i-lucide-history" class="h-4 w-4 text-slate-400" />
            Historie obchodů
          </h2>
        </template>
        <div v-if="!portfolio?.trades?.length" class="text-center py-6">
          <p class="text-sm text-slate-500">Zatím žádné obchody</p>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-slate-800">
                <th class="pb-2 pr-4">Tah</th>
                <th class="pb-2 pr-4">Ticker</th>
                <th class="pb-2 pr-4">Akce</th>
                <th class="pb-2 pr-4 text-right">Ks</th>
                <th class="pb-2 pr-4 text-right">Cena/ks</th>
                <th class="pb-2 text-right">Celkem</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              <tr v-for="t in portfolio.trades" :key="t.id" class="text-slate-300">
                <td class="py-2 pr-4 text-slate-500">{{ t.turn }}</td>
                <td class="py-2 pr-4 font-bold text-white">{{ t.ticker }}</td>
                <td class="py-2 pr-4">
                  <span class="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-semibold"
                    :class="t.action === 'buy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'">
                    {{ t.action === 'buy' ? '▲ Koupeno' : '▼ Prodáno' }}
                  </span>
                </td>
                <td class="py-2 pr-4 text-right font-mono">{{ fmtShares(t.shares) }}</td>
                <td class="py-2 pr-4 text-right font-mono text-xs">{{ fmtSmall(t.price_per_share) }}</td>
                <td class="py-2 text-right font-mono font-bold">{{ fmt(t.total) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { negativeTemplates, positiveTemplates } from '~/data/stockNewsTemplates'

useSeoMeta({
  title: 'Akciová Hra — Hrát',
  description: 'Hráčský dashboard pro nákup a prodej akcií'
})

const toast = useToast()
const route = useRoute()

type Session = { playerId: number; roundId: number; name: string }
type TradeDraft = { action: 'buy' | 'sell'; shares: number }
type NewsPolarity = 'positive' | 'negative'
type NewsEvent = {
  player_id: number
  player_name: string
  ticker: string
  company_name: string
  shares_at_turn: number
  gain_amount: number
  gain_percent: number
  polarity: NewsPolarity
}
type RoundNewsPayload = {
  selected: NewsEvent
}
type RenderedNews = {
  turn: number
  polarity: NewsPolarity
  headline: string
  body: string
  ticker: string
  companyName: string
  playerNames: string
  amount: string
}

const SESSION_KEY = 'stock_game_session'
const loggedIn = ref(false)
const session = ref<Session | null>(null)
const currentNews = ref<RenderedNews | null>(null)
const lastSeenTurn = ref<number | null>(null)
const lastShownNewsTurn = ref<number | null>(null)

const isMultiMode = computed(() => route.query.multi === '1')

function getTickerSymbol(ticker: any): string | null {
  if (!ticker) return null
  return ticker.value ?? ticker
}

function getRoundId(round: any): number | null {
  if (!round) return null
  return round.value ?? round
}

function getPlayerId(player: any): number | null {
  if (!player) return null
  return player.value ?? player
}

// Rounds for join dropdown
const { data: roundsData } = await useFetch<any>('/api/game/rounds', { lazy: true })
const roundOptions = computed(() =>
  (roundsData.value?.data ?? [])
    .filter((r: any) => r.status !== 'finished')
    .map((r: any) => ({ label: r.name, value: r.id }))
)

const joinForm = ref({ roundId: null as any, playerId: null as any })
const roundPlayers = ref<Array<{ id: number; name: string }>>([])
const playersLoading = ref(false)
const joinLoading = ref(false)
const joinError = ref('')

const playerOptions = computed(() =>
  roundPlayers.value.map(p => ({ label: p.name, value: p.id }))
)

watch(roundOptions, (opts) => {
  const roundParam = Number(route.query.round)
  if (roundParam && opts.length && !joinForm.value.roundId) {
    joinForm.value.roundId = opts.find((o: any) => o.value === roundParam) ?? null
  }
}, { immediate: true })

watch(() => joinForm.value.roundId, async (round) => {
  joinForm.value.playerId = null
  roundPlayers.value = []
  const roundId = getRoundId(round)
  if (!roundId) return

  playersLoading.value = true
  try {
    const res = await $fetch<any>(`/api/game/rounds/${roundId}/players`)
    if (res.success) roundPlayers.value = res.data
  } catch {
    roundPlayers.value = []
  } finally {
    playersLoading.value = false
  }
})

async function joinGame() {
  joinError.value = ''
  const roundId = getRoundId(joinForm.value.roundId)
  const playerId = getPlayerId(joinForm.value.playerId)
  if (!roundId || !playerId) {
    joinError.value = 'Vyberte kolo a hráče'
    return
  }

  joinLoading.value = true
  try {
    const res = await $fetch<any>('/api/game/player/login', {
      method: 'POST',
      body: { round_id: roundId, player_id: playerId }
    })
    if (res.success) {
      session.value = {
        playerId: res.player.id,
        roundId: res.player.round_id,
        name: res.player.name
      }
      localStorage.setItem(SESSION_KEY, JSON.stringify(session.value))
      loggedIn.value = true
      await enterGameSession()
    }
  } catch (e: any) {
    joinError.value = e.data?.statusMessage ?? 'Vstup do hry selhal'
  } finally {
    joinLoading.value = false
  }
}

function leaveGame() {
  stopAutoRefresh()
  loggedIn.value = false
  session.value = null
  portfolio.value = null
  selectedTicker.value = null
  chartData.value = []
  loadedChartKey = null
  quotePrice.value = null
  tradeDraftsByTicker.value = {}
  tradeForm.value = { action: 'buy', shares: 1 }
  currentNews.value = null
  lastSeenTurn.value = null
  lastShownNewsTurn.value = null
  localStorage.removeItem(SESSION_KEY)
}

async function enterGameSession() {
  await loadRoundPlayers()
  await refreshPortfolio()
  await refreshTickers()
  if (isMultiMode.value) {
    syncMultiPlayerSelection()
  }
  startAutoRefresh()
}

onMounted(async () => {
  const saved = localStorage.getItem(SESSION_KEY)
  if (!saved) return
  try {
    const parsed = JSON.parse(saved)
    if (parsed?.playerId && parsed?.roundId) {
      session.value = parsed
      loggedIn.value = true
      await enterGameSession()
    }
  } catch {
    localStorage.removeItem(SESSION_KEY)
  }
})

onUnmounted(() => {
  stopAutoRefresh()
})

// Multi-player switcher
const multiPlayerSelection = ref<any>(null)
const multiPlayerOptions = computed(() =>
  roundPlayers.value.map(p => ({ label: p.name, value: p.id }))
)

async function loadRoundPlayers() {
  if (!session.value) return
  try {
    const res = await $fetch<any>(`/api/game/rounds/${session.value.roundId}/players`)
    if (res.success) roundPlayers.value = res.data
  } catch {
    roundPlayers.value = []
  }
}

function syncMultiPlayerSelection() {
  if (!session.value) return
  multiPlayerSelection.value = multiPlayerOptions.value.find(
    (o: any) => o.value === session.value!.playerId
  ) ?? null
}

let switchingPlayer = false
watch(multiPlayerSelection, async (player) => {
  if (!isMultiMode.value || switchingPlayer || !loggedIn.value) return
  const playerId = getPlayerId(player)
  if (!playerId || !session.value || playerId === session.value.playerId) return

  switchingPlayer = true
  try {
    const res = await $fetch<any>('/api/game/player/login', {
      method: 'POST',
      body: { round_id: session.value.roundId, player_id: playerId }
    })
    if (res.success) {
      saveCurrentDraft()
      session.value = {
        playerId: res.player.id,
        roundId: res.player.round_id,
        name: res.player.name
      }
      localStorage.setItem(SESSION_KEY, JSON.stringify(session.value))
      selectedTicker.value = null
      chartData.value = []
      loadedChartKey = null
      quotePrice.value = null
      tradeDraftsByTicker.value = {}
      tradeForm.value = { action: 'buy', shares: 1 }
      currentNews.value = null
      lastSeenTurn.value = null
      lastShownNewsTurn.value = null
      await refreshPortfolio()
      await refreshTickers()
    }
  } catch (e: any) {
    toast.add({ title: e.data?.statusMessage ?? 'Chyba přepnutí hráče', color: 'error' })
    syncMultiPlayerSelection()
  } finally {
    switchingPlayer = false
  }
})

// Portfolio
const portfolio = ref<any>(null)
const portfolioLoading = ref(false)

const roundStatus = computed(() => portfolio.value?.round?.status ?? 'setup')
const roundStatusLabel = computed(() => {
  const s = roundStatus.value
  if (s === 'setup') return 'Příprava'
  if (s === 'active') return 'Aktivní'
  if (s === 'finished') return 'Ukončeno'
  return s
})

async function refreshPortfolio(options: { silent?: boolean } = {}) {
  if (!session.value) return
  portfolioLoading.value = true
  try {
    const res = await $fetch<any>(`/api/game/player/${session.value.playerId}/portfolio`)
    if (res.success) {
      portfolio.value = res.data

      const newTurn = Number(res.data?.round?.current_turn ?? 0)
      if (Number.isFinite(newTurn) && newTurn > 0) {
        if (lastSeenTurn.value === null) {
          lastSeenTurn.value = newTurn
          const latestClosedTurn = newTurn - 1
          if (latestClosedTurn >= 2 && latestClosedTurn !== lastShownNewsTurn.value) {
            await refreshRoundNews(latestClosedTurn, { silent: true })
          }
        } else if (newTurn !== lastSeenTurn.value) {
          const justClosedTurn = newTurn - 1
          if (justClosedTurn >= 2 && justClosedTurn !== lastShownNewsTurn.value) {
            await refreshRoundNews(justClosedTurn, { silent: true })
          }
          lastSeenTurn.value = newTurn
        }
      }
    }
    await refreshTickers()
    reconcileSelectedTicker()
    const symbol = selectedTickerSymbol.value
    if (symbol) {
      await fetchQuote(symbol)
    }
  } catch (e: any) {
    if (e.statusCode === 404 || e.status === 404) {
      leaveGame()
      if (!options.silent) {
        toast.add({ title: 'Kolo nebo hráč již neexistuje', color: 'error' })
      }
      return
    }
    if (!options.silent) {
      toast.add({ title: e.data?.statusMessage ?? 'Chyba načítání portfolia', color: 'error' })
    }
  } finally {
    portfolioLoading.value = false
  }
}

function deterministicIndex(seed: string, length: number): number {
  if (length <= 0) return 0
  let hash = 2166136261
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0) % length
}

function fillTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_m, key: string) => values[key] ?? `{${key}}`)
}

function buildNewsHeadline(event: NewsEvent): string {
  if (event.polarity === 'positive') {
    return `${event.ticker}: býčí extáze na plný plyn`
  }
  return `${event.ticker}: medvědí propad zapnul sirény`
}

async function refreshRoundNews(turn: number, options: { silent?: boolean } = {}) {
  if (!session.value || turn < 2) return
  try {
    const res = await $fetch<{ success: boolean; data: RoundNewsPayload | null }>(
      `/api/game/rounds/${session.value.roundId}/news?turn=${turn}`
    )

    lastShownNewsTurn.value = turn
    if (!res.success || !res.data?.selected) return

    const selected = res.data.selected
    const templates = selected.polarity === 'positive' ? positiveTemplates : negativeTemplates
    if (!templates.length) return

    const seed = `${session.value.roundId}|${turn}|${selected.ticker}|${selected.player_id}|${selected.polarity}`
    const template = templates[deterministicIndex(seed, templates.length)]!
    const playerNames = selected.player_name
    const amount = fmtSigned(selected.gain_amount)

    const body = fillTemplate(template, {
      ticker: selected.ticker,
      companyName: selected.company_name,
      playerName: playerNames,
      playerNames,
      amount,
      amountAbs: fmt(Math.abs(selected.gain_amount)),
      percent: fmtSignedPercent(selected.gain_percent),
      shares: fmtShares(selected.shares_at_turn),
      polarityTextStyle: `class="${selected.polarity === 'positive' ? 'text-emerald-300' : 'text-rose-300'}"`
    })

    currentNews.value = {
      turn,
      polarity: selected.polarity,
      headline: buildNewsHeadline(selected),
      body,
      ticker: selected.ticker,
      companyName: selected.company_name,
      playerNames,
      amount
    }
  } catch (e: any) {
    if (!options.silent) {
      toast.add({ title: e.data?.statusMessage ?? 'Chyba načítání tržní zprávy', color: 'error' })
    }
  }
}

// Auto-refresh every 5 seconds
let refreshInterval: ReturnType<typeof setInterval> | null = null

function startAutoRefresh() {
  stopAutoRefresh()
  refreshInterval = setInterval(async () => {
    if (!loggedIn.value || !session.value) return
    await refreshPortfolio({ silent: true })
    if (selectedTickerSymbol.value) {
      await loadChart({ silent: true })
    }
  }, 5000)
}

function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
}

// Chart
const tickersData = ref<any>(null)

async function refreshTickers() {
  if (!session.value) return
  try {
    const res = await $fetch<any>(`/api/game/player/${session.value.playerId}/tickers`)
    if (res.success) tickersData.value = res
  } catch {
    tickersData.value = null
  }
}

const tickerOptions = computed(() =>
  (tickersData.value?.data ?? []).map((t: any) => ({
    label: t.sell_only
      ? `${t.ticker} — pouze prodej`
      : `${t.ticker} — ${t.popis}`,
    value: t.ticker,
    sell_only: Boolean(t.sell_only)
  }))
)

const sellOnlyTickerSet = computed(() =>
  new Set(tickerOptions.value.filter((t: any) => t.sell_only).map((t: any) => t.value))
)

const isSelectedTickerSellOnly = computed(() => {
  const symbol = selectedTickerSymbol.value
  return symbol ? sellOnlyTickerSet.value.has(symbol) : false
})

function reconcileSelectedTicker() {
  const symbol = selectedTickerSymbol.value
  if (!symbol) return

  const inList = tickerOptions.value.some((t: any) => t.value === symbol)
  const held = portfolio.value?.holdings?.some((h: any) => h.ticker === symbol)
  if (!inList && !held) {
    selectedTicker.value = null
    chartData.value = []
    loadedChartKey = null
    quotePrice.value = null
  }
}

function getTickerOption(ticker: string) {
  return tickerOptions.value.find((t: any) => t.value === ticker) ?? {
    label: `${ticker} — pouze prodej`,
    value: ticker,
    sell_only: true
  }
}

const selectedTicker = ref<any>(null)
const selectedTickerSymbol = computed(() => getTickerSymbol(selectedTicker.value))
const chartData = ref<any[]>([])
const chartLoading = ref(false)
let loadedChartKey: string | null = null

function getChartLoadKey(): string | null {
  const symbol = selectedTickerSymbol.value
  const endDate = portfolio.value?.round?.current_date
  if (!symbol || !endDate) return null
  return `${symbol}|${endDate}`
}

const colorPalette = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316', '#14b8a6']
const chartCategories = computed(() => {
  const symbol = selectedTickerSymbol.value
  if (!symbol) return {}
  return {
    [`${symbol}_close`]: {
      name: `${symbol} (Závěr)`,
      color: colorPalette[0]
    }
  }
})

async function loadChart(options: { silent?: boolean; force?: boolean } = {}) {
  const symbol = selectedTickerSymbol.value
  if (!session.value || !symbol) return

  const chartKey = getChartLoadKey()
  if (!options.force && chartKey && chartKey === loadedChartKey) {
    return
  }

  if (!options.silent) {
    chartLoading.value = true
  }
  try {
    const res = await $fetch<any>(
      `/api/game/player/${session.value.playerId}/prices?tickers=${symbol}`
    )
    if (res.success) {
      chartData.value = res.data
      loadedChartKey = chartKey
    }
  } catch (e: any) {
    if (!options.silent) {
      toast.add({ title: e.data?.statusMessage ?? 'Chyba načítání grafů', color: 'error' })
    }
  } finally {
    if (!options.silent) {
      chartLoading.value = false
    }
  }
}

const xFormatter = (index: number) => {
  const d = chartData.value[index]?.date
  if (!d) return ''
  const [y, m, day] = d.split('-')
  return `${parseInt(day)}. ${parseInt(m)}. ${y}`
}

// Trade drafts per ticker
const tradeDraftsByTicker = ref<Record<string, TradeDraft>>({})
const tradeForm = ref<TradeDraft>({ action: 'buy', shares: 1 })
const trading = ref(false)
const quotePrice = ref<number | null>(null)

function saveCurrentDraft() {
  const symbol = selectedTickerSymbol.value
  if (!symbol) return
  tradeDraftsByTicker.value[symbol] = {
    action: tradeForm.value.action,
    shares: tradeForm.value.shares
  }
}

function restoreDraft(symbol: string) {
  const draft = tradeDraftsByTicker.value[symbol]
  const sellOnly = sellOnlyTickerSet.value.has(symbol)
  tradeForm.value = {
    action: sellOnly ? 'sell' : (draft?.action ?? 'buy'),
    shares: draft?.shares ?? 1
  }
}

function setTradeAction(action: 'buy' | 'sell') {
  if (action === 'buy' && isSelectedTickerSellOnly.value) return
  tradeForm.value.action = action
  saveCurrentDraft()
}

watch(() => tradeForm.value.shares, () => {
  saveCurrentDraft()
})

watch(selectedTicker, async (newTicker, oldTicker) => {
  const oldSymbol = getTickerSymbol(oldTicker)
  const newSymbol = getTickerSymbol(newTicker)

  if (oldSymbol) {
    tradeDraftsByTicker.value[oldSymbol] = {
      action: tradeForm.value.action,
      shares: tradeForm.value.shares
    }
  }

  if (!newSymbol) {
    chartData.value = []
    loadedChartKey = null
    quotePrice.value = null
    return
  }

  restoreDraft(newSymbol)
  await Promise.all([
    loadChart({ force: true }),
    fetchQuote(newSymbol)
  ])
})

async function fetchQuote(symbol: string) {
  if (!session.value) return
  try {
    const res = await $fetch<any>(
      `/api/game/player/${session.value.playerId}/quote?ticker=${symbol}`
    )
    if (res.success) quotePrice.value = res.data.price
  } catch {
    quotePrice.value = null
  }
}

function selectTickerForSell(ticker: string) {
  const option = getTickerOption(ticker)

  saveCurrentDraft()

  tradeDraftsByTicker.value[ticker] = {
    action: 'sell',
    shares: tradeDraftsByTicker.value[ticker]?.shares ?? 1
  }

  if (selectedTickerSymbol.value === ticker) {
    restoreDraft(ticker)
    fetchQuote(ticker)
    return
  }

  selectedTicker.value = option
}

const tradePreview = computed(() => {
  const ticker = selectedTickerSymbol.value
  if (!ticker || !tradeForm.value.shares) return null
  const holding = portfolio.value?.holdings?.find((h: any) => h.ticker === ticker)
  const price = quotePrice.value ?? holding?.current_price ?? null
  if (!price) return null
  const total = price * tradeForm.value.shares
  const cash = portfolio.value?.player?.cash ?? 0
  const loanBalance = portfolio.value?.player?.loan_balance ?? 0
  const fromCash = Math.min(cash, total)
  const fromLoan = total - fromCash
  const remainingCash = cash - fromCash
  const remainingLoanBalance = loanBalance - fromLoan
  const canAfford = cash + loanBalance + 0.0001 >= total
  const ownedShares = holding?.shares ?? 0
  return { price, total, remainingCash, remainingLoanBalance, canAfford, ownedShares }
})

function normalizeShareInput(shares: number): number {
  return Math.round(shares * 100) / 100
}

function isValidShareInput(shares: number): boolean {
  if (!Number.isFinite(shares) || shares < 0.01) return false
  return Math.abs(shares - normalizeShareInput(shares)) <= 0.0001
}

async function executeTrade() {
  if (!session.value) return
  const ticker = selectedTickerSymbol.value
  if (!ticker || !tradeForm.value.shares) {
    toast.add({ title: 'Vyberte akcii a počet kusů', color: 'error' })
    return
  }

  const shares = normalizeShareInput(Number(tradeForm.value.shares))
  if (!isValidShareInput(shares)) {
    toast.add({ title: 'Počet kusů musí být násobkem 0.01 a alespoň 0.01', color: 'error' })
    return
  }

  if (tradeForm.value.action === 'buy' && isSelectedTickerSellOnly.value) {
    toast.add({ title: 'Tuto akcii nelze v aktuálním období koupit', color: 'error' })
    return
  }

  trading.value = true
  try {
    const res = await $fetch<any>(`/api/game/player/${session.value.playerId}/trade`, {
      method: 'POST',
      body: {
        ticker,
        action: tradeForm.value.action,
        shares
      }
    })
    if (res.success) {
      toast.add({ title: res.message, color: 'success' })
      tradeForm.value.shares = 1
      tradeDraftsByTicker.value[ticker] = {
        action: tradeForm.value.action,
        shares: 1
      }
      await refreshPortfolio()
    }
  } catch (e: any) {
    toast.add({ title: e.data?.statusMessage ?? 'Chyba při obchodu', color: 'error' })
  } finally {
    trading.value = false
  }
}

function fmt(val: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)
}
function fmtSmall(val: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val)
}
function fmtShares(val: number) {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(val)
}
function fmtSigned(val: number) {
  const base = fmt(Math.abs(val))
  if (Math.abs(val) < 0.0001) return base
  return val > 0 ? `+${base}` : `-${base}`
}
function fmtSignedPercent(val: number) {
  const abs = Math.abs(val).toFixed(2)
  if (Math.abs(val) < 0.0001) return '0.00%'
  return val > 0 ? `+${abs}%` : `-${abs}%`
}
function roundGainClass(val: number) {
  if (val > 0.0001) return 'text-emerald-400'
  if (val < -0.0001) return 'text-rose-400'
  return 'text-slate-500'
}
</script>
