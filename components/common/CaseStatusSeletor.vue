<template lang="pug">
  .CaseStatusSeletor
    .flex.v-center.between
      .status.flex.v-center
        i.fas.fa-search.icon(@click="toggleSelector")
        span 案件狀態：{{ caseStatus }}

      .pageName
        slot(name="pageName")

    OperatorDialog(:show.sync="isShowSelector" :col.sync="col" title="查詢條件")
      template(#btns)
        button.mat-btn.full.medium(@click="toggleSelector") 關閉

</template>

<script>
import OperatorDialog from '@/components/dialog/OperatorDialog'

export default {
  name: 'CaseStatusSeletor',
  components: {
    OperatorDialog,
  },
  props: {
    value: String,
    disableClick: Boolean,
  },
  data() {
    return {
      isShowSelector: false,

      oldVal: '',

      col: {
        model: '',
        label: '案件狀態:',
        type: 'radio',
        dir: 'column',
        options: [
          { label: '全部', value: 'all' },
          { label: '已完成', value: 'S0104' },
          { label: '未完成', value: 'S0103' },
        ]
      }
    }
  },
  computed: {
    caseStatus() {
      let option = this.col.options.find(o => o.value === this.value)
      return option?.label
    },
    btns() {
      return [
        { label: '關閉', className: 'full', event: this.toggleSelector.bind(this) }
      ]
    },
  },
  watch: {
    col: {
      deep: true,
      handler(newVal) {
        if (newVal?.model)
          this.$emit('input', newVal.model)
      },
    }
  },

  mounted() {
    this.col.model = this.value
    this.oldVal = this.value
  },

  methods: {
    /**
     * 關閉
     */
    toggleSelector() {
      if (this.disableClick) return
      this.isShowSelector = !this.isShowSelector
      if (!this.isShowSelector)
        this.detectAndReloadCaseList()
    },

    /**
     * 檢查 value 是否有改變 (比對 oldVal)
     *  - 如果有改變則需要重取案件列表
     *  - 同步首頁掃描組件的值
     * 同步 oldVal
     */
    detectAndReloadCaseList() {
      if (this.value !== this.oldVal) {
        this.$store.dispatch('Case/reloadCaseListByTimestamp', {})
        this.$store.commit('Case/setScanUpdateKey')
      }

      this.oldVal = this.value
    },
  }
}
</script>

<style lang="stylus" scoped>
  selector_h = 'calc(100vh - %s)' % header_h

  .CaseStatusSeletor
    .status
      .icon
        font-size 2rem
        margin-right .5rem

    .pageName
      setTextStyle(1.25rem, bold, #000)
      padding 0 .5rem

</style>