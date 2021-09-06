const state = () => ({
  isShowSignDialog: false,

  isShowScanDialog: false,
  signFile: null,
})

const mutations = {
  setIsShowDialog: (state, { key, isShow }) => state[key] = isShow,
  setDialogInfo: (state, { key, info }) => state[key] = info,

  setSignFile: (state, url) => state.signFile = url,
}

export {
  state,
  mutations,
}