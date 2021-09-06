import _ from 'lodash'

const pageName = {
  retrieve: '取件',
  deliver: '送件',
  inventory: '點貨',
  arrival: '貨到廠',
}
const retrieve = {
  label: pageName.retrieve,
  active: false,
  to: '/',
  query: {
    InOut: 'I',
  },
}
const deliver = {
  label: pageName.deliver,
  active: false,
  to: '/',
  query: {
    InOut: 'O',
  },
}
const inventory = {
  label: pageName.inventory,
  active: false,
  to: '/inventory',
}
const arrival = {
  label: pageName.arrival,
  active: false,
  to: '/arrival',
}
// 詳細頁 - 取件
const save = {
  label: '存檔',
  event: 'caseSave',
}
const close = {
  label: '關閉',
  to: '/',
  event: 'setScrollTarget',
}
const case_close = {
  label: '指定結案',
  disabled: false,
  event: 'caseComplete',
}
// 詳細頁 - 送件
const sign = {
  label: '簽名',
  disabled: true,
  event: 'openSignDialog',
}

const state = () => ({
  footer: {},

  pageSetting: {
    index: { retrieve, deliver, inventory, arrival },
    detail_retrieve: { save, close, case_close },
    detail_deliver: { sign, save, close, case_close },
    profile: { close },
  },
})

const mutations = {
  setFooter: (state, footer) => state.footer = footer,

  setFooterByPage: (state, page) => {
    let footer = state.pageSetting[page]
    state.footer = _.cloneDeep(footer)
  },

  setFooterDisabled: (state, { key, boolean }) => {
    if (state.footer[key])
      state.footer[key].disabled = boolean
  },
  setFooterActive: (state, key) => Object.keys(state.footer).forEach(k => state.footer[k].active = k === key),
}

const getters = {
  getPageName: state => key => pageName?.[key] || '',
}

export {
  state,
  mutations,
  getters,
}