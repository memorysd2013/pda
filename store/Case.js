import { Case } from '@/service'
import { getDateTimeForApi } from '@/methods/dayjs'
import { message, delay } from '@/methods/'
import _ from 'lodash'
import dayjs from 'dayjs'
import config from '@/static/config.json'

const apiFailedRetryInterval = Number(config?.apiFailedRetryInterval) >= 1 ? Number(config.apiFailedRetryInterval) : 1
const apiFailedRetryTimes = Number(config?.apiFailedRetryTimes) >= 0 ? Number(config.apiFailedRetryTimes) : 0
const needRetry = retry => apiFailedRetryTimes > retry
const retryText = retry => retry && apiFailedRetryTimes ? `(${retry}/${apiFailedRetryTimes})` : ''

const state = () => ({
  // 案件列表
  caseList: [],
  // 當前已取得的案件時間戳記
  caseListTimestamp: [],

  // 當前案件詳細資料
  currentCase: {},

  /**
   * 案件狀態: (更換狀態後須重取表單, 所以獨立參數)
   * @params
   *  { S0103: 未完成, S0104: 完成, all: 全部 (送出空值) }
   */
  caseStatus: 'S0103',
  // 自訂篩選條件
  query: {},
  // 經過自訂篩選條件過濾後的列表
  filterListByQuery: [],
  // 用於 filter, 重整時 鎖定列表用
  filterLoading: false,

  // 用於更新列表按鈕狀態
  btnUpdateKey: 0,

  // 更新掃描組件的值
  scanUpdateKey: 0,

  // 觸發存檔、指定結案
  saveTriggerKey: 0,
  completeTriggerKey: 0,
  signTriggerKey: 0,

  // 對案件進行操作回列表時, 將列表滾動拉至該案件
  scrollTarget: '',
})

const mutations = {
  setCaseList: (state, list) => state.caseList = list,
  setCaseListTimestamp: (state, arr) => state.caseListTimestamp = arr,

  setCurrentCase: (state, data) => state.currentCase = data,

  setCaseStatus: (state, status) => state.caseStatus = status,
  setQuery: (state, { key, value }) => {
    if (state.query?.[key])
      state.query[key] = ''
    state.query[key] = value
  },
  clearQuery: state => state.query = {},

  setFilterListByQuery: (state, list) => state.filterListByQuery = list,
  setFilterLoading: (state, boolean) => state.filterLoading = boolean,

  setBtnUpdateKey: state => state.btnUpdateKey++,
  setScanUpdateKey: state => state.scanUpdateKey++,
  setSaveTriggerKey: state => state.saveTriggerKey++,
  setCompleteTriggerKey: state => state.completeTriggerKey++,
  setsignTriggerKey: state => state.signTriggerKey++,

  setScrollTarget: (state, id) => state.scrollTarget = id,
}

const getters = {
  /**
   * 根據 state/query 篩選符合條件的案件 
   * [!] 不可以用二元判斷, 會覆蓋掉其他已篩選的條件
   *  - DocId 只取後四碼做比對
   *  - CustomerName 比對字首
   */
  getCaseListByQuery: state => () => {
    let list = _.cloneDeep(state.caseList)
      , result = list.filter(c => {
        let isApproved = true
        Object.keys(state.query).forEach(key => {
          if (!state.query?.[key] || !isApproved) return
          switch (key) {
            case 'DocId':
              let reg = new RegExp(`(${state.query.DocId})$`)
                , testingReg = reg.test(c?.DocId)
              if (!testingReg)
                isApproved = false
              break
            case 'CustomerName':
              if (state.query[key] !== c[key][0])
                isApproved = false
              break
            default:
              if (state.query[key] !== c[key])
                isApproved = false
              break
          }
        })
        return isApproved
      })
    return result
  },

  getCaseStatus: state => () => {
    let { caseStatus } = state
    return caseStatus === 'all' ? '' : caseStatus
  },

  /**
   * 生成各種紀錄所需資訊
   */
  generateUserInfo: (state, getters, rootState) => () => {
    let { HumanID, HumanName, UserID } = rootState.System.user
    return {
      ProcessorHumanId: HumanID,
      ProcessorIdNo: UserID,
      ProcessorName: HumanName,
      ProcessDate: dayjs().format('YYYY/MM/DD'),
      ProcessTime: dayjs().format('HH:mm:ss'),
    }
  },
}

const actions = {
  /**
   * 設置 query 後更新列表
   */
  async setQueryAndUpdateList(context, { key, value = '' }) {
    await context.dispatch('setQuery', { key, value })
    await context.dispatch('updateCaseListWithQuery', {})
  },

  async setQuery(context, { key, value = '' }) {
    key
      ? context.commit('setQuery', { key, value })
      : context.commit('clearQuery')
  },

  async updateCaseListWithQuery(context) {
    let list = context.getters['getCaseListByQuery']()
    context.commit('setFilterListByQuery', list)
  },
  // ------------------
  /**
   * 根據 timestamp 重取案件列表
   *  - 將 timestamp 頭尾當作起迄, 只取一次
   */
  async reloadCaseListByTimestamp(context) {
    context.commit('setCaseList', [])
    context.commit('setFilterListByQuery', [])
    context.commit('setFilterLoading', true)

    let beginTs = context.state.caseListTimestamp[0]
      , endTs = context.state.caseListTimestamp.slice(-1)[0]
      , { BeginDTime } = getDateTimeForApi(beginTs)
      , { EndDTime } = getDateTimeForApi(endTs)
      , params = {
        CaseSearchCriteria: {
          StatusId: context.getters['getCaseStatus'](),
          CreationDTimePeriod: { BeginDTime, EndDTime }
        }
      }

    await context.dispatch('getCaseList', { params, option: { skipLoading: true, doNotStoreTimestamp: true } })
    await context.dispatch('updateCaseListWithQuery', {})
    context.commit('setFilterLoading', false)
  },

  // ------------------

  /**
   * 取得案件列表
   *  - 取得新列表, 如果有資料則更新列表
   *  - 取得成功後紀錄 timestamp
   */
  async getCaseList(context, { params, option }) {
    let response = await Case.getCaseList({ params, option })
    if (response?.Success) {
      if (response.Data.length)
        setCaseList(context, response.Data)
      if (!option?.doNotStoreTimestamp)
        setCaseListTimestamp(context, params)
      return { isSucceed: true, data: response.Data }
    }
    else
      return { isSucceed: false }

    // 將取得的案件儲存至列表
    function setCaseList(context, data) {
      let list = _.cloneDeep(context.state.caseList)
      list.push(...data)
      context.commit('setCaseList', list)
    }

    // 紀錄已取得的時間戳記, 越早的時間越前面, 每次重新進行去重與排序
    function setCaseListTimestamp(context, params) {
      let startDate = params.CaseSearchCriteria.CreationDTimePeriod.BeginDTime
        , startTs = dayjs(startDate).valueOf()
        , arr = _.cloneDeep(context.state.caseListTimestamp)
      arr.unshift(startTs)
      arr = Array.from(new Set(arr))
      arr.sort((a, b) => a - b)
      context.commit('setCaseListTimestamp', arr)
    }
  },

  /**
   * 取得特定案件
   */
  async getCaseById(context, { params, option }) {
    let response = await Case.getCaseById({ params, option })
    if (response?.Success) {
      if (response?.Data && !option?.doNotStore)
        context.commit('setCurrentCase', response.Data)
      return { isSucceed: true, data: response.Data }
    }
    else {
      context.commit('setCurrentCase', {})
      return { isSucceed: false }
    }
  },

  /**
   * 建立點貨紀錄
   */
  async createCaseCheckRecord(context, { params, option, retry = 0 }) {
    let response = await Case.createCaseCheckRecord({ params, option })
    if (response?.Success && response?.Data?.DocId) {
      message({ type: 'success', message: `${params.DocId} 建立紀錄成功` })
      return { isSucceed: true, data: response.Data }
    }
    else {
      message({ type: 'error', message: `${params.DocId} 建立紀錄失敗，請檢查輸入條碼是否正確 ${retryText(retry)}` })
      return needRetry(retry)
        ? context.dispatch('actionRetry', { params, option, retry: retry + 1, action: 'createCaseCheckRecord' })
        : { isSucceed: false }
    }
  },

  /**
   * 建立貨到廠紀錄
   */
  async createCaseArrivalRecord(context, { params, option, retry = 0 }) {
    let response = await Case.createCaseArrivalRecord({ params, option })
    if (response?.Success && response?.Data?.DocId) {
      message({ type: 'success', message: `${params.DocId} 建立紀錄成功` })
      return { isSucceed: true, data: response.Data }
    }
    else {
      message({ type: 'error', message: `${params.DocId} 建立紀錄失敗，請檢查輸入條碼是否正確 ${retryText(retry)}` })
      return needRetry(retry)
        ? context.dispatch('actionRetry', { params, option, retry: retry + 1, action: 'createCaseArrivalRecord' })
        : { isSucceed: false }
    }
  },

  /**
   * 案件指定結案
   */
  async createCaseCompleteRecord(context, { params, option, retry = 0 }) {
    let response = await Case.createCaseCompleteRecord({ params, option })
    if (response?.Success && response?.Data?.DocId) {
      message({ type: 'success', message: `${params.DocId} 指定結案成功` })
      return { isSucceed: true, data: response.Data }
    }
    else {
      message({ type: 'error', message: `${params.DocId} 指定結案失敗，稍後將會重試 ${retryText(retry)}` })
      return needRetry(retry)
        ? context.dispatch('actionRetry', { params, option, retry: retry + 1, action: 'createCaseCompleteRecord' })
        : { isSucceed: false }
    }
  },

  /**
   * 案件存檔
   */
  async createCaseSaveRecord(context, { params, option, retry = 0 }) {
    let response = await Case.createCaseSaveRecord({ params, option })
    if (response?.Success && response?.Data?.DocId) {
      message({ type: 'success', message: `${params.DocId} 存檔成功` })
      return { isSucceed: true, data: response.Data }
    }
    else {
      message({ type: 'error', message: `${params.DocId} 存檔失敗，稍後將會重試 ${retryText(retry)}` })
      return needRetry(retry)
        ? context.dispatch('actionRetry', { params, option, retry: retry + 1, action: 'createCaseSaveRecord' })
        : { isSucceed: false }
    }
  },

  /**
   * 案件簽名存檔
   */
  async createCaseSignRecord(context, { params, option, retry = 0 }) {
    let response = await Case.createCaseSignRecord({ params, option })
    if (response?.Success && response?.Data?.DocId) {
      message({ type: 'success', message: `${params.DocId} 簽名存檔成功` })
      return { isSucceed: true, data: response.Data }
    }
    else {
      message({ type: 'error', message: `${params.DocId} 簽名存檔失敗，稍後將會重試 ${retryText(retry)}` })
      return needRetry(retry)
        ? context.dispatch('actionRetry', { params, option, retry: retry + 1, action: 'createCaseSignRecord' })
        : { isSucceed: false }
    }
  },

  /**
   * api retry
   */
  async actionRetry(context, { params, option, retry, action }) {
    await delay(apiFailedRetryInterval * 1000)
    return context.dispatch(action, { params, option, retry })
  }
}

export {
  state,
  mutations,
  getters,
  actions,
}