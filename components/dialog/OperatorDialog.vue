<template lang="pug">
  .OperatorDialog
    DialogContainer(:show="show")
      template(#body)
        .selector.flex.column.between
          .container
            h3.title(v-if="title") {{ title }}
            .query
              Operator(:oCol.sync="_col")
            slot(name="empty")

          .btns
            slot(name="btns")

</template>

<script>
/**
 * OperatorDialog: 用於單選組件, 多選組件
 * - not global components, import in local component
 */
export default {
  name: 'OperatorDialog',
  props: {
    show: Boolean,
    title: String,
    col: Object,
  },
  computed: {
    _col: {
      get() {
        return this.col
      },
      set(v) {
        this.$emit('update:col', v)
      }
    }
  },

  methods: {
    /**
     * 
     */
    close() {
      this.$emit('update:show', false)
    }
  }
}
</script>

<style lang="stylus" scoped>

  .OperatorDialog
    .selector
      height 100%
      .container
        overflow-y auto
      
      .title
        setTextStyle(2rem, bold, #000)
        padding .75rem .25rem .25rem 
      .query
        padding 0 1rem
        >>>.operator
          .main
            .label
              font-size 1.25rem
              padding-bottom .25rem
              display inline-block

      .btns
        width 100%
        padding .5rem

</style>