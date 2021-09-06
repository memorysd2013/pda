import { ls_token_key, ls_user_key } from '@/service/setting'

export default async function ({ store, route, router, redirect }) {
  if (store.state.System.isLogin) {
    route.name === 'login' && redirect('/')
    return
  }

  let token = localStorage.getItem(ls_token_key)
    , user = JSON.parse(localStorage.getItem(ls_user_key))
    , guid = user?.HumanID

  if (token && guid)
    await store.dispatch('System/afterLogin', {})

  if (route.name !== 'login' && (!token || !guid))
    return redirect({ name: 'logout' })

  else if (route.name === 'login' && token && guid)
    return redirect('/')
}