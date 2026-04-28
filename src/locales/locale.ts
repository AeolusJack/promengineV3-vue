import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

export const useLocaleStore = defineStore('locale', () => {
  const { locale } = useI18n()
  const currentLocale = ref(locale.value)

  const setLocale = (lang: 'zh' | 'en') => {
    locale.value = lang
    currentLocale.value = lang
    localStorage.setItem('locale', lang)
  }

  watch(locale, (val) => {
    currentLocale.value = val
  })

  return { currentLocale, setLocale }
})