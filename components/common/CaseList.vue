<template lang="pug">
  .CaseList(ref="CaseList")
    template(v-for="(d, index) in list")
      CaseCard(
        :data="d"
        :index="index"
        :option="option"
        :key="`${index}_${d.DocId}_${updateKey}`"
        @cardClick="cardClick"
      )

    template(v-if="!list.length")
      span.empty {{ emptyText }}
    
    template(v-if="loading")
      LoadingDot

</template>

<script>
import LoadingDot from '@/components/unit/LoadingDot'

export default {
  name: 'CaseList',
  components: {
    LoadingDot,
  },
  props: {
    list: {
      type: Array,
      default: () => ([])
    },
    emptyText: String,
    loading: Boolean,
    option: {
      type: Object,
      default: () => ({})
    },
  },
  data() {
    return {
      updateKey: 0,
    }
  },
  computed: {
    filterLoading() {
      return this.$store.state.Case.filterLoading
    },
  },

  mounted() {
    document.addEventListener('scroll', this.scrollingEvent, true)
  },
  beforeDestroy() {
    document.removeEventListener('scroll', this.scrollingEvent)
  },

  methods: {
    /**
     * 卡片點擊事件
     */
    cardClick(data) {
      let { DocId } = data
      if (DocId)
        this.$router.push({ path: `/case/${DocId}` })
    },

    /**
     * 當組件高度 + footer 高度等於頁面高度時 => 取得上一週列表
     *  - loading 以防多次觸發 api
     */
    scrollingEvent(e) {
      // 列表頁實質上是由 cardContainer 在滑動, 必須判斷當前滑動目標由 cardContainer 包裹才能觸發滾動事件
      let classList = e?.target?.classList
      if (!classList || !Array.from(classList).includes('cardContainer')) return

      if (this.loading) return

      let wrapper = this.$refs['CaseList']
        , innerHeight = window.innerHeight
        , footerH = 50

      if (wrapper) {
        let bottomToWindowTop = wrapper.getBoundingClientRect().bottom
        if ((bottomToWindowTop + footerH) <= innerHeight)
          this.$emit('scrollToEnd')
      }
    },
  }
}
</script>