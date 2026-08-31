<script setup lang="ts">
import { TOKENS } from '~/utils/pricing'
import type { SubscribeResult } from '~~/server/api/subscribe.post'

/**
 * F4 —— 全站唯一的 email 收集元件。
 *
 * 背景（README / D20）：v3.3.0 移除自動更新後，email 是使用者得知新版的
 * **唯一管道**，而全站在此之前一個收集欄位都沒有 —— 也就是每發一版都
 * 沒有人會知道。這個元件就是那條管道。
 *
 * `kind` 只決定文案與送給伺服器的分類，**tag 由伺服器決定**
 * （見 server/api/subscribe.post.ts）。
 */
const props = withDefaults(
  defineProps<{
    kind?: 'updates' | 'early-bird' | 'commercial'
    /** card：自帶卡片外框（獨立區塊用）；bare：只有表單本體（嵌在既有卡片裡） */
    variant?: 'card' | 'bare'
  }>(),
  { kind: 'updates', variant: 'card' },
)

const { t } = useI18n()

/** kind 對應到 subscribe.json 的哪一組文案 */
const copyKey = computed(() =>
  ({ 'updates': 'updates', 'early-bird': 'earlyBird', 'commercial': 'commercial' })[props.kind],
)

const email = ref('')
/**
 * 蜜罐。真人看不到也 tab 不到，填了就是機器人。
 *
 * 🔴 **不要把它改回 `company` 之類的語意欄位名**（2026-08-30 改）。
 *    瀏覽器與密碼管理器會自動填 company / organization，而且普遍無視
 *    `autocomplete="off"` —— 被填到的真人會看到「訂閱成功」，名單裡卻沒有他。
 *    那種失敗跟成功長得一模一樣，沒有人會回報，我們也不會知道。
 */
const topic = ref('')
const state = ref<'idle' | 'loading' | SubscribeResult['status']>('idle')

const done = computed(() => state.value === 'ok' || state.value === 'already')

/** 成功訊息在早鳥情境要講「名額以時間戳為準」，與一般訂閱不同 */
const message = computed(() => {
  switch (state.value) {
    case 'loading': return t('subscribe.state.loading')
    case 'ok': return props.kind === 'early-bird'
      ? t('subscribe.state.okEarlyBird')
      : t('subscribe.state.ok')
    case 'already': return t('subscribe.state.already')
    case 'invalid': return t('subscribe.state.invalid')
    case 'blocked': return t('subscribe.state.blocked')
    case 'rateLimited': return t('subscribe.state.rateLimited')
    case 'disabled': return t('subscribe.state.disabled')
    case 'error': return t('subscribe.state.error')
    default: return ''
  }
})

const messageTone = computed(() => {
  if (state.value === 'ok' || state.value === 'already') return 'text-brand'
  if (state.value === 'loading') return 'text-ink-500'
  return 'text-red-500'
})

async function submit() {
  if (state.value === 'loading' || done.value) return
  state.value = 'loading'
  try {
    const res = await $fetch<SubscribeResult>('/api/subscribe', {
      method: 'POST',
      body: { email: email.value, kind: props.kind, topic: topic.value },
      // 422 / 429 / 501 / 502 都帶著可用的 status 回來，不該當成 network error 丟掉
      ignoreResponseError: true,
    })
    state.value = res?.status ?? 'error'
  }
  catch {
    state.value = 'error'
  }
}
</script>

<template>
  <div
    :id="kind === 'early-bird' ? 'early-access' : kind === 'commercial' ? 'commercial' : 'subscribe'"
    :class="[
      'scroll-mt-24',
      variant === 'card'
        ? 'gradient-border-card bg-surface-card rounded-2xl p-8 max-md:p-6 flex flex-col gap-5'
        : 'flex flex-col gap-4',
    ]"
  >
    <div v-if="variant === 'card'" class="flex flex-col gap-2">
      <h2 class="font-sans font-bold text-2xl max-md:text-xl text-ink-900">
        {{ $t(`subscribe.${copyKey}.title`) }}
      </h2>
      <p class="text-ink-700 text-base leading-relaxed">
        {{ $t(`subscribe.${copyKey}.body`, TOKENS) }}
      </p>
    </div>

    <form class="flex flex-col gap-3" novalidate @submit.prevent="submit">
      <div class="flex gap-3 max-sm:flex-col">
        <label class="sr-only" :for="`subscribe-email-${kind}`">{{ $t('subscribe.emailLabel') }}</label>
        <input
          :id="`subscribe-email-${kind}`"
          v-model="email"
          class="flex-1 min-w-0 px-4 py-3.5 rounded-md bg-surface-page border border-line-300 text-ink-900 text-base placeholder:text-ink-500 focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-1 disabled:opacity-60"
          type="email"
          name="email"
          autocomplete="email"
          :placeholder="$t(`subscribe.${copyKey}.placeholder`)"
          :disabled="state === 'loading' || done"
          required
        >

        <!--
          蜜罐。用 `absolute + opacity-0` 而不是 `display:none` ——
          有些機器人會跳過 display:none 的欄位，但填走看得見的。

          🔴 欄位名是刻意選的無語意字 `topic`，見 script 區的說明：
             `company` / `organization` 會被瀏覽器自動填入，把真人誤判成機器人。
        -->
        <div class="absolute w-0 h-0 overflow-hidden opacity-0" aria-hidden="true">
          <input v-model="topic" type="text" name="topic" tabindex="-1" autocomplete="off">
        </div>

        <button
          class="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md bg-brand hover:bg-brand-hover text-white font-sans font-bold text-base transition shadow-btn shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
          type="submit"
          :disabled="state === 'loading' || done"
        >
          {{ $t(`subscribe.${copyKey}.cta`, TOKENS) }}
        </button>
      </div>

      <p
        v-if="message"
        :class="['text-sm font-medium', messageTone]"
        role="status"
        aria-live="polite"
      >
        {{ message }}
      </p>

      <p class="text-ink-500 text-xs leading-relaxed">
        {{ $t('subscribe.privacyNote') }}
      </p>
    </form>
  </div>
</template>
