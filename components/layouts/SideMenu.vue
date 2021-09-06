<template lang="pug">
  .sideMenu.flex.column.between(:class="[isShowSideMenu && 'show']")
    .group.flex.column
      .row(v-for="row in sideMenu" @click="rowClick(row)")
        i.icon(:class="row.icon")
        span.label {{ row.label }}
        i.arrowIcon.fas.fa-angle-right(v-if="row.needArrow")
      
    .btnsArea
      .flex.column.v-center
        span.version {{ version }}
        button.mat-btn.full.medium(@click="closeSideMenu") 關閉

</template>

<script>
export default {
  name: 'SideMenu',
  computed: {
    isShowSideMenu() {
      return this.$store.state.SideMenu.isShowSideMenu
    },
    sideMenu() {
      return this.$store.state.SideMenu.sideMenu
    },
    version() {
      let ver = process.env.NUXT_ENV_VER
      return `v${ver}`
    },
  },

  methods: {
    /**
     * 側邊欄點擊
     */
    rowClick(row) {
      if (row.to)
        this.$router.push({ path: row.to })

      // 回首頁, 清空所有 query
      if (row?.to === '/') {
        this.$store.dispatch('Case/setQueryAndUpdateList', {})
        this.$store.commit('Case/setBtnUpdateKey')
        this.$store.commit('Case/setScanUpdateKey')
      }
      // 登出清空 store 狀態避免 autoLogin redirect
      if (row?.to === '/logout')
        this.$store.commit('System/setIsLogin', false)

      this.closeSideMenu()
    },

    /**
     * 
     */
    closeSideMenu() {
      this.$store.commit('SideMenu/setIsShowSideMenu', false)
    },
  }
}
</script>

<style lang="stylus" scoped>
  border_c = rgb(153, 153, 153)
  bg_c = rgb(140, 140, 140)

  .sideMenu
    border 5px solid border_c
    background-color bg_c
    position fixed
    top header_h
    z-index dialog_z
    width 100%
    height 'calc(100vh - %s)' % header_h
    padding .25rem
    transform translateX(-100%)
    transition transform .3s
    &.show
      transform translateX(0)

    .group
      padding 1.5rem
      color #eee
      .row
        position relative
        & + .row
          margin-top .75rem
        .icon
          text-align center
          font-size 1.25rem
          width 30px
          margin-right .5rem
        .label
          font-size 1.25rem
        .arrowIcon
          position absolute
          right 0
          font-size 1.75rem

    .btnsArea
      padding .125rem
      .version
        margin-bottom .25rem
        color #fff

</style>