<script setup lang="ts">
/**
 * F7：`<html lang>` 由當前語系決定，不再全站寫死 `zh-Hant`。
 *
 * `useLocaleHead()` 一併產出 hreflang 互指與 canonical，網址基準取自
 * `i18n.baseUrl`（＝ NUXT_PUBLIC_SITE_URL）。Q10-a 的網域一買到，
 * 改那個環境變數就會全站生效，不必動任何 .vue。
 */
const head = useLocaleHead({ lang: true, dir: true, seo: true })

useHead(() => ({
  htmlAttrs: head.value.htmlAttrs,
  link: head.value.link,
  meta: head.value.meta,
}))
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
