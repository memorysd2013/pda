import { System } from '@/service'
import { ls_token_key, ls_user_key } from '@/service/setting'
import { message } from '@/methods/'

const state = () => ({
  isOnLine: false,

  // 由 login, autoLogin 觸發, 登入權限仍有效不需要重新登入
  isLogin: false,

  // 公告清單
  notice: [],

  // 當前登入使用者資訊
  user: null,

  // 廠商清單
  siteList: [],
})

const mutations = {
  isOnLine: (state, boolean) => state.isOnLine = boolean,

  setIsLogin: (state, boolean) => state.isLogin = boolean,
  setUser: (state, user) => state.user = user,

  setNotice: (state, list) => state.notice = list,

  setSiteList: (state, list) => state.siteList = list,
}

const getters = {
  getRequestorGuid: state => () => state.user?.HumanID
}

const actions = {
  async getToken(context, { option }) {
    let response = await System.getToken({ option })
    if (response) {
      // 將 token 存入 localStorage
      if (response?.Data?.GUID) {
        localStorage.setItem(ls_token_key, response.Data.GUID)
        return { isSucceed: true }
      }
      else
        return { isSucceed: false }
    }
  },

  /**
   *
   */
  async getNoticeList(context, { option }) {
    let response = await System.getNoticeList({ option })
    if (response?.Success) {
      context.commit('setNotice', response.Data.NoticeList)
      return { isSucceed: true }
    }
    else {
      context.commit('setNotice', [])
      return { isSucceed: false }
    }
  },

  /**
   * 登入
   */
  async login(context, { params, option }) {
    let response = await System.login({ params, option })
    if (response?.Success) {
      localStorage.setItem(ls_user_key, JSON.stringify(response.Data))
      context.commit('setUser', response.Data)
      await context.dispatch('afterLogin', {})
      return { isSucceed: true, data: response.Data }
    }
    else
      return { isSucceed: false }
  },

  /**
   * 使用者成功登入/自動登入後, 需要先取得的資料
   * - 寫入使用者資訊
   * - 取得廠商清單
   */
  async afterLogin(context) {
    context.commit('setIsLogin', true)

    if (!context.state.user) {
      let user = user = JSON.parse(localStorage.getItem(ls_user_key))
      context.commit('setUser', user)
    }

    let getSiteListRes = await context.dispatch('getSiteList', {})

    if (!getSiteListRes.isSucceed)
      message({ type: 'error', message: `取得廠區列表失敗。ErrorMessage: ${getSiteListRes?.message}` })
  },

  /**
   * 取得廠商清單
   */
  async getSiteList(context) {
    let response = await System.getSiteList({ params: {}, option: {} })

    return response?.Success
      ? getSiteSucceed(context, response.Data.SiteList)
      : getSiteFailed(context, response.ErrorMessage)

    function getSiteSucceed(context, data) {
      context.commit('setSiteList', data)
      return { isSucceed: true }
    }

    function getSiteFailed(context, message) {
      context.commit('setSiteList', [])
      return { isSucceed: false, message }
    }
  },
}

export {
  state,
  mutations,
  getters,
  actions,
}