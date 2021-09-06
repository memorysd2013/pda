<template lang="pug">
  .CaseCardLayout.flex.column
    template(v-for="(col, key) in layout")
      .col(v-if="!col.hidden")
        span.mar(v-if="col.label") {{ col.label }}:
        i.icon(v-if="col.icon" :class="col.icon")

        template(v-if="col.type === 'phone'")
          a.underline.bold.mar(:href="`tel:${col.value.replace(/#.*/, '')}`" @click.stop) {{ col.value }}
          span {{ col.name }}

        template(v-else-if="col.type === 'address'")
          span.underline(@click.stop="openGoogleMap(col.value)") {{ col.value }}

        template(v-else-if="key === 'customer'")
          span.bold.mar {{ col.cutomer }}
          span.bold.customer {{ col.destination }}

        template(v-else-if="key === 'specified_time'")
          span.bold.mar {{ col.date }}
          span {{ col.notes }}

        template(v-else-if="key === 'lastProcessDivide'")
          .divideText
            span {{ col.text }}

        template(v-else)
          span {{ col.value }}

</template>

<script>
export default {
  name: 'CaseCardLayout',
  props: {
    layout: Object,
  },

  methods: {
    /**
     * 
     */
    openGoogleMap(addr) {
      try {
        let url = `https://www.google.com/maps/search/?api=1&query=${addr}`
          , uri = encodeURI(url)
        window.open(uri, '_blank')
      } catch (e) {
        this.$message({ type: 'warning', message: `地址轉換錯誤，請檢查地址是否正確。encode error: ${e}` })
      }
    }
  }
}
</script>

<style lang="stylus" scoped>

  .CaseCardLayout
    .col
      & + .col
        margin-top .25rem

      .mar
        margin-right .5rem

      .icon
        margin 0 .5rem

      .bold
        font-weight bold

      .customer
        color main_c

      .underline
        text-decoration underline

      .divideText
        border-top 2px solid #000
        padding-top .25rem
        font-weight bold

</style>