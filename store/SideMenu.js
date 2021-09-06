import { lockScreen } from '@/methods/'

const state = () => ({
  isShowSideMenu: false,

  sideMenu: [
    { 
      label: '首頁',
      icon: 'fas fa-home',
      to: '/',
      needArrow: true,
    },
    { 
      label: '基本資料',
      icon: 'fas fa-child',
      to: '/profile',
      needArrow: true,
    },
    { 
      label: '個人設定',
      icon: 'fas fa-cog',
      to: '',
      needArrow: true,
    },
    { 
      label: '登出',
      icon: 'fas fa-sign-out-alt',
      to: '/logout',
      needArrow: false,
    }
  ],
})

const mutations = {
  setIsShowSideMenu: (state, boolean) => {
    state.isShowSideMenu = boolean
    // 打開組件時不讓畫面滑動
    lockScreen({ lock: boolean })
  },
}

export {
  state,
  mutations,
}