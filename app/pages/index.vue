<template>
  <div class="space-y-8 p-4 md:p-8 max-w-7xl mx-auto">
    <!-- Header/Hero Section -->
    <div class="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-6 md:p-8 shadow-xl">
      <div class="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl"></div>
      <div class="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl"></div>
      
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <span class="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
              Database Connected
            </span>
            <span class="inline-flex items-center rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400 ring-1 ring-inset ring-blue-500/20">
              SQLite
            </span>
          </div>
          <h1 class="text-3xl font-extrabold tracking-tight text-white sm:text-4xl bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            České Akcie Analytics
          </h1>
          <p class="mt-2 text-base text-slate-400 max-w-2xl">
            Interaktivní rozhraní pro vizualizaci historických cen akcií z databáze pražské burzy.
            Porovnávejte vývoj více tickerů najednou v libovolném časovém období.
          </p>
        </div>
        
        <!-- Quick Stats Grid -->
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:flex md:gap-8 bg-slate-900/50 p-4 rounded-xl border border-slate-800/80 backdrop-blur-sm">
          <div class="text-center md:text-left">
            <p class="text-xs font-medium text-slate-500 uppercase tracking-wider">Celkem akcií</p>
            <p class="mt-1 text-xl font-bold text-emerald-400">{{ tickers.length || 48 }}</p>
          </div>
          <div class="h-px w-full bg-slate-800 md:h-8 md:w-px my-auto hidden sm:block"></div>
          <div class="text-center md:text-left">
            <p class="text-xs font-medium text-slate-500 uppercase tracking-wider">Datové body</p>
            <p class="mt-1 text-xl font-bold text-blue-400">262K+</p>
          </div>
          <div class="h-px w-full bg-slate-800 md:h-8 md:w-px my-auto hidden md:block"></div>
          <div class="text-center md:text-left col-span-2 sm:col-span-1">
            <p class="text-xs font-medium text-slate-500 uppercase tracking-wider">Rozsah dat</p>
            <p class="mt-1 text-sm font-bold text-slate-300">1962 – 2020</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Workspace -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      <!-- Controls Panel (Left Sidebar) -->
      <div class="lg:col-span-4 space-y-6">
        <UCard class="border-slate-800 bg-slate-950/60 backdrop-blur-md shadow-lg" :ui="{ body: 'p-6 space-y-6' }">
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-bold text-white flex items-center gap-2">
                <UIcon name="i-lucide-sliders-horizontal" class="h-5 w-5 text-emerald-400" />
                Nastavení filtru
              </h2>
              <UButton 
                variant="ghost" 
                color="neutral" 
                size="xs"
                @click="resetFilters"
                class="text-xs text-slate-400 hover:text-white"
              >
                Resetovat
              </UButton>
            </div>
          </template>

          <!-- Tickers Multi-Select -->
          <UFormField label="Výběr akcií (Tickery)" name="tickers" description="Vyberte jednu nebo více akcií k porovnání">
            <USelectMenu
              v-model="selectedTickers"
              :items="tickersOptions"
              multiple
              searchable
              placeholder="Vyberte akcie..."
              class="w-full text-slate-300"
              size="md"
            >
              <template #default>
                <div v-if="selectedTickers.length" class="flex flex-wrap gap-1 max-w-full overflow-hidden">
                  <UBadge
                    v-for="ticker in selectedTickers"
                    :key="ticker.value"
                    size="sm"
                    color="primary"
                    variant="soft"
                    class="shrink-0"
                  >
                    {{ ticker.value }}
                  </UBadge>
                </div>
                <span v-else class="text-slate-500">Zvolte akcie...</span>
              </template>
            </USelectMenu>
          </UFormField>

          <!-- Price Types Segmented Toggles -->
          <UFormField label="Typ ceny" name="priceTypes" description="Které typy cen chcete zobrazit v grafu">
            <div class="grid grid-cols-2 gap-2 mt-1">
              <button
                v-for="type in priceTypeOptions"
                :key="type.value"
                type="button"
                @click="togglePriceType(type.value)"
                :class="[
                  selectedPriceTypes.includes(type.value)
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 font-medium'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800/50 hover:text-slate-300',
                  'px-3 py-2 text-sm rounded-lg border text-center transition-all duration-200 flex items-center justify-between'
                ]"
              >
                <span>{{ type.label }}</span>
                <UIcon 
                  v-if="selectedPriceTypes.includes(type.value)" 
                  name="i-lucide-check" 
                  class="h-4 w-4" 
                />
              </button>
            </div>
          </UFormField>

          <!-- Time Range Selectors -->
          <UFormField label="Časové období" name="timeRange">
            <div class="space-y-4">
              <!-- Quick Filters -->
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="range in quickRangeOptions"
                  :key="range.value"
                  type="button"
                  @click="setQuickRange(range.value)"
                  :class="[
                    quickRange === range.value
                      ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/10'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200',
                    'px-2.5 py-1.5 text-xs rounded-md transition-all duration-200 grow text-center'
                  ]"
                >
                  {{ range.label }}
                </button>
              </div>

              <!-- Custom Dates Inputs -->
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-xs text-slate-500 mb-1 font-medium">Od</label>
                  <UInput
                    v-model="startDate"
                    type="date"
                    min="1962-01-02"
                    max="2020-04-01"
                    size="md"
                    class="w-full"
                    @change="quickRange = 'custom'"
                  />
                </div>
                <div>
                  <label class="block text-xs text-slate-500 mb-1 font-medium">Do</label>
                  <UInput
                    v-model="endDate"
                    type="date"
                    min="1962-01-02"
                    max="2020-04-01"
                    size="md"
                    class="w-full"
                    @change="quickRange = 'custom'"
                  />
                </div>
              </div>
            </div>
          </UFormField>

        </UCard>
      </div>

      <!-- Chart Display (Right Column) -->
      <div class="lg:col-span-8 space-y-6">
        <UCard class="border-slate-800 bg-slate-950/60 backdrop-blur-md shadow-lg h-full flex flex-col" :ui="{ body: 'p-6 flex-grow flex flex-col justify-between' }">
          <template #header>
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 class="text-lg font-bold text-white flex items-center gap-2">
                  <UIcon name="i-lucide-trending-up" class="h-5 w-5 text-blue-400" />
                  Vývoj cen akcií
                </h2>
                <p class="text-xs text-slate-400 mt-0.5">
                  Vizualizace vybraných cen. Přejetím kurzoru zobrazíte detaily.
                </p>
              </div>

              <!-- Legend indicator summary -->
              <div v-if="!loading && chartData.length" class="flex flex-wrap gap-2">
                <span 
                  v-for="(cat, key) in categories" 
                  :key="key"
                  class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-medium text-slate-300"
                >
                  <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: cat.color }"></span>
                  {{ cat.name }}
                </span>
              </div>
            </div>
          </template>

          <div class="relative min-h-[350px] flex-grow flex items-center justify-center bg-slate-950/40 rounded-xl border border-slate-900 p-4">
            <!-- Loading Indicator -->
            <div v-if="loading" class="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/80 rounded-xl backdrop-blur-sm">
              <UIcon name="i-lucide-loader-2" class="h-10 w-10 text-emerald-400 animate-spin mb-4" />
              <p class="text-sm text-slate-300 font-medium">Načítám data z databáze...</p>
              <p class="text-xs text-slate-500 mt-1">Hledám záznamy v SQLite</p>
            </div>

            <!-- Empty / Error State -->
            <div v-else-if="!selectedTickers.length" class="text-center py-12">
              <div class="inline-flex p-3 rounded-full bg-slate-900 border border-slate-800 text-slate-500 mb-4">
                <UIcon name="i-lucide-mouse-pointer-click" class="h-8 w-8" />
              </div>
              <h3 class="text-base font-semibold text-slate-200">Žádné vybrané akcie</h3>
              <p class="text-sm text-slate-500 max-w-sm mt-1 mx-auto">
                Chcete-li zobrazit graf cenového vývoje, vyberte alespoň jeden ticker v levém panelu.
              </p>
            </div>

            <div v-else-if="!selectedPriceTypes.length" class="text-center py-12">
              <div class="inline-flex p-3 rounded-full bg-slate-900 border border-slate-800 text-slate-500 mb-4">
                <UIcon name="i-lucide-check-square" class="h-8 w-8" />
              </div>
              <h3 class="text-base font-semibold text-slate-200">Žádný typ ceny</h3>
              <p class="text-sm text-slate-500 max-w-sm mt-1 mx-auto">
                Vyberte alespoň jeden typ ceny (Závěr, Otevření, Maximum, Minimum) pro zobrazení.
              </p>
            </div>

            <div v-else-if="chartData.length === 0" class="text-center py-12">
              <div class="inline-flex p-3 rounded-full bg-slate-900 border border-slate-800 text-yellow-500/20 mb-4">
                <UIcon name="i-lucide-alert-triangle" class="h-8 w-8 text-yellow-400" />
              </div>
              <h3 class="text-base font-semibold text-slate-200">Žádná data pro vybrané období</h3>
              <p class="text-sm text-slate-500 max-w-sm mt-1 mx-auto">
                Ve zvoleném časovém rozmezí ({{ startDate }} až {{ endDate }}) nebyly v databázi pro vybrané akcie nalezeny žádné záznamy.
              </p>
            </div>

            <!-- Chart Rendering -->
            <div v-else class="w-full h-[350px]">
              <LineChart
                :data="chartData"
                :categories="categories"
                :height="350"
                :xFormatter="xFormatter"
                xLabel="Datum"
                yLabel="Cena (CZK)"
              />
            </div>
          </div>
        </UCard>
      </div>

    </div>

    <!-- Ticker Summary Cards (Lower Section) -->
    <div v-if="!loading && tickerStats.length > 0" class="space-y-4">
      <h2 class="text-xl font-bold text-white flex items-center gap-2">
        <UIcon name="i-lucide-info" class="h-5 w-5 text-emerald-400" />
        Přehled vybraných titulů v období
      </h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="stat in tickerStats" 
          :key="stat.ticker" 
          class="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-5 shadow transition-all duration-300 hover:border-slate-700/80 hover:bg-slate-950/80"
        >
          <!-- Accent top border -->
          <div 
            class="absolute top-0 left-0 right-0 h-1" 
            :style="{ backgroundColor: getTickerColor(stat.ticker) }"
          ></div>
          
          <div class="flex items-start justify-between gap-4">
            <div>
              <h3 class="text-lg font-bold text-white">{{ stat.ticker }}</h3>
              <p class="text-xs text-slate-500 line-clamp-1 mt-0.5" :title="stat.name">{{ stat.name }}</p>
            </div>
            
            <!-- Percentage Badge -->
            <span 
              :class="[
                stat.changePercent >= 0 
                  ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20' 
                  : 'bg-rose-500/10 text-rose-400 ring-rose-500/20',
                'inline-flex items-center rounded px-2 py-1 text-xs font-semibold ring-1 ring-inset'
              ]"
            >
              <UIcon 
                :name="stat.changePercent >= 0 ? 'i-lucide-arrow-up-right' : 'i-lucide-arrow-down-right'" 
                class="mr-1 h-3.5 w-3.5" 
              />
              {{ stat.changePercent >= 0 ? '+' : '' }}{{ stat.changePercent.toFixed(2) }}%
            </span>
          </div>

          <div class="mt-4 grid grid-cols-2 gap-4 border-t border-slate-900 pt-3">
            <div>
              <p class="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Aktuální cena (konec)</p>
              <p class="mt-1 text-base font-bold text-slate-200">
                {{ formatCurrency(stat.latestPrice) }}
              </p>
            </div>
            <div>
              <p class="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Změna ceny</p>
              <p :class="[
                stat.change >= 0 ? 'text-emerald-400' : 'text-rose-400',
                'mt-1 text-base font-bold'
              ]">
                {{ stat.change >= 0 ? '+' : '' }}{{ formatCurrency(stat.change) }}
              </p>
            </div>
            <div>
              <p class="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Minimum v období</p>
              <p class="mt-1 text-sm font-semibold text-slate-300">
                {{ formatCurrency(stat.minPrice) }}
              </p>
            </div>
            <div>
              <p class="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Maximum v období</p>
              <p class="mt-1 text-sm font-semibold text-slate-300">
                {{ formatCurrency(stat.maxPrice) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

interface Ticker {
  ticker: string
  popis: string
}

interface TickerOption {
  label: string
  value: string
  description: string
}

// ----------------------------------------------------
// Page SEO Metadata
// ----------------------------------------------------
useSeoMeta({
  title: 'České Akcie Analytics - SQLite Dashboard',
  description: 'Interaktivní dashboard pro vizualizaci a srovnání cen akcií z SQLite databáze v Nuxt.'
})

// ----------------------------------------------------
// Options & Constants
// ----------------------------------------------------
const priceTypeOptions = [
  { label: 'Závěr (Close)', value: 'close' },
  { label: 'Otevření (Open)', value: 'open' },
  { label: 'Maximum (High)', value: 'high' },
  { label: 'Minimum (Low)', value: 'low' }
]

const quickRangeOptions = [
  { label: '1 měsíc', value: '1M' },
  { label: '6 měsíců', value: '6M' },
  { label: '1 rok', value: '1Y' },
  { label: '5 let', value: '5Y' },
  { label: 'Vše', value: 'ALL' }
]

const colorPalette = [
  '#10b981', // emerald
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#ec4899', // pink
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#f97316', // orange
  '#14b8a6', // teal
  '#ef4444', // red
  '#a855f7'  // purple-light
]

// ----------------------------------------------------
// State Management
// ----------------------------------------------------
const tickers = ref<Ticker[]>([])
const loading = ref(false)
const chartData = ref<any[]>([])
const seriesKeys = ref<string[]>([])

// Filters state
const selectedTickers = ref<TickerOption[]>([])
const selectedPriceTypes = ref<string[]>(['close'])
const quickRange = ref('1Y')
const startDate = ref('2019-04-01')
const endDate = ref('2020-04-01') // Max date in dataset

// ----------------------------------------------------
// Computeds
// ----------------------------------------------------
// Map tickers list to option structure for USelectMenu
const tickersOptions = computed<TickerOption[]>(() => {
  return tickers.value.map((t) => ({
    label: `${t.ticker} - ${t.popis.split(' - ')[0]}`,
    value: t.ticker,
    description: t.popis
  }))
})

// Categories object expected by nuxt-charts
const categories = computed(() => {
  const cats: any = {}
  seriesKeys.value.forEach((key, index) => {
    const [ticker, priceType] = key.split('_')
    const priceTypeLabel = priceTypeOptions.find((p) => p.value === priceType)?.label.split(' ')[0] || priceType
    
    cats[key] = {
      name: `${ticker} (${priceTypeLabel})`,
      color: colorPalette[index % colorPalette.length]
    }
  })
  return cats
})

// Performance summary stats for each selected ticker
const tickerStats = computed(() => {
  if (!chartData.value || chartData.value.length === 0 || selectedTickers.value.length === 0) {
    return []
  }
  
  const stats = []
  
  for (const item of selectedTickers.value) {
    const ticker = item.value
    // Use first selected price type, or fallback to 'close'
    const priceType = selectedPriceTypes.value[0] || 'close'
    const key = `${ticker}_${priceType}`
    
    // Extract non-null price numbers
    const prices = chartData.value
      .map((d) => d[key])
      .filter((p) => p !== undefined && p !== null)
      
    if (prices.length === 0) continue
    
    const firstPrice = prices[0]
    const lastPrice = prices[prices.length - 1]
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const change = lastPrice - firstPrice
    const changePercent = firstPrice !== 0 ? (change / firstPrice) * 100 : 0
    
    stats.push({
      ticker,
      name: item.description || ticker,
      latestPrice: lastPrice,
      minPrice,
      maxPrice,
      change,
      changePercent
    })
  }
  
  return stats
})

// ----------------------------------------------------
// Methods & Functions
// ----------------------------------------------------
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(val)
}

// X-axis formatter: converts index to date string
const xFormatter = (index: number) => {
  if (!chartData.value || !chartData.value[index]) return ''
  // Format Date to local cs-CZ style e.g. "12. 5. 2019"
  try {
    const dateStr = chartData.value[index].date
    if (!dateStr) return ''
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      return `${parseInt(parts[2])}. ${parseInt(parts[1])}. ${parts[0]}`
    }
    return dateStr
  } catch {
    return chartData.value[index].date || ''
  }
}

// Helper to find colour for summary cards
const getTickerColor = (ticker: string) => {
  // Find index of this ticker in selected list to assign matching chart color
  const index = selectedTickers.value.findIndex((t) => t.value === ticker)
  if (index !== -1) {
    return colorPalette[index % colorPalette.length]
  }
  return '#cbd5e1'
}

// Toggles selection of a price type
const togglePriceType = (type: string) => {
  const index = selectedPriceTypes.value.indexOf(type)
  if (index === -1) {
    selectedPriceTypes.value.push(type)
  } else {
    // Keep at least one price type selected
    if (selectedPriceTypes.value.length > 1) {
      selectedPriceTypes.value.splice(index, 1)
    }
  }
}

// Set predefined ranges relative to max database date (2020-04-01)
const setQuickRange = (range: string) => {
  quickRange.value = range
  const maxDate = new Date('2020-04-01')
  endDate.value = '2020-04-01'
  
  if (range === '1M') {
    const d = new Date(maxDate)
    d.setMonth(d.getMonth() - 1)
    startDate.value = d.toISOString().split('T')[0] || ''
  } else if (range === '6M') {
    const d = new Date(maxDate)
    d.setMonth(d.getMonth() - 6)
    startDate.value = d.toISOString().split('T')[0] || ''
  } else if (range === '1Y') {
    const d = new Date(maxDate)
    d.setFullYear(d.getFullYear() - 1)
    startDate.value = d.toISOString().split('T')[0] || ''
  } else if (range === '5Y') {
    const d = new Date(maxDate)
    d.setFullYear(d.getFullYear() - 5)
    startDate.value = d.toISOString().split('T')[0] || ''
  } else if (range === 'ALL') {
    startDate.value = '1962-01-02'
  }
}

// Clear filters
const resetFilters = () => {
  if (tickersOptions.value.length) {
    selectedTickers.value = tickersOptions.value.filter(
      (opt) => opt.value === 'AAPL' || opt.value === 'MSFT'
    )
  }
  selectedPriceTypes.value = ['close']
  setQuickRange('1Y')
}

// Loads price data from backend server API
const loadPriceData = async () => {
  if (selectedTickers.value.length === 0 || selectedPriceTypes.value.length === 0) {
    chartData.value = []
    seriesKeys.value = []
    return
  }
  
  loading.value = true
  
  const tickerCodes = selectedTickers.value.map((t) => t.value).join(',')
  const priceTypesStr = selectedPriceTypes.value.join(',')
  
  try {
    const url = `/api/prices?tickers=${tickerCodes}&priceTypes=${priceTypesStr}&startDate=${startDate.value}&endDate=${endDate.value}`
    const res = await $fetch<any>(url)
    
    if (res.success) {
      chartData.value = res.data
      seriesKeys.value = res.seriesKeys
    } else {
      console.error('Failed to load prices:', res.message)
    }
  } catch (err) {
    console.error('API Error loading prices:', err)
  } finally {
    loading.value = false
  }
}

// ----------------------------------------------------
// Lifecycle & Watchers
// ----------------------------------------------------
onMounted(async () => {
  // Fetch available tickers from the backend database on-demand
  try {
    const res = await $fetch<any>('/api/tickers')
    if (res.success && res.data) {
      tickers.value = res.data
      // Set default selected tickers once loaded
      selectedTickers.value = tickersOptions.value.filter(
        (opt) => opt.value === 'AAPL' || opt.value === 'MSFT'
      )
    }
  } catch (err) {
    console.error('Error fetching tickers:', err)
  }
})

// Fetch prices whenever parameters change
watch(
  [selectedTickers, selectedPriceTypes, startDate, endDate],
  () => {
    loadPriceData()
  },
  { deep: true }
)
</script>

<style scoped>
/* Focus border styling for smooth UI */
input[type="date"] {
  color-scheme: dark;
}
</style>
