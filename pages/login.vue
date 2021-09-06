<template lang="pug">
  .Login.flex.column.between
    .form.flex.column
      .title
        h1 閎康取送件系統
        span.version {{ version }}
      .col(v-for="(col, key, index) in form")
        span.colTitle {{ col.title }}
        Operator(:oCol.sync="col" :oKey="key")

      button.btn.mat-btn.full.main.medium(@click="login") 登入

      .options
        Operator(:oCol.sync="textEnv")

    .notice
      h3 公告通知：
      .list(v-loading="noticeLoading")
        .flex.column(v-if="notice.length")
          span(v-for="n in notice") {{ n.EventName }}
        .empty(v-else)
          span 暫無通知

    .footer
      p Copyright @ {{ year }} MA-tek. All rights reserved.

</template>

<script>
import config from '@/static/config.json'
import { ls_user_key, ls_user_account } from '@/service/setting.js'
import { delay } from '@/methods/'

export default {
  name: 'Login',
  layout: 'login',
  data() {
    return {
      config,

      form: {
        acount: {
          title: '帳號',
          class: 'medium-ft',
          model: '',
        },
        password: {
          title: '密碼',
          class: 'medium-ft',
          type: 'password',
          model: '',
        }
      },

      textEnv: {
        type: 'checkbox',
        model: [],
        options: [
          { label: '測試環境', value: 'check' },
        ]
      },

      noticeLoading: false,
    }
  },
  computed: {
    year() {
      return new Date().getFullYear()
    },
    notice() {
      return this.$store.state.System.notice
    },
    version() {
      let ver = process.env.NUXT_ENV_VER
      return `v${ver}`
    },
  },

  mounted() {
    this.setAccount()
    this.init()
  },

  methods: {
    /**
     * 如果取得 token 失敗會嘗試取得 token
     */
    async init() {
      let getTokenRes = await this.getToken()
      if (!getTokenRes)
        return this.keepRetry()

      await this.getNoticeList()
    },

    /**
     * 如果 token 取得失敗, 每隔一段時間就重新嘗試取得 token
     */
    async keepRetry() {
      let { loginTokenRetryInterval } = this.config
        , sec = (loginTokenRetryInterval || 30) * 1000
      await delay(sec)
      this.init()
    },

    /**
     * 
     */
    async getToken() {
      let option = { skipLoading: true }
        , response = await this.$store.dispatch('System/getToken', { option })
      if (!response.isSucceed)
        this.$message({ type: 'error', message: 'token 取得失敗，稍後將會重試' })
      return response.isSucceed
    },

    /**
     * 取得公告
     *  - loading 另外顯示於組件中
     */
    async getNoticeList() {
      this.noticeLoading = true
      let option = { skipLoading: true }
        , response = await this.$store.dispatch('System/getNoticeList', option)
      if (!response?.isSucceed)
        this.$message({ type: 'warning', message: '公告取得失敗' })
      this.noticeLoading = false
    },

    /**
     * 登入
     */
    async login() {
      if (!this.form.acount.model || !this.form.password.model)
        return this.$message({ type: 'error', message: '請確實填寫帳號密碼' })

      let params = {
        RequestorId: this.form.acount.model,
        Login: {
          UserId: this.form.acount.model,
          UserPassword: this.form.password.model
        }
      }
        , option = {}
        , response = await this.$store.dispatch('System/login', { params, option })

      if (response.isSucceed) {
        this.storeAccount()
        this.$message({ type: 'success', message: '登入成功！' })
        this.$router.push({ path: '/' })
      }
      else {
        localStorage.removeItem(ls_user_key)
        this.$message({ type: 'error', message: '登入失敗，請檢查帳號密碼' })
      }
    },

    /**
     * 記住帳號
     */
    storeAccount() {
      let acc = this.form.acount.model
      localStorage.setItem(ls_user_account, acc)
    },

    /**
     * 如果 localStorage 有紀錄帳號則帶入帳號欄位
     */
    setAccount() {
      let acc = localStorage.getItem(ls_user_account)
      if (acc)
        this.form.acount.model = acc
    },
  }
}
</script>

<style lang="stylus" scoped>

  .Login
    padding 1rem
    height 100vh

    .title
      text-align center
      margin-bottom 3rem
      h1
        setTextStyle(2.75rem, normal, main_c)
    
    .form
      padding-bottom 1.5rem
      .col
        width 100%
        & + .col
          padding-top .5rem
        .colTitle
          display block
          padding .25rem .5rem
          setTextStyle(1.25rem, normal, #000)
      .btn
        margin-top 1.5rem
      .options
        margin-top 1.5rem
        align-self flex-end
    
    .notice
      .list
        height notice_list_h
        overflow-x hidden
        overflow-y scroll
        hiddenScrollBar()
      .empty
        color #666
        font-style italic

    .footer
      a
        color main_c
        padding 0 .25rem
        text-decoration underline
</style>