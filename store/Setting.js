import { Setting } from '@/service/'

export const state = () => ({
  setting: null
})

export const mutations = {
  setSetting: (state, setting) => state.setting = setting
}

export const actions = {
  async getSetting(context) {
    if (context.state.setting) return

    let response = await Setting.getSetting()
    if (response.data) {
      await Setting.setSystemSetting(response.data)
      context.commit('setSetting', response.data)
    }
  }
}
