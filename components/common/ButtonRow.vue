<template lang="pug">
  .ButtonRow.flex.v-center
    button.mat-btn.btn(v-for="(btn, i) of btns" :key="i" :id="btn.id" :class="[btn.className, btn.active && 'active']" @click="btn.event")
      span {{ btn.label }}

</template>

<script>
export default {
  name: 'ButtonRow',
  props: {
    btns: {
      type: Array,
      default: () => ([])
    }
  },
}
</script>

<style lang="stylus" scoped>
  .ButtonRow
    .btn
      flex 0 0 auto

</style>
