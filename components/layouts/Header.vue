<template lang="pug">
  .header
    .menu.flex.between
      i.icon.fas.fa-align-justify(@click="showSideMenu")
      i.icon.fas.fa-redo-alt(v-if="isShowReloadIcon" @click="reload")
</template>

<script>
export default {
  name: 'Header',
  computed: {
    isShowSideMenu() {
      return this.$store.state.SideMenu.isShowSideMenu
    },
    isShowReloadIcon() {
      let showPage = ['index']
        , { name } = this.$route
      return showPage.includes(name)
    },
  },

  methods: {
    /**
     * 
     */
    showSideMenu() {
      this.$store.commit('SideMenu/setIsShowSideMenu', !this.isShowSideMenu)
    },

    /**
     * 不同頁面執行不同 function
     *  - index: (取件/送件) 根據 store 儲存的 caseListTimestamp 重新取得列表
     *  - arrival/inventory: 重整頁面
     */
    reload() {
      let { name } = this.$route

      if (name === 'index')
        this.$store.dispatch('Case/reloadCaseListByTimestamp', {})

      if (name === 'arrival' || name === 'inventory')
        this.$router.push({ path: '/refresh' })
    },
  }
}
</script>

<style lang="stylus" scoped>

  .header
    width 100%
    background-color #fff
    .menu
      .icon
        font-size 1.75rem
        padding .375rem
</style>