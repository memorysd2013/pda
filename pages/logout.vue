<template lang="pug">
</template>

<script>
import { ls_token_key, ls_user_key } from '@/service/setting'

export default {
  name: "Logout",
  layout: 'logout',

  beforeRouteEnter(to, from, next) {
    localStorage.removeItem(ls_token_key)
    localStorage.removeItem(ls_user_key)

    // 登出後預期導回首頁
    next('/login')
  },
}
</script>
