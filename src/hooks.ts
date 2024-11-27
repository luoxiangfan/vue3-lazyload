import type { Ref } from 'vue'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import Lazy from './lazy'
import type { LazyOptions } from './types'

export function useLazyload(src: Ref<string>, options?: LazyOptions): Ref<HTMLElement | null> {
  const lazyRef = ref<HTMLElement | null>(null)
  const lazy = new Lazy(options)

  onMounted(() => {
    lazyRef.value && lazy.mount(lazyRef.value, src.value)
  })

  onUnmounted(() => {
    lazyRef.value && lazy.unmount(lazyRef.value)
  })

  watch(src, (newVal: string) => {
    if (src.value)
      lazy.update(lazyRef.value as HTMLElement, newVal)
  })

  return lazyRef
}
