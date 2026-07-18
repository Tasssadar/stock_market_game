import { negativeTemplates, positiveTemplates } from '~/data/stockNewsTemplates'

export type NewsPolarity = 'positive' | 'negative'

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

export type RenderedNews = {
  turn: number
  polarity: NewsPolarity
  headline: string
  body: string
  ticker: string
  companyName: string
  playerNames: string
  amount: string
}

const positiveHeadlineVariants = [
  'internet slaví nečekaný posun o úroveň výš',
  'čísla vystřelila jak raketa na festivalu',
  'dneska jede v turbo režimu bez přehřívání',
  'vítězný soundtrack hraje na plné pecky',
  'chat nestíhá chrlit oslavné gify',
  'všichni hledají, kdo zapnul tajný kód',
  'nálada je nahoře a konfety dochází',
  'hlášeno: denní dávka radosti doručena'
]

const negativeHeadlineVariants = [
  'režim den blbec byl právě aktivován',
  'tabule hlásí kritický nedostatek radosti',
  'dneska to sjelo dolů bez varování',
  'chat píše jen "au" a posílá smutné smajlíky',
  'nálada spadla a soundtrack ztichl',
  'nečekaný pád přepsal plán dne',
  'čísla zakopla a tvrdě přistála',
  'dnes vítězí chaos a zvednuté obočí'
]

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

function pickRandom(items: string[]): string {
  return items[Math.floor(Math.random() * items.length)] ?? ''
}

function buildNewsHeadline(event: NewsEvent): string {
  if (event.polarity === 'positive') {
    return `${event.ticker}: ${pickRandom(positiveHeadlineVariants)}`
  }
  return `${event.ticker}: ${pickRandom(negativeHeadlineVariants)}`
}

function fmt(val: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)
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

function fmtShares(val: number) {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(val)
}

export function useRoundNews() {
  const toast = useToast()
  const currentNews = ref<RenderedNews | null>(null)
  const lastShownNewsTurn = ref<number | null>(null)

  function clearNews() {
    currentNews.value = null
    lastShownNewsTurn.value = null
  }

  async function refreshRoundNews(roundId: number, turn: number, options: { silent?: boolean } = {}) {
    if (!roundId || turn < 1) {
      currentNews.value = null
      return
    }
    try {
      const res = await $fetch<{ success: boolean; data: RoundNewsPayload | null }>(
        `/api/game/rounds/${roundId}/news?turn=${turn}`
      )

      lastShownNewsTurn.value = turn
      if (!res.success || !res.data?.selected) {
        currentNews.value = null
        return
      }

      const selected = res.data.selected
      const templates = selected.polarity === 'positive' ? positiveTemplates : negativeTemplates
      if (!templates.length) {
        currentNews.value = null
        return
      }

      const seed = `${roundId}|${turn}|${selected.ticker}|${selected.player_id}|${selected.polarity}`
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

  return {
    currentNews,
    lastShownNewsTurn,
    clearNews,
    refreshRoundNews
  }
}
