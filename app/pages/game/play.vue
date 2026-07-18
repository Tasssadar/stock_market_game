<template>
  <div class="min-h-screen bg-slate-950">

    <!-- Login Screen -->
    <div v-if="!loggedIn" class="flex items-center justify-center min-h-screen p-4">
      <div class="w-full max-w-md space-y-6">
        <div class="text-center space-y-2">
          <div class="inline-flex p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-2">
            <UIcon name="i-lucide-trending-up" class="h-10 w-10 text-emerald-400" />
          </div>
          <h1 class="text-3xl font-extrabold text-white">Akciová Hra</h1>
          <p class="text-slate-400">Přihlaste se do svého účtu</p>
        </div>

        <UCard class="border-slate-800 bg-slate-900/80 backdrop-blur-md" :ui="{ body: 'p-6 space-y-4' }">
          <UFormField label="Herní kolo" name="round">
            <USelectMenu
              v-model="loginForm.roundId"
              :items="roundOptions"
              placeholder="Vyberte kolo..."
              class="w-full"
            />
          </UFormField>

          <UFormField label="Vaše jméno" name="name">
            <UInput v-model="loginForm.name" placeholder="Jméno hráče" class="w-full" />
          </UFormField>

          <UFormField label="PIN" name="pin">
            <UInput v-model="loginForm.pin" type="password" maxlength="4" placeholder="4-místný PIN" class="w-full" />
          </UFormField>

          <UButton
            color="primary"
            size="lg"
            class="w-full"
            icon="i-lucide-log-in"
            :loading="loginLoading"
            @click="login"
          >
            Vstoupit do hry
          </UButton>

          <p v-if="loginError" class="text-sm text-rose-400 text-center">{{ loginError }}</p>
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
        <div>
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
          <p class="text-sm text-slate-500 mt-1">
            Tah {{ portfolio?.round?.current_turn }} · Datum: {{ portfolio?.round?.current_date }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <UButton size="sm" variant="ghost" color="neutral" icon="i-lucide-refresh-cw" :loading="portfolioLoading" @click="refreshPortfolio">
            Obnovit
          </UButton>
          <UButton size="sm" variant="ghost" color="neutral" icon="i-lucide-log-out" @click="logout">
            Odhlásit
          </UButton>
        </div>
      </div>

      <!-- Portfolio Summary Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p class="text-xs text-slate-500 uppercase tracking-wider font-medium">Hotovost</p>
          <p class="mt-1.5 text-xl font-bold text-white font-mono">{{ fmt(portfolio?.player?.cash ?? 0) }}</p>
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
            <div class="flex flex-col sm:flex-row sm:items-center gap-3">
              <USelectMenu
                v-model="selectedTickers"
                :items="tickerOptions"
                multiple
                searchable
                placeholder="Vyberte akcie k zobrazení..."
                class="flex-1"
              >
                <template #default>
                  <div v-if="selectedTickers.length" class="flex flex-wrap gap-1">
                    <UBadge v-for="t in selectedTickers" :key="t.value" size="sm" color="primary" variant="soft">
                      {{ t.value }}
                    </UBadge>
                  </div>
                  <span v-else class="text-slate-500">Vyberte akcie...</span>
                </template>
              </USelectMenu>
              <UButton size="sm" variant="soft" color="primary" icon="i-lucide-search" :loading="chartLoading" @click="loadChart">
                Zobrazit graf
              </UButton>
            </div>
          </UCard>

          <!-- Chart -->
          <UCard class="border-slate-800 bg-slate-900/60" :ui="{ body: 'p-4' }">
            <template #header>
              <div class="flex items-center justify-between">
                <h2 class="text-sm font-bold text-white flex items-center gap-2">
                  <UIcon name="i-lucide-line-chart" class="h-4 w-4 text-blue-400" />
                  Vývoj cen (do tahu {{ portfolio?.round?.current_turn }})
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
                <p class="text-sm text-slate-500">Vyberte akcie a klikněte na „Zobrazit graf"</p>
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
              <div
                v-for="h in portfolio.holdings"
                :key="h.ticker"
                class="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-colors"
              >
                <div>
                  <p class="text-sm font-bold text-white">{{ h.ticker }}</p>
                  <p class="text-xs text-slate-500">{{ h.shares }} ks · {{ fmtSmall(h.current_price) }}/ks</p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-bold text-white">{{ fmt(h.value) }}</p>
                </div>
              </div>
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
              </h2>
            </template>

            <div v-if="roundStatus !== 'active'" class="text-center py-4">
              <UIcon name="i-lucide-lock" class="h-8 w-8 text-slate-600 mx-auto mb-2" />
              <p class="text-sm text-slate-500">
                {{ roundStatus === 'setup' ? 'Kolo ještě nezačalo' : 'Kolo je ukončeno' }}
              </p>
            </div>

            <template v-else>
              <!-- Action toggle -->
              <div class="flex rounded-lg overflow-hidden border border-slate-700">
                <button
                  type="button"
                  class="flex-1 py-2 text-sm font-semibold transition-colors"
                  :class="tradeForm.action === 'buy' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800/60 text-slate-400 hover:text-white'"
                  @click="tradeForm.action = 'buy'"
                >
                  Koupit
                </button>
                <button
                  type="button"
                  class="flex-1 py-2 text-sm font-semibold transition-colors"
                  :class="tradeForm.action === 'sell' ? 'bg-rose-500 text-white' : 'bg-slate-800/60 text-slate-400 hover:text-white'"
                  @click="tradeForm.action = 'sell'"
                >
                  Prodat
                </button>
              </div>

              <UFormField label="Ticker" name="ticker">
                <USelectMenu
                  v-model="tradeForm.ticker"
                  :items="tickerOptions"
                  searchable
                  placeholder="Vyberte akcii..."
                  class="w-full"
                />
              </UFormField>

              <UFormField label="Počet kusů" name="shares">
                <UInput v-model.number="tradeForm.shares" type="number" min="1" placeholder="Počet akcií" class="w-full" />
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
                <div v-if="tradeForm.action === 'buy'" class="flex justify-between text-slate-400">
                  <span>Hotovost po nákupu:</span>
                  <span class="font-mono" :class="tradePreview.remainingCash >= 0 ? 'text-emerald-400' : 'text-rose-400'">
                    {{ fmt(tradePreview.remainingCash) }}
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
                {{ tradeForm.action === 'buy' ? 'Koupit' : 'Prodat' }} {{ tradeForm.shares || '' }} ks
              </UButton>
            </template>
          </UCard>
        </div>
      </div>

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
                <td class="py-2 pr-4 text-right font-mono">{{ t.shares }}</td>
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
useSeoMeta({
  title: 'Akciová Hra — Hrát',
  description: 'Hráčský dashboard pro nákup a prodej akcií'
})

const toast = useToast()

// Auth state
const loggedIn = ref(false)
const session = ref<{ playerId: number; pin: string; roundId: number } | null>(null)

// Rounds for login dropdown
const { data: roundsData } = await useFetch<any>('/api/game/rounds', { lazy: true })
const roundOptions = computed(() =>
  (roundsData.value?.data ?? [])
    .filter((r: any) => r.status !== 'finished')
    .map((r: any) => ({ label: r.name, value: r.id }))
)

const loginForm = ref({ roundId: null as any, name: '', pin: '' })
const loginLoading = ref(false)
const loginError = ref('')

async function login() {
  loginError.value = ''
  if (!loginForm.value.roundId || !loginForm.value.name || !loginForm.value.pin) {
    loginError.value = 'Vyplňte všechna pole'
    return
  }
  loginLoading.value = true
  try {
    const res = await $fetch<any>('/api/game/player/login', {
      method: 'POST',
      body: {
        round_id: loginForm.value.roundId.value ?? loginForm.value.roundId,
        name: loginForm.value.name,
        pin: loginForm.value.pin
      }
    })
    if (res.success) {
      session.value = {
        playerId: res.player.id,
        pin: loginForm.value.pin,
        roundId: res.player.round_id
      }
      loggedIn.value = true
      await refreshPortfolio()
    }
  } catch (e: any) {
    loginError.value = e.data?.statusMessage ?? 'Přihlášení selhalo'
  } finally {
    loginLoading.value = false
  }
}

function logout() {
  loggedIn.value = false
  session.value = null
  portfolio.value = null
  chartData.value = []
}

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

async function refreshPortfolio() {
  if (!session.value) return
  portfolioLoading.value = true
  try {
    const res = await $fetch<any>(`/api/game/player/${session.value.playerId}/portfolio?pin=${session.value.pin}`)
    if (res.success) portfolio.value = res.data
  } catch (e: any) {
    toast.add({ title: e.data?.statusMessage ?? 'Chyba načítání portfolia', color: 'error' })
  } finally {
    portfolioLoading.value = false
  }
}

// Chart
const { data: tickersData } = await useFetch<any>('/api/tickers', { lazy: true })
const tickerOptions = computed(() =>
  (tickersData.value?.data ?? []).map((t: any) => ({
    label: `${t.ticker} — ${t.popis.split(' - ')[0]}`,
    value: t.ticker
  }))
)
const selectedTickers = ref<any[]>([])
const chartData = ref<any[]>([])
const chartLoading = ref(false)

const colorPalette = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316', '#14b8a6']
const chartCategories = computed(() => {
  const cats: any = {}
  selectedTickers.value.forEach((t: any, idx: number) => {
    cats[`${t.value}_close`] = {
      name: `${t.value} (Závěr)`,
      color: colorPalette[idx % colorPalette.length]
    }
  })
  return cats
})

async function loadChart() {
  if (!session.value || !selectedTickers.value.length) return
  chartLoading.value = true
  try {
    const tickers = selectedTickers.value.map((t: any) => t.value).join(',')
    const res = await $fetch<any>(
      `/api/game/player/${session.value.playerId}/prices?pin=${session.value.pin}&tickers=${tickers}`
    )
    if (res.success) chartData.value = res.data
  } catch (e: any) {
    toast.add({ title: e.data?.statusMessage ?? 'Chyba načítání grafů', color: 'error' })
  } finally {
    chartLoading.value = false
  }
}

const xFormatter = (index: number) => {
  const d = chartData.value[index]?.date
  if (!d) return ''
  const [y, m, day] = d.split('-')
  return `${parseInt(day)}. ${parseInt(m)}. ${y}`
}

// Trade
const tradeForm = ref({ action: 'buy' as 'buy' | 'sell', ticker: null as any, shares: 1 })
const trading = ref(false)

const tradePreview = computed(() => {
  const ticker = tradeForm.value.ticker?.value ?? tradeForm.value.ticker
  if (!ticker || !tradeForm.value.shares) return null
  const holding = portfolio.value?.holdings?.find((h: any) => h.ticker === ticker)
  const price = holding?.current_price ?? null
  if (!price) return null
  const total = price * tradeForm.value.shares
  const remainingCash = (portfolio.value?.player?.cash ?? 0) - total
  return { price, total, remainingCash }
})

async function executeTrade() {
  if (!session.value) return
  const ticker = tradeForm.value.ticker?.value ?? tradeForm.value.ticker
  if (!ticker || !tradeForm.value.shares) {
    toast.add({ title: 'Vyberte akcii a počet kusů', color: 'error' })
    return
  }
  trading.value = true
  try {
    const res = await $fetch<any>(`/api/game/player/${session.value.playerId}/trade`, {
      method: 'POST',
      body: {
        pin: session.value.pin,
        ticker,
        action: tradeForm.value.action,
        shares: Number(tradeForm.value.shares)
      }
    })
    if (res.success) {
      toast.add({ title: res.message, color: 'success' })
      tradeForm.value.shares = 1
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
</script>
