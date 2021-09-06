<template lang="pug">
  .DialogContainer(:class="[show && 'show']")
    .header
    .body(:class="type")
      slot(name="body")

</template>

<script>
import { lockScreen } from '@/methods/'

export default {
  name: 'Dialog',
  props: {
    show: Boolean,
    type: {
      type: String,
      default: 'white'
    },
  },
  watch: {
    show: {
      handler(newVal) {
        // 打開組件時不讓畫面滑動
        lockScreen({ lock: newVal })
      }
    }
  },
}
</script>

<style lang="stylus" scoped>

  .DialogContainer
    position fixed
    top 0
    left 0
    z-index dialog_z
    width 100%
    transform translateY(- 100vh)
    transition transform .3s
    &.show
      transform translateY(0)

    .header
      width 100%
      height header_h
      background-color #f4f4f4
      opacity .2

    .body
      padding .5rem
      height dialog_h
      &.white
        border 5px solid #fff
        background-color #fff
      &.gray
        border 5px solid dialog_border_c
        background-color dialog_bg_c

</style>