<script setup lang="ts">
/**
 * 階段三 D-16：只有**版面**做了三語，`content/` 底下的 changelog 與 docs
 * 仍是 zh-TW。
 *
 * 這裡刻意選擇「顯示原文 + 明講它是原文」，而不是隱藏或機翻：
 *  - 隱藏 ⇒ 英文讀者連 v3.7.1 改了什麼都看不到
 *  - 機翻 ⇒ 一年十幾次發版，每次都要維護三份，而且錯譯的是技術細節
 *
 * 非 zh-TW 語系才渲染。
 */
const { locale } = useI18n()
</script>

<template>
  <div v-if="locale !== 'zh-TW'" class="notice notice-info" lang="en">
    <span class="icon icon--lang text-brand shrink-0 mt-1" aria-hidden="true" />
    <div class="notice-body">
      <strong class="text-ink-900 font-bold block mb-1">{{ $t('common.contentZhOnly.title') }}</strong>
      <p class="text-sm text-ink-700">{{ $t('common.contentZhOnly.body') }}</p>
    </div>
  </div>
</template>
