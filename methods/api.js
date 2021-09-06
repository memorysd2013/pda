import { ls_token_key, ls_user_key } from '@/service/setting'

let ENV_MODE = ["LOCAL"]
  , Loading = require('element-ui').Loading
  , loadingInstance = null
  , instanceArr = []

export function _f(method, url, path, params, option) {
  let TokenGUID = localStorage.getItem(ls_token_key)
    , user = JSON.parse(localStorage.getItem(ls_user_key))
    , body = {
      TokenGUID,
      ApiId: path,
      RequestorGUID: user?.HumanID,
      ...params
    }
  return _fetch(method, url, body, option)
}

export function _fetch(method, url, body, option) {

  _default(option)

  return fetch(url, {
    method,
    body: JSON.stringify(body),
    headers: new Headers({
      'Content-Type': 'application/json'
    })
  })
    .then(res => res.json())
    .catch(err => _error(err))
    .then(res => _success(res))

  // 執行
  function _default(option) {
    // 開啟 loading
    if (!option?.skipLoading) {
      loadingInstance = Loading.service({ fullscreen: true })
      !instanceArr.find(d => d === loadingInstance) && instanceArr.push(loadingInstance)
    }
  }

  // 失敗
  function _error(err) {
    if (ENV_MODE.includes(process.env.NUXT_ENV_MODE)) {
      console.log(' ')
      console.log('============= 失敗 =============')
      console.log('[_fetch] Api Path (%s) %s', method, body?.ApiId)
      console.log('[_fetch]', err)
      console.log('[_fetch]', err.toString())
      console.log('[_fetch] Request Body', body)
      console.log(' ')
    }

    //- 關閉 Loading
    if (!option?.skipLoading)
      setTimeout(() => closeLoadingInstance())

    return err
  }

  /**
   * 取得成功
   * - 返回成功結果
   * - 取得成功但不符合預期資料, 返回失敗結果
   */
  function _success(res) {
    if (ENV_MODE.includes(process.env.NUXT_ENV_MODE)) {
      let resultMsg = res.Success
        ? '============= 成功 ============='
        : '============= 失敗 ============='
      console.log(' ')
      console.log(resultMsg)
      console.log('[_fetch] Api Path (%s) %s', method, body?.ApiId)
      console.log('[_fetch] Response', res)
      console.log('[_fetch] Request Body', body)
      console.log(' ')
    }

    //- 關閉 Loading
    if (!option?.skipLoading && !option?.keepLoading)
      setTimeout(() => closeLoadingInstance())

    return res
  }

  function closeLoadingInstance() {
    instanceArr.forEach(d => d && d.close())
  }
}
