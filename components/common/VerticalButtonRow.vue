<template lang="pug">
  .VerticalButtonRow.flex
    button.mat-btn.btn.no-shadow(
      v-for="(btn, i) of btns"
      :id="btn.id"
      :class="[btn.className, customClassName(i), btn.active && 'active']"
      @click="btn.event"
    )
      span {{ btn.label }}

</template>

<script>
export default {
  name: 'VerticalButtonRow',
  props: {
    btns: {
      type: Array,
      default: () => ([])
    }
  },
  methods: {
    /**
     * 第二排開始不需要 border-top
     * 第二排開始第一個按鈕都要補上 border-right
     */
    customClassName(i) {
      let className = ''
      if ((i % 7 === 0) && (i !== 0))
        className += 'border-left'
      if (i >= 7)
        className += ' no-border-top'
      return className
    },
  },
}
</script>

<style lang="stylus" scoped>

  .VerticalButtonRow
    width 100%
    height 4rem
    flex-wrap wrap
    overflow-x hidden
    overflow-y auto
    hiddenScrollBar()
    .btn
      width calc(100%/7)
      height 2rem
      padding .125rem 0
      &.border-left
        border-left 3px solid #000
      &.no-border-top
        border-top none

</style>