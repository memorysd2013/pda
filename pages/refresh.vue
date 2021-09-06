<template lang="pug">
</template>

<script>
export default {
  name: 'Refresh',

  beforeCreate() {
    this.$router.go(-1)
  }
}
</script>