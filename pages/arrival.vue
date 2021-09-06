<template lang="pug">
  .arrival
    .feature
      CaseStatusSeletor(v-model="status" disableClick)
        template(#pageName)
          span {{ '貨到廠' }}
      .site.flex.v-center
        span.title 廠區：
        span.siteValue {{ siteText }}
        i.fas.fa-times.clearBtn(v-if="siteText" @click="currentSite = ''")
      ScanBar(:key="scanUpdateKey" @enter="enter" clearBtn)
      ListSummary(:list="list")
    
    .cardContainer
      CaseList(:list="list" :option="option")

</template>

<script>
import { storeRequest } from '@/methods/idb'

export default {
  name: 'arrival',
  data() {
    return {
      option: {
        action: '已到廠'
      },

      list: [],

      currentSite: '',

      scanUpdateKey: 0,
    }
  },
  computed: {
    siteList() {
      return this.$store.state.System.siteList
    },
    siteListValues() {
      return this.siteList.map(s => s.SiteValue)
    },
    siteText() {
      let site = this.siteList.find(s => s.SiteValue === this.currentSite)
      return site?.SiteText || ''
    },
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
    init() {
      this.$store.commit('Footer/setFooterByPage', 'index')
      this.$store.commit('Footer/setFooterActive', 'arrival')
    },

    /**
     * 掃描流程：
     *  - 先掃描廠區, 若沒有出現與當前廠區清單匹配的值則跳出提示
     */
    enter({ value }) {
      if (!value)
        return this.$message({ type: 'warning', message: '請輸入 id 或掃描 QR code' })
      if (!this.currentSite)
        return this.detectAndSetSite(value)
      else
        return this.createCaseArrivalRecord(value)
    },

    /**
     * 檢查是否匹配當前廠區
     */
    detectAndSetSite(value) {
      let isSiteExist = this.siteListValues.includes(value)
      if (isSiteExist) {
        this.currentSite = value
        this.scanUpdateKey++
      }
      else
        this.$message({ type: 'warning', message: '無匹配廠區，請重新掃描' })
    },

    /**
     * 建立貨到廠紀錄
     */
    async createCaseArrivalRecord(value) {
      let ProcessDetail = this.generateProcessDetail()
        , params = { DocId: value, ProcessDetail }

      if (navigator.onLine) {
        let response = await this.$store.dispatch('Case/createCaseArrivalRecord', { params, option: {} })
        if (response.isSucceed && response?.data?.DocId)
          this.list.push(response.data)
      }
      else
        await storeRequest('onlab', params)
    },

    /**
     * 生成紀錄所需資訊
     */
    generateProcessDetail() {
      let userInfo = this.$store.getters['Case/generateUserInfo']()
      return {
        ...userInfo,
        ActionName: "貨到廠存檔",
        LabName: this.siteText,
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

  .arrival
    pageContainer()
    indexPageSetting()

    .feature
      .site
        width 100%
        height placeholder_h
        .clearBtn, .title
          flex 0 0 auto
        .siteValue
          setTextStyle(1.25rem, 500, #000)
        .clearBtn
          font-size 20px
          padding 0 .5rem
          margin .5rem
    
    .cardContainer
      overflow-y auto
      max-height 'calc(100vh - %s - %s - %s - %s)' % (header_h footer_h feature_h page_padding_h)
      hiddenScrollBar()
      &.loading
        overflow-y hidden
      .empty
        font-weight bold

</style>