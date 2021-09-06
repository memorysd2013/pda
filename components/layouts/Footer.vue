<template lang="pug">
  .footer
    .group.flex
      template(v-for="f in footer")
        button.mat-btn.full.btn(:class="[f.active && 'active', f.disabled && 'disabled']" @click="btnClick(f)") {{ f.label }}
        
</template>

<script>
export default {
  name: 'Footer',
  computed: {
    footer() {
      return this.$store.state.Footer.footer
    },
    docId() {
      return this.$route?.params?.id
    },
  },

  methods: {
    /**
     * 
     */
    btnClick(f) {
      if (f.query) {
        Object.keys(f.query).forEach(key => this.$store.dispatch('Case/setQueryAndUpdateList', { key, value: f.query[key] }))
        this.$store.commit('Case/setScanUpdateKey')
      }

      if (f.event)
        this[f.event]()

      if (f.to)
        this.$router.push({ path: f.to, query: f.query })
    },

    /**
     * 
     */
    openSignDialog() {
      this.$store.commit('Dialog/setIsShowDialog', { key: 'isShowSignDialog', isShow: true })
    },

    /**
     * 案件指定結案
     */
    caseComplete() {
      this.$store.commit('Case/setCompleteTriggerKey')
    },

    /**
     * 案件存檔
     */
    caseSave() {
      this.$store.commit('Case/setSaveTriggerKey')
    },

    /**
     * 
     */
    setScrollTarget() {
      if (this.docId)
        this.$store.commit('Case/setScrollTarget', this.docId)
    },
  },
}
</script>

<style lang="stylus" scoped>
  .footer
    padding .5rem .625rem .625rem
    background-color #fff
    width 100%

    .group
      box-shadow 4px 4px 0 #000
      width 100%

      .btn
        padding .125rem 0

</style>