import q from 'fus-q-request'

let apiPath = ''
  , IdentityGUID = ''
  , ls_token_key = 'mat_token'
  , ls_user_key = 'mat_user'
  , ls_user_account = 'mat_account'

export async function getSetting(option = {}) {
  let urls = {
    LOCAL: '/setting.json',
    TEST: '/setting.json',
    PROD: '/setting_prod.json',
  }
    , url = urls[process.env.NUXT_ENV_MODE]
    , response = await q('get', url, option)

  return response
}

export function setSystemSetting(data) {
  return new Promise(resolve => {
    apiPath = data.apiPath
    IdentityGUID = data.IdentityGUID
    resolve()
  })
}

export {
  apiPath,
  IdentityGUID,
  ls_token_key,
  ls_user_key,
  ls_user_account,
}
