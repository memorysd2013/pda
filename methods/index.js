import { disableScroll, enableScroll } from './scrolling'
import { _f } from './api'
import { Message } from 'element-ui'

/**
 * reference: https://segmentfault.com/a/1190000012313337
 * 
 * 將 body 利用 position fixed, top 0 的特性鎖定
 * 子層的組件滾動不受影響
 */
export function lockScreen({ lock = false }) {
  let bodyEl = document.body
  let top = 0

  stopBodyScroll(lock)

  function stopBodyScroll(isFixed) {
    if (isFixed) {
      top = window.scrollY

      bodyEl.style.position = 'fixed'
      bodyEl.style.top = -top + 'px'
    } else {
      bodyEl.style.position = ''
      bodyEl.style.top = ''

      window.scrollTo(0, top) // 回到原先的top
    }
  }

  // 會將整個畫面的滾動事件都移除, 即使 Dialog 內也無法滾動
  // lock
  //   ? disableScroll()
  //   : enableScroll()
}

export function f(method, url, path, params, option) {
  return _f(method, url, path, params, option)
}

export async function delay(ts = 300) {
  return await new Promise((res) => setTimeout(() => res(), ts))
}

export function message(opts) {
  Message({
    type: 'info',
    customClass: 'mat-message',
    showClose: true,
    ...opts
  })
}

/**
 * @param selector: #id or .class
 *  - behavior "smooth" do not support on Safari
 *  - behavior "smooth" bug: Google Chrome: Simultaneously 'smooth' scrollIntoView() with more elements doesn't work
 *    reference: https://stackoverflow.com/questions/49318497/google-chrome-simultaneously-smooth-scrollintoview-with-more-elements-doesn
 */
export function scrollToSpecificEl(selector) {
  try {
    let element = document.querySelector(selector)
    if (!element) return
    element.scrollIntoView({ behavior: "auto", block: "start" })
  } catch (e) { }
}