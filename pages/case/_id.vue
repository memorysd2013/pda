<template lang="pug">
  .CaseDetail(v-if="readyRender")
    CaseCard(:data="currentCase" mode="detail" :maxHeight="300")

    .form.flex.column
      template(v-for="(col, key) in form")
        .col.flex.v-center(v-if="!col.hidden")
          span.label(v-if="col.outsideLabel") {{ col.outsideLabel }}:
          Operator(:oCol.sync="col" :key="key" @update="update($event, key)")

      .reasonBtn(v-if="caseStatus === 'unfinished'")
        button.mat-btn.btn(@click="toggleSelectReasonDialog") 選擇原因

    .batchBtn
      button.mat-btn.btn(@click="toggleBatchSelectDialog") 批次多筆

    .batchSelectCase(v-if="hasBatchModel")
      span.customerName {{ batchCol.label }}
      .batchSelectList.flex.column
        span.docId {{ docId + ', ' + (currentCase.FromContactName || '') }}
        span.docId(v-for="m in batchCol.model") {{ selectedBatchDisplay(m) }}

    //- 未能完成 選擇原因
    OperatorDialog(:show.sync="isShowReasonSelector" :col.sync="failedReasonCol" title="選擇原因")
      template(#btns)
        button.mat-btn.full.medium(@click="toggleSelectReasonDialog") 關閉

    //- 批次多筆
    OperatorDialog(:show.sync="isShowBatchSelector" :col.sync="batchCol")
      template(#btns)
        button.mat-btn.medium.batchDialogBtn(@click="selectBatch") 選擇
        button.mat-btn.medium.batchDialogBtn(@click="closeBatch") 關閉
      template(#empty)
        span(v-if="emptyText") {{ emptyText }}

</template>

<script>
import { form, failedReasonCol, batchCol } from './CaseDetailPage.data'
import { storeRequest } from '@/methods/idb'
import OperatorDialog from '@/components/dialog/OperatorDialog'
import { delay } from '@/methods/'
import _ from 'lodash'

export default {
  name: 'CaseDetailPage',
  components: {
    OperatorDialog,
  },
  data() {
    return {
      readyRender: false,

      form: _.cloneDeep(form),

      isShowReasonSelector: false,
      failedReasonCol: _.cloneDeep(failedReasonCol),

      isShowBatchSelector: false,
      batchCol: _.cloneDeep(batchCol),
      // 若關閉批次選擇則返回暫存內容, 若按下選擇則更新暫存內容
      tempBatchCol: {},
    }
  },
  computed: {
    docId() {
      return this.$route?.params?.id
    },
    currentCase() {
      return this.$store.state.Case.currentCase
    },
    caseType() {
      return this.currentCase?.InOut
    },
    caseList() {
      return this.$store.state.Case.caseList
    },
    caseStatus() {
      return this.form.finished.model
    },
    emptyText() {
      return this.hasBatchOptions ? '' : '無其他案件可選擇'
    },
    hasBatchOptions() {
      return this.batchCol?.options?.length
    },
    hasBatchModel() {
      return this.batchCol?.model?.length
    },
    saveTriggerKey() {
      return this.$store.state.Case.saveTriggerKey
    },
    completeTriggerKey() {
      return this.$store.state.Case.completeTriggerKey
    },
    signTriggerKey() {
      return this.$store.state.Case.signTriggerKey
    },
    signFile() {
      return this.$store.state.Dialog.signFile
    },
  },
  watch: {
    failedReasonCol: {
      deep: true,
      handler(newVal) {
        // 選擇未能完成原因後 寫入失敗原因欄位
        if (newVal?.model)
          this.form.reason.model = newVal.model
      }
    },
    caseStatus: {
      handler(newVal) {
        // 選擇完成狀態時, 若為順利完成則隱藏失敗原因欄位
        this.form.reason.hidden = newVal !== 'unfinished'
        // 選擇完成狀態時, 才開放簽名按鈕
        this.$store.commit('Footer/setFooterDisabled', { key: 'sign', boolean: !(newVal === 'finished') })
      }
    },
    saveTriggerKey(newVal) {
      if (newVal)
        this.beforeCaseSave()
    },
    completeTriggerKey(newVal) {
      if (newVal)
        this.createCaseCompleteRecord()
    },
    signTriggerKey(newVal) {
      if (newVal)
        this.beforeCaseSign()
    },
  },

  mounted() {
    this.init()
    this.setScrollTarget('')
  },

  methods: {
    /**
     * 根據 id 取得案件
     *  - 根據案件類型設定 footer
     * 根據公司名稱從列表找出相同公司名稱的案件作為批次篩選選單
     */
    async init() {
      let response = await this.getDocById()
      if (!response) {
        this.$message({ message: '取得案件失敗, 請稍後再試', })
        return this.$router.push({ path: '/' })
      }
      this.setFooter()
      this.setBatchOptions()
      this.readyRender = true
    },

    /**
     * 
     */
    async getDocById() {
      let params = { DocId: this.docId }
        , response = await this.$store.dispatch('Case/getCaseById', { params, option: {} })
      return response?.isSucceed
    },

    /**
     * 要等資料取回才能判斷 footer
     */
    setFooter() {
      let type = this.currentCase?.InOut
        , pageName = type === 'I' ? 'detail_retrieve' : 'detail_deliver'
      this.$store.commit('Footer/setFooterByPage', pageName)
    },

    /**
     * 篩選批次選擇選項
     *  - 篩選同公司名稱、同案件類型、與當前案件不同 DocId
     *  - 案件為送件時 (O), 篩選「收件公司」 (ToCustomerName)
     *    案件為收件時 (I), 篩選「送件公司」 (FromCustomerName)
     */
    setBatchOptions() {
      let { DocId, InOut, ToCustomerName, FromCustomerName } = this.currentCase
        , filterCompany = InOut === 'O' ? ToCustomerName : FromCustomerName
        , filterList = this.caseList.filter(c => c.CustomerName === filterCompany && c.InOut === InOut && c.DocId !== DocId)
        , options = filterList.map(f => ({ label: `${f.DocId}, ${f.ContactName}`, value: f.DocId }))

      if (options.length) {
        this.batchCol.label = filterCompany
        this.batchCol.options = options
        this.tempBatchCol = _.cloneDeep(this.batchCol)
      }
    },

    /**
     * 開啟選擇未能完成原因
     */
    toggleSelectReasonDialog() {
      this.isShowReasonSelector = !this.isShowReasonSelector
    },

    /**
     * 開啟批次多筆
     */
    toggleBatchSelectDialog() {
      this.isShowBatchSelector = !this.isShowBatchSelector
    },

    /**
     * 選擇批次多筆
     *  - 更新暫存內容
     *  - 判斷 Footer 指定結案是否開放
     */
    selectBatch() {
      this.toggleBatchSelectDialog()
      if (this.hasBatchOptions) {
        this.tempBatchCol = _.cloneDeep(this.batchCol)
        this.detectCaseCloseFeature()
      }
    },

    /**
     * 關閉批次多筆
     *  - 以暫存內容覆蓋當前選擇的批次多筆
     */
    closeBatch() {
      this.toggleBatchSelectDialog()
      if (this.hasBatchOptions)
        this.batchCol = _.cloneDeep(this.tempBatchCol)
    },

    /**
     * 若有選擇批次多筆案件, 則關閉指定結案功能
     */
    detectCaseCloseFeature() {
      let boolean = this.hasBatchModel
      this.$store.commit('Footer/setFooterDisabled', { key: 'case_close', boolean })
    },

    /**
     * 建立案件指定結案
     *  - 指定結案之前需要選擇是否完成及填寫備註
     */
    async createCaseCompleteRecord() {
      let isRequireFinished = this.checkRequired({ checkNotes: true })
      if (!isRequireFinished) return

      let ActionName = '指定結案'
        , Remark = this.getRemark()
        , ProcessDetail = this.generateProcessDetail({ ActionName, Remark })
        , params = { DocId: this.docId, ProcessDetail }

      if (navigator.onLine) {
        let response = await this.$store.dispatch('Case/createCaseCompleteRecord', { params, option: {} })
        if (response.isSucceed && response?.data?.DocId)
          this.actionSucceedBackToIndex()
      }
      else
        await storeRequest('complete', params)
    },

    /**
     * 執行案件存檔前, 判斷是否有批次多筆資料
     *  - 存檔之前需要選擇是否完成
     */
    async beforeCaseSave() {
      let isRequireFinished = this.checkRequired({})
      if (!isRequireFinished) return

      if (this.hasBatchModel) {
        let ids = _.cloneDeep(this.batchCol.model)
        ids.push(this.docId)
        let queueRes = await this.queueApi(ids, 'createCaseSaveRecord')
        if (queueRes)
          this.actionSucceedBackToIndex()
      }
      else {
        let response = await this.createCaseSaveRecord({ DocId: this.docId })
        if (response)
          this.actionSucceedBackToIndex()
      }
    },

    /**
     * 建立案件存檔
     */
    async createCaseSaveRecord({ DocId, option = {} }) {
      let ActionName = this.caseType === 'O' ? '送件存檔' : '取件存檔'
        , Remark = this.getRemark()
        , ProcessDetail = this.generateProcessDetail({ ActionName, Remark })
        , params = { DocId, ProcessDetail }

      if (navigator.onLine) {
        let response = await this.$store.dispatch('Case/createCaseSaveRecord', { params, option })
        return response.isSucceed && response?.data?.DocId
      }
      else {
        await storeRequest('save', params)
        return false
      }
    },

    /**
     * 執行簽名存檔前, 判斷是否有批次多筆資料
     *  - 簽名之前需要選擇是否完成
     */
    async beforeCaseSign() {
      let isRequireFinished = this.checkRequired({})
      if (!isRequireFinished) return

      if (this.hasBatchModel) {
        let ids = _.cloneDeep(this.batchCol.model)
        ids.push(this.docId)
        let queueRes = await this.queueApi(ids, 'createCaseSignRecord')
        if (queueRes)
          this.actionSucceedBackToIndex()
      }
      else {
        let response = await this.createCaseSignRecord({ DocId: this.docId })
        if (response)
          this.actionSucceedBackToIndex()
      }
    },

    /**
     * 建立案件簽名
     */
    async createCaseSignRecord({ DocId, option = {} }) {
      let ActionName = this.caseType === 'O' ? '送件簽名' : '取件簽名'
        , ProcessDetail = this.generateProcessDetail({ ActionName, Remark: '' })
        , SignImage = this.signFile
        , params = { DocId, ProcessDetail: { ...ProcessDetail, SignImage } }

      if (navigator.onLine) {
        let response = await this.$store.dispatch('Case/createCaseSignRecord', { params, option })
        return response.isSucceed && response?.data?.DocId
      }
      else {
        await storeRequest('sign', params)
        return false
      }
    },

    // ============== SUPPORT ==============
    // 外層用 v-for 渲染不知道為什麼 sync/update:col 不起作用, 所以另外寫 emit 事件強制更新
    update(col, key) {
      this.form[key] = col
    },

    // 批次選擇顯示
    selectedBatchDisplay(m) {
      let target = this.batchCol.options.find(b => b.value === m)
      return target.label
    },

    // 如果選擇順利完成則回傳備註, 若未能完成則將失敗原因與備註合併回傳
    getRemark() {
      let notes = this.form.notes.model
        , reason = this.form.reason.model
      return this.caseStatus === 'unfinished' ? `${reason}\n${notes}` : notes
    },

    // 生成紀錄所需資訊
    generateProcessDetail({ ActionName, Remark }) {
      let userInfo = this.$store.getters['Case/generateUserInfo']()
        , Completed = ''
      if (this.caseStatus)
        Completed = this.caseStatus === 'finished' ? 'Y' : 'N'
      return { ...userInfo, ActionName, Remark, Completed }
    },

    // 執行批次 api function
    async queueApi(ids, callback) {
      let index = 0
        , result = []
      for await (let id of ids) {
        let option = { keepLoading: (index + 1) !== ids.length }
          , response = await this[callback]({ DocId: id, option })
        result.push(response)
        await delay(500)
        index++
      }
      return result.every(r => r)
    },

    // 檢查欄位必填：checkFinished 檢查完成欄位, checkNotes 檢查備註欄位
    checkRequired({ checkFinished = true, checkNotes = false }) {
      let notes = this.form.notes.model
        , finished = this.form.finished.model
      if (checkFinished && !finished) {
        this.$message({ type: 'warning', message: '請先選擇是否完成再執行動作' })
        return false
      }
      if (checkNotes && !notes) {
        this.$message({ type: 'warning', message: '請先填寫備註再執行動作' })
        return false
      }
      return true
    },

    /**
     * 設置卡片滑動目標
     */
    setScrollTarget(id) {
      this.$store.commit('Case/setScrollTarget', id)
    },

    /**
     * 操作完成並返回列表
     *  - 儲存 scrollTarget
     */
    actionSucceedBackToIndex() {
      this.setScrollTarget(this.docId)
      this.$router.push({ path: '/' })
    },
  }
}
</script>

<style lang="stylus" scoped>

  .CaseDetail
    pageContainer()
    .form
      position relative
      padding .75rem .25rem
      .col
        .label
          width 84px
          flex 0 0 auto
        & + .col
          margin-top .75rem
      
      .reasonBtn
        position absolute
        right 2rem
        top .5rem

    .reasonBtn, .batchBtn
      .btn
        padding .125rem 0
        width 90px
    
    .batchDialogBtn
      width 50%

    .batchSelectCase
      padding .75rem .5rem
      setTextStyle(1rem, 500, #000)
      .customerName
      .batchSelectList
        margin-top .5rem
        height 100px
        overflow-y auto
        hiddenScrollBar()

</style>