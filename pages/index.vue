<template lang="pug">
  .index
    .feature
      CaseStatusSeletor(v-model="status")
        template(v-if="pageName" #pageName)
          span {{ pageName }}

      .companyBtn
        .loadingMask(v-if="filterLoading" v-loading="true")
        VerticalButtonRow(:btns="companyFilterBtns")

      ScanBar(:scanUpdateKey="scanUpdateKey" @enter="enter" clearBtn syncStore)
      ListSummary(:list="filterListByQuery" detailMode)

    .cardContainer(v-loading="filterLoading" :class="[filterLoading && 'loading']")
      CaseList(
        emptyText="無符合條件案件"
        :list="filterListByQuery"
        :loading="apiLoading"
        @scrollToEnd="detectAndGetLastWeekList"
      )

</template>

<script>
import config from '@/static/config.json'
import { getDateTimeForApi } from '@/methods/dayjs'
import { delay, scrollToSpecificEl } from '@/methods/'
import _ from 'lodash'
import dayjs from 'dayjs'

export default {
  name: 'index',
  data() {
    return {
      config,

      // 公司分類按鈕
      companyFilterBtns: [],

      apiLoading: false,
    }
  },
  computed: {
    routeQuery() {
      return this.$route.query
    },
    pageName() {
      if (this.routeQuery?.InOut === 'I') return '取件'
      if (this.routeQuery?.InOut === 'O') return '送件'
      return ''
    },
    caseList() {
      return this.$store.state.Case.caseList
    },
    caseQuery() {
      return this.$store.state.Case.query
    },
    filterListByQuery() {
      return this.$store.state.Case.filterListByQuery
    },
    filterLoading() {
      return this.$store.state.Case.filterLoading
    },
    caseListTimestamp() {
      return this.$store.state.Case.caseListTimestamp
    },
    status: {
      get() {
        return this.$store.state.Case.caseStatus
      },
      set(val) {
        this.$store.commit('Case/setCaseStatus', val)
      },
    },
    // 已達到設定檔設定取得 api 資料的日期範圍
    toEnd() {
      let caseListWeeksSetting = this.config?.caseListDurationOfWeek || 12
      return !!(this.caseListTimestamp.length >= caseListWeeksSetting)
    },
    btnUpdateKey() {
      return this.$store.state.Case.btnUpdateKey
    },
    scanUpdateKey() {
      return this.$store.state.Case.scanUpdateKey
    },
    scrollTarget() {
      return this.$store.state.Case.scrollTarget
    },
  },
  watch: {
    routeQuery: {
      deep: true,
      handler(newVal) {
        this.setFooterActive(newVal)
      }
    },
    btnUpdateKey: {
      handler() {
        // 重整 companyFilterBtns active
        this.companyFilterBtns.forEach(btn => btn.active = !btn.key)
      }
    },
  },

  mounted() {
    this.init()
  },

  methods: {
    /**
     * - 設置 url query
     * - 設置 footer
     * - 設置 footer active
     * - 更新掃描組件的值
     * 
     * - 如果有保留時間區間 則取得時間區間內的列表, 沒有則為初始
     * 
     * - 取得列表, 更新渲染列表
     */
    async init() {
      this.setUrlQuery()
      this.$store.commit('Footer/setFooterByPage', 'index')
      this.setFooterActive(this.routeQuery)
      this.$store.commit('Case/setScanUpdateKey')

      if (this.caseListTimestamp?.length) {
        await this.$store.dispatch('Case/reloadCaseListByTimestamp', {})
        this.setCompanyFilterBtns()
      }
      else {
        await this.getCaseList({ date: new Date() })
      }

      this.$nextTick(() => this.scrollToTargetCase())
    },

    setUrlQuery() {
      let { InOut } = this.caseQuery
      if (InOut)
        this.$router.push({ query: { InOut } })
    },

    setFooterActive(query) {
      if (query?.InOut === 'I')
        this.$store.commit('Footer/setFooterActive', 'retrieve')
      else if (query?.InOut === 'O')
        this.$store.commit('Footer/setFooterActive', 'deliver')
      else
        this.$store.commit('Footer/setFooterActive', '')
    },

    /**
     * - 開啟 apiLoading
     * - 取得列表
     *    - 如果沒有資料則不需要重整公司按鈕
     *    - 如果沒有資料則判斷需不需要再取得上週資料, 以防無法滑到底觸發再次發送 api
     *    - updateCaseListWithQuery 取得列表後重新渲染畫面
     */
    async getCaseList({ date }) {
      this.apiLoading = true
      let response = await this._getCaseList(date, { skipLoading: true })
      if (response.isSucceed) {
        // 取得成功但沒有資料, 再取得上週 (加上 toEnd 判斷是為了能關閉 loading)
        if (!response.data.length && !this.toEnd)
          return await this.detectAndGetLastWeekList()

        if (response.data.length) {
          this.setCompanyFilterBtns()
          this.$store.dispatch('Case/updateCaseListWithQuery', {})
        }
      }
      this.$nextTick(() => this.apiLoading = false)
    },

    /**
     * 取得列表
     */
    async _getCaseList(date, option) {
      let params = {
        CaseSearchCriteria: {
          StatusId: this.$store.getters['Case/getCaseStatus'](),
          CreationDTimePeriod: getDateTimeForApi(date)
        }
      }
      return await this.$store.dispatch('Case/getCaseList', { params, option })
    },

    /**
     * 整理出公司分類按鈕
     *  - 嘗試以 hashTable 代替去重試著節省效能
     */
    setCompanyFilterBtns() {
      let firstWordOfCompanys = this.caseList.map(c => c.CustomerName?.[0] || '')
        , btnsHashTable = {}
        , btns = []

      for (let d of firstWordOfCompanys) {
        // 過濾空值 或 已新增過的按鈕
        if (d && !btnsHashTable?.[d]) {
          btns.push({
            label: d, key: d, className: '', id: encodeURI(d).replaceAll('%', ''),
            // 設置 active
            active: this.caseQuery?.CustomerName === d,
            event: this.companyFilter.bind(this, d)
          })
          // 紀錄 hash
          btnsHashTable[d] = true
        }
      }

      // 筆畫排序 (unstable)
      btns.sort((a, b) => a.label.localeCompare(b.label, "zh-Hant"))
      // 設置全選按鈕
      btns.unshift({ label: '＊', active: !this.caseQuery?.CustomerName, key: '', className: '', event: this.companyFilter.bind(this, '') })

      this.companyFilterBtns = btns
      // 滑動至目標按鈕
      this.scrollToTargetButton()
    },

    /**
     * 公司按鈕分類點擊
     * - 重設按鈕的 active
     * - 第一個 delay 確保 filterLoading 先開啟
     * - 第二個 delay 避免切換公司按鈕時觸發列表滑到底事件
     * - 將掃描組件同步 store 的值
     */
    async companyFilter(customerName) {
      this.$store.commit('Case/setFilterLoading', true)
      await delay(300)

      await this.$store.dispatch('Case/setQueryAndUpdateList', { key: 'CustomerName', value: customerName })
      this.companyFilterBtns.forEach(btn => btn.active = this.caseQuery?.CustomerName === btn.key)
      this.$store.commit('Case/setScanUpdateKey')

      await delay(300)
      this.$nextTick(() => this.$store.commit('Case/setFilterLoading', false))
    },

    /**
     * ScanBar 傳出事件
     *  - byScan: 經由掃描觸發, false 則是手動按下輸入
     *    - 經掃描觸發者, 需先篩選條件後再判斷
     */
    async enter({ value, byScan }) {
      if (value && value.length < 4)
        return this.$message({ type: 'warning', message: '輸入 id 不足4碼' })

      if (byScan) {
        let target = this.caseList.find(c => c.DocId === value)
          , { CustomerName, InOut } = this.caseQuery

        this.$store.commit('Case/setFilterListByQuery', target ? [target] : [])

        // 不符合找到案件的狀態的條件 設置回 default 值
        if (target) {
          if (CustomerName && (CustomerName !== target.CustomerName[0])) {
            await this.$store.dispatch('Case/setQuery', { key: 'CustomerName', value: '' })
            this.$store.commit('Case/setBtnUpdateKey')
          }
          if (InOut && (InOut !== target.InOut)) {
            await this.$store.dispatch('Case/setQuery', { key: 'InOut', value: '' })
            this.$router.push({ path: '/' })
          }
        }
      }
      else {
        this.$store.dispatch('Case/setQueryAndUpdateList', { key: 'DocId', value })
      }
    },

    /**
     * 列表滑到底時觸發
     *  - 檢查需不需要再取得上一週資料
     *  - filterLoading: 避免切換公司按鈕時觸發列表滑到底事件
     *  - 若有選擇公司 filter 也不觸發取得上週
     */
    async detectAndGetLastWeekList() {
      if (this.toEnd || this.filterLoading || this.caseQuery?.CustomerName) return

      let lastWeekDate = dayjs(this.caseListTimestamp[0]).subtract(7, 'd')
      await this.getCaseList({ date: lastWeekDate })
    },

    /**
     * 滑動到目標
     *  - 暫存 id 避免未執行完滑動就刪除 target
     */
    scrollToTargetCase() {
      if (this.scrollTarget) {
        let id = `#${this.scrollTarget}`
        setTimeout(() => scrollToSpecificEl(id), 0)
        this.$store.commit('Case/setScrollTarget', '')
      }
    },

    /**
     * 滑動到目標按鈕
     */
    async scrollToTargetButton() {
      if (this.caseQuery?.CustomerName) {
        let id = `#${encodeURI(this.caseQuery.CustomerName).replaceAll('%', '')}`
        setTimeout(() => scrollToSpecificEl(id), 0)
      }
    },
  }
}
</script>

<style lang="stylus" scoped>
  feature_h = 172px
  page_padding_h = .5rem
  // 4rem(組件高度) .25rem(padding)
  company_btn_h = calc(4rem + .5rem)

  .index
    pageContainer()
    indexPageSetting()

    .feature
      height feature_h
      .companyBtn
        padding .25rem 0
        height company_btn_h
        position relative
        .loadingMask
          position absolute !important
          width 100%
          height company_btn_h

    .cardContainer
      overflow-y auto
      max-height 'calc(100vh - %s - %s - %s - %s)' % (header_h footer_h feature_h page_padding_h)
      hiddenScrollBar()
      &.loading
        overflow-y hidden
      .empty
        font-weight bold

</style>