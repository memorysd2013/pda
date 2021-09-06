<template lang="pug">
  section
    Header#Header
    main#main
      nuxt
    Footer#Footer

    SideMenu
    SignDialog

</template>

<script>
import Header from '@/components/layouts/Header'
import Footer from '@/components/layouts/Footer'
import SideMenu from '@/components/layouts/SideMenu'
import SignDialog from '@/components/dialog/SignDialog'

export default {
  name: 'Default',
  middleware: [
    'getSetting',
    'autoLogin',
    'initDB',
    'onlineListener',
  ],
  components: {
    Header,
    Footer,
    SideMenu,
    SignDialog,
  },
  computed: {
    isShowSideMenu() {
      return this.$store.state.SideMenu.isShowSideMenu
    },
  },

  mounted() {
    window.vm = this
  }
}
</script>

<style lang="stylus" scoped>

  section
    position relative

    #Header
      position fixed
      top 0
      z-index header_z

    #main
      min-height 'calc(100vh - %s - %s)' % (header_h footer_h)
      margin header_h 0 footer_h

    #Footer
      position fixed
      bottom 0
      z-index footer_z

  #status
    position fixed
    width 100%
    font bold 1em sans-serif
    color #FFF
    padding 0.5em

  #log
    padding 2.5em 0.5em 0.5em
    font 1em sans-serif

  .online
    background green

  .offline
    background red

</style> 