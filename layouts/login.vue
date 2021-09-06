<template lang="pug">
  section
    main#main
      nuxt

</template>

<script>
export default {
  name: 'login',
  middleware: [
    'getSetting',
    'autoLogin',
  ],

  mounted() {
    window.vm = this
  }
}
</script>

<style lang="stylus" scoped>

</style> 