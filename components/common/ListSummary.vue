<template lang="pug">
  .listSummary
    span *筆數: {{ listSummary.total }} 
    span(v-if="detailMode") (完成: {{ listSummary.finished }}) 未完成: {{ listSummary.unfinish }} 急件: {{ listSummary.urgent }} 

</template>

<script>
export default {
  name: 'listSummary',
  props: {
    detailMode: Boolean,
    list: {
      type: Array,
      default: () => ([])
    },
  },
  computed: {
    listSummary() {
      let urgentCases = this.list.filter(c => c?.Urgent === 'Y')
        , finishedCases = this.list.filter(c => c?.Closed === 'Y')
      return {
        total: this.list.length,
        urgent: urgentCases.length,
        finished: finishedCases.length,
        unfinish: this.list.length - finishedCases.length,
      }
    },
  }
}
</script>

<style lang="stylus" scoped>

  .listSummary
    line-height 1.5

</style>