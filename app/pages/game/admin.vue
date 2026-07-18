<template>
  <div class="min-h-screen bg-slate-950 p-4 md:p-8">
    <div class="max-w-6xl mx-auto space-y-8">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <NuxtLink to="/game" class="text-slate-500 hover:text-slate-300 transition-colors text-sm flex items-center gap-1">
              <UIcon name="i-lucide-arrow-left" class="h-4 w-4" />
              Lobby
            </NuxtLink>
          </div>
          <h1 class="text-3xl font-extrabold text-white flex items-center gap-3">
            <UIcon name="i-lucide-settings-2" class="h-7 w-7 text-slate-400" />
            Správa hry
          </h1>
          <p class="text-slate-400 mt-1 text-sm">Vytvářejte kola, přidávejte hráče a spravujte tahy</p>
        </div>
        <UButton icon="i-lucide-plus" color="primary" size="lg" @click="showCreateModal = true">
          Nové kolo
        </UButton>
      </div>

      <!-- Rounds list -->
      <div class="space-y-4">
        <h2 class="text-lg font-bold text-white flex items-center gap-2">
          <UIcon name="i-lucide-layers" class="h-5 w-5 text-emerald-400" />
          Všechna kola
        </h2>

        <div v-if="roundsPending" class="space-y-3">
          <div v-for="i in 2" :key="i" class="h-32 rounded-xl bg-slate-900/60 animate-pulse border border-slate-800" />
        </div>

        <div v-else-if="!rounds.length" class="rounded-xl border border-slate-800 bg-slate-900/40 p-10 text-center">
          <UIcon name="i-lucide-inbox" class="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <p class="text-slate-400">Zatím žádná kola. Vytvořte první!</p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="round in rounds"
            :key="round.id"
            class="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden"
          >
            <!-- Round header -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-slate-800/60">
              <div class="flex items-center gap-4">
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="text-base font-bold text-white">{{ round.name }}</h3>
                    <span
                      class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset"
                      :class="{
                        'bg-yellow-500/10 text-yellow-400 ring-yellow-500/20': round.status === 'setup',
                        'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20': round.status === 'active',
                        'bg-slate-700/50 text-slate-400 ring-slate-600/20': round.status === 'finished'
                      }"
                    >
                      {{ statusLabel(round.status) }}
                    </span>
                  </div>
                  <p class="text-xs text-slate-500 mt-0.5">
                    Začátek: <span class="text-slate-400">{{ round.start_date }}</span> ·
                    Délka tahu: <span class="text-slate-400">{{ round.turn_length_days }} dní</span> ·
                    Hráčů: <span class="text-slate-400">{{ round.player_count }}</span> ·
                    Tah: <span class="text-slate-400">{{ round.current_turn }}</span>
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <NuxtLink :to="`/game/leaderboard?round=${round.id}`" target="_blank">
                  <UButton size="sm" variant="ghost" color="neutral" icon="i-lucide-trophy" title="Žebříček">
                    Žebříček
                  </UButton>
                </NuxtLink>
                <UButton
                  v-if="round.status !== 'finished'"
                  size="sm"
                  variant="soft"
                  color="primary"
                  icon="i-lucide-skip-forward"
                  :loading="advancingId === round.id"
                  @click="advanceTurn(round.id)"
                >
                  {{ round.status === 'setup' ? 'Spustit hru' : 'Další tah' }}
                </UButton>
                <UButton
                  v-if="round.status === 'active'"
                  size="sm"
                  variant="soft"
                  color="error"
                  icon="i-lucide-flag"
                  :loading="finishingId === round.id"
                  @click="finishRound(round.id, round.name)"
                >
                  Ukončit
                </UButton>
              </div>
            </div>

            <!-- Players table within round -->
            <div v-if="roundDetails[round.id]" class="p-4">
              <table class="w-full text-sm">
                <thead>
                  <tr class="text-left text-xs text-slate-500 uppercase tracking-wider">
                    <th class="pb-2 pr-4">Hráč</th>
                    <th class="pb-2 pr-4">PIN</th>
                    <th class="pb-2 pr-4 text-right">Hotovost</th>
                    <th class="pb-2 pr-4 text-right">Akcie</th>
                    <th class="pb-2 text-right">Celkem</th>
                    <th class="pb-2 text-right">Zisk/Ztráta</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/60">
                  <tr v-for="(p, idx) in roundDetails[round.id].players" :key="p.id" class="group">
                    <td class="py-2.5 pr-4">
                      <div class="flex items-center gap-2">
                        <span class="text-xs font-bold text-slate-600 w-5">{{ idx + 1 }}</span>
                        <span class="font-medium text-white">{{ p.name }}</span>
                      </div>
                    </td>
                    <td class="py-2.5 pr-4">
                      <code class="text-xs bg-slate-800 text-yellow-400 px-2 py-0.5 rounded font-mono">{{ getPinForPlayer(round.id, p.id) ?? '••••' }}</code>
                    </td>
                    <td class="py-2.5 pr-4 text-right text-slate-300 font-mono text-xs">
                      {{ fmt(p.cash) }}
                    </td>
                    <td class="py-2.5 pr-4 text-right text-slate-300 font-mono text-xs">
                      {{ fmt(p.holdings_value) }}
                    </td>
                    <td class="py-2.5 text-right font-bold text-white font-mono text-xs">
                      {{ fmt(p.total_value) }}
                    </td>
                    <td class="py-2.5 text-right font-mono text-xs" :class="p.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'">
                      {{ p.profit >= 0 ? '+' : '' }}{{ fmt(p.profit) }}
                      <span class="text-[10px] ml-1">({{ p.profit_percent.toFixed(1) }}%)</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="p-4 text-center">
              <UButton size="xs" variant="ghost" color="neutral" @click="loadRoundDetails(round.id)">
                Zobrazit hráče
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Round Modal -->
    <UModal v-model:open="showCreateModal" :ui="{ content: 'bg-slate-900 border border-slate-700 max-w-xl w-full' }">
      <template #content>
        <div class="p-6 space-y-5">
          <div>
            <h2 class="text-xl font-bold text-white">Nové herní kolo</h2>
            <p class="text-sm text-slate-400 mt-1">Vyplňte parametry a přidejte hráče</p>
          </div>

          <UFormField label="Název kola" name="name">
            <UInput v-model="form.name" placeholder="např. Kolo 1 – Začátečníci" class="w-full" />
          </UFormField>

          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Datum začátku" name="start_date" description="Kde v historii dat začneme">
              <UInput v-model="form.start_date" type="date" min="1962-01-02" max="2018-01-01" class="w-full" />
            </UFormField>
            <UFormField label="Délka tahu (dní)" name="turn_length_days" description="Kolik dní přeskočí každý tah">
              <UInput v-model="form.turn_length_days" type="number" min="1" max="365" class="w-full" />
            </UFormField>
          </div>

          <!-- Players -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <label class="text-sm font-medium text-slate-300">Hráči</label>
              <UButton size="xs" variant="ghost" color="primary" icon="i-lucide-user-plus" @click="addPlayer">
                Přidat hráče
              </UButton>
            </div>
            <div class="space-y-2">
              <div v-for="(p, idx) in form.players" :key="idx" class="flex items-center gap-2">
                <UInput v-model="p.name" placeholder="Jméno hráče" class="flex-1" />
                <UInput v-model.number="p.starting_money" type="number" min="100" placeholder="Kapitál ($)" class="w-36" />
                <UButton
                  v-if="form.players.length > 1"
                  size="xs"
                  variant="ghost"
                  color="error"
                  icon="i-lucide-x"
                  @click="removePlayer(idx)"
                />
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <UButton variant="ghost" color="neutral" @click="showCreateModal = false">
              Zrušit
            </UButton>
            <UButton color="primary" icon="i-lucide-check" :loading="creating" @click="createRound">
              Vytvořit kolo
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <!-- PIN reveal modal (shown after creation) -->
    <UModal v-model:open="showPinModal" :ui="{ content: 'bg-slate-900 border border-slate-700 max-w-lg w-full' }">
      <template #content>
        <div class="p-6 space-y-4">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-key-round" class="h-6 w-6 text-yellow-400" />
            <h2 class="text-xl font-bold text-white">PINy hráčů</h2>
          </div>
          <p class="text-sm text-slate-400">
            Sdělte hráčům jejich PINy. Po zavření tohoto okna PINy nejsou zobrazeny (jsou ale viditelné v tabulce kola).
          </p>
          <div class="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-slate-900/60 text-xs text-slate-500 uppercase tracking-wider">
                  <th class="text-left px-4 py-2">Hráč</th>
                  <th class="text-left px-4 py-2">PIN</th>
                  <th class="text-right px-4 py-2">Kapitál</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60">
                <tr v-for="p in createdPlayers" :key="p.name">
                  <td class="px-4 py-3 font-medium text-white">{{ p.name }}</td>
                  <td class="px-4 py-3">
                    <code class="text-yellow-400 font-mono text-lg font-bold tracking-widest">{{ p.pin }}</code>
                  </td>
                  <td class="px-4 py-3 text-right text-slate-300 font-mono text-xs">
                    {{ fmt(p.starting_money) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="flex justify-end">
            <UButton color="primary" icon="i-lucide-check" @click="showPinModal = false">
              Rozumím, zavřít
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Akciová Hra — Správa',
  description: 'Administrace herních kol – vytváření kol, správa hráčů a tahů'
})

const toast = useToast()

// Rounds data
const { data: roundsData, pending: roundsPending, refresh: refreshRounds } = await useFetch<any>('/api/game/rounds', { lazy: true })
const rounds = computed<any[]>(() => roundsData.value?.data ?? [])

// Per-round details cache
const roundDetails = ref<Record<number, any>>({})
// PIN cache (only available right after creation)
const pinCache = ref<Record<number, Record<number, string>>>({})

async function loadRoundDetails(roundId: number) {
  const res = await $fetch<any>(`/api/game/rounds/${roundId}`)
  if (res.success) {
    roundDetails.value[roundId] = res.data
  }
}

function getPinForPlayer(roundId: number, playerId: number) {
  return pinCache.value[roundId]?.[playerId]
}

// Auto-load details for all rounds
watch(rounds, async (newRounds) => {
  for (const r of newRounds) {
    await loadRoundDetails(r.id)
  }
}, { immediate: true })

// Turn advancement
const advancingId = ref<number | null>(null)
async function advanceTurn(roundId: number) {
  advancingId.value = roundId
  try {
    const res = await $fetch<any>(`/api/game/rounds/${roundId}/advance`, { method: 'POST' })
    if (res.success) {
      toast.add({ title: res.message, color: 'success' })
      await refreshRounds()
      await loadRoundDetails(roundId)
    }
  } catch (e: any) {
    toast.add({ title: e.data?.statusMessage ?? 'Chyba', color: 'error' })
  } finally {
    advancingId.value = null
  }
}

const finishingId = ref<number | null>(null)
async function finishRound(roundId: number, name: string) {
  if (!confirm(`Opravdu ukončit kolo "${name}"? Hráči nebudou moci dále obchodovat.`)) return
  finishingId.value = roundId
  try {
    const res = await $fetch<any>(`/api/game/rounds/${roundId}/finish`, { method: 'POST' })
    if (res.success) {
      toast.add({ title: 'Kolo ukončeno', color: 'success' })
      await refreshRounds()
    }
  } catch (e: any) {
    toast.add({ title: e.data?.statusMessage ?? 'Chyba', color: 'error' })
  } finally {
    finishingId.value = null
  }
}

// Create round modal
const showCreateModal = ref(false)
const creating = ref(false)
const form = ref({
  name: '',
  start_date: '2010-01-04',
  turn_length_days: 30,
  players: [
    { name: '', starting_money: 10000 },
    { name: '', starting_money: 10000 }
  ]
})

function addPlayer() {
  form.value.players.push({ name: '', starting_money: 10000 })
}
function removePlayer(idx: number) {
  form.value.players.splice(idx, 1)
}

// PIN reveal state
const showPinModal = ref(false)
const createdPlayers = ref<any[]>([])

async function createRound() {
  if (!form.value.name.trim()) {
    toast.add({ title: 'Zadejte název kola', color: 'error' })
    return
  }
  const validPlayers = form.value.players.filter(p => p.name.trim())
  if (!validPlayers.length) {
    toast.add({ title: 'Přidejte alespoň jednoho hráče', color: 'error' })
    return
  }

  creating.value = true
  try {
    const res = await $fetch<any>('/api/game/rounds', {
      method: 'POST',
      body: {
        name: form.value.name.trim(),
        start_date: form.value.start_date,
        turn_length_days: Number(form.value.turn_length_days),
        players: validPlayers
      }
    })

    if (res.success) {
      // Store PINs in local cache
      const newRoundId = res.round.id
      pinCache.value[newRoundId] = {}
      createdPlayers.value = res.players.map((p: any) => ({
        ...p,
        starting_money: validPlayers.find(vp => vp.name.trim() === p.name)?.starting_money ?? 0
      }))
      for (const p of res.players) {
        pinCache.value[newRoundId][p.id] = p.pin
      }

      showCreateModal.value = false
      showPinModal.value = true

      // Reset form
      form.value = {
        name: '',
        start_date: '2010-01-04',
        turn_length_days: 30,
        players: [
          { name: '', starting_money: 10000 },
          { name: '', starting_money: 10000 }
        ]
      }

      await refreshRounds()
      await loadRoundDetails(newRoundId)
    }
  } catch (e: any) {
    toast.add({ title: e.data?.statusMessage ?? 'Chyba při vytváření kola', color: 'error' })
  } finally {
    creating.value = false
  }
}

function fmt(val: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)
}

function statusLabel(status: string) {
  if (status === 'setup') return 'Příprava'
  if (status === 'active') return 'Aktivní'
  if (status === 'finished') return 'Ukončeno'
  return status
}
</script>
