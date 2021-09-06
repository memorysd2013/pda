<template lang="pug">
  .inventory
    .feature
      CaseStatusSeletor(v-model="status" disableClick)
        template(#pageName)
          span {{ '點貨' }}
      //- 佔位
      .placeholder
      ScanBar(@enter="enter" clearBtn)
      ListSummary(:list="list")
    
    .cardContainer
      CaseList(:list="list" :option="option")

</template>

<script>
import { storeRequest } from '@/methods/idb'

export default {
  name: 'inventory',
  data() {
    return {
      option: {
        action: '已點貨'
      },

      list: [],
    }
  },
  computed: {
    status: {
      get() {
        return this.$store.state.Case.caseStatus
      },
      set(val) {
        this.$store.commit('Case/setCaseStatus', val)
      },
    },
  },

  mounted() {
    this.init()
  },

  methods: {
    /**
     * 
     */
    init() {
      this.$store.commit('Footer/setFooterByPage', 'index')
      this.$store.commit('Footer/setFooterActive', 'inventory')
    },

    /**
     * 掃描傳出事件
     */
    enter({ value }) {
      if (value)
        this.createCaseCheckRecord(value)
      else
        this.$message({ type: 'warning', message: '請輸入 id 或掃描 QR code' })
    },

    /**
     * 建立點貨紀錄
     */
    async createCaseCheckRecord(value) {
      let ProcessDetail = this.generateProcessDetail()
        , params = { DocId: value, ProcessDetail }

      if (navigator.onLine) {
        let response = await this.$store.dispatch('Case/createCaseCheckRecord', { params, option: {} })
        if (response.isSucceed && response?.data?.DocId)
          this.list.push(response.data)
      }
      else
        await storeRequest('check', params)
    },

    /**
     * 生成紀錄所需資訊
     */
    generateProcessDetail() {
      let userInfo = this.$store.getters['Case/generateUserInfo']()
      return {
        ...userInfo,
        ActionName: "點貨存檔",
        Remark: ""
      }
    },
  },
}
</script>

<style lang="stylus" scoped>
  feature_h = 140px
  page_padding_h = .5rem
  placeholder_h = 40px

  .inventory
    pageContainer()
    indexPageSetting()

    .feature
      .placeholder
        width 100%
        height placeholder_h

    .cardContainer
      overflow-y auto
      max-height 'calc(100vh - %s - %s - %s - %s)' % (header_h footer_h feature_h page_padding_h)
      hiddenScrollBar()
      &.loading
        overflow-y hidden
      .empty
        font-weight bold

</style>