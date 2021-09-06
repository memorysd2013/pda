<template lang="pug">
  .profile
    h3.title 基本資料
    .contain.flex.column
      .col(v-for="col in columns")
        span {{ col.label }}：
        span {{ col.value }}

</template>

<script>
export default {
  name: 'Profile',
  data() {
    return {
      columns: {
        UserID: { label: '工號', value: '' },
        HumanName: { label: '姓名', value: '' },
        FullName: { label: '全名', value: '' },
        PhoneNum: { label: '分機', value: '' },
        MobileNum: { label: '手機', value: '' },
        Email: { label: 'Email ', value: '' },
        Description: { label: '備註', value: '' },
      }
    }
  },
  computed: {
    user() {
      return this.$store.state.System.user
    }
  },

  mounted() {
    this.setProfile()
    this.setFooter()
  },

  methods: {
    /**
     * 
     */
    async setProfile() {
      Object.keys(this.columns).forEach(key => {
        this.columns[key].value = this.user?.[key] || ''
      })
    },

    /**
     * 
     */
    setFooter() {
      this.$store.commit('Footer/setFooterByPage', 'profile')
    },
  },
}
</script>

<style lang="stylus" scoped>

  .profile
    pageContainer()
    .title
      setTextStyle(1.5rem, 500, #000)
      margin-bottom .5rem
    .contain
      padding .25rem
      .col
        & + .col
          margin-top .25rem

</style>