import { message, delay } from '@/methods'
import { getRequestByIndex, deleteRequest, getAllRequest } from '@/methods/idb'
import { ls_user_key } from '@/service/setting'

const actionMapping = {
  check: 'createCaseCheckRecord',
  onlab: 'createCaseArrivalRecord',
  save: 'createCaseSaveRecord',
  sign: 'createCaseSignRecord',
  complete: 'createCaseCompleteRecord',
}

/**
 * 偵測網路連線
 *  - 更新 stores 狀態
 *  - 提示使用者當前網路狀態
 *  - 恢復連線時, 如果 indexedDB 有緩存資料
 *    則分批將緩存發送
 */
export default async function ({ store, route, router, redirect }) {

  // 網頁載入時不會觸發 online event
  update(true)

  window.ononline = () => update()
  window.onoffline = () => update()

  async function update(firstTimeInToPage = false) {
    let isOnLine = navigator.onLine
      , status = isOnLine ? "online" : "offline"

    store.commit('System/isOnLine', isOnLine)

    isOnLine
      ? !firstTimeInToPage && message({ type: 'info', message: '已偵測到網路連線' })
      : message({ type: 'info', message: '失去網路連線' })

    // 恢復連線時偵測是否有緩存需要發送
    if (isOnLine) {
      await delay(3000)
      detectStoreResquestAndLanuch()
    }
  }

  async function detectStoreResquestAndLanuch() {
    let user = JSON.parse(localStorage.getItem(ls_user_key))
      , humanId = user?.HumanID
      , requests = await getRequestByIndex('HumanID', humanId)

    if (requests?.length) {
      message({ type: 'info', message: '偵測到緩存紀錄，準備重新發送' })

      for await (let req of requests) {
        let { action, params, id } = req
          , docId = params?.DocId
          , actionKey = actionMapping[action]
          , option = { skipLoading: true }
          , response = await store.dispatch(`Case/${actionKey}`, { params, option })

        await delay(500)

        // 成功之後刪除緩存
        // if (response.isSucceed && response?.data?.DocId)
        // 不管成功與否均刪除緩存
        await deleteRequest(id)
      }
    }
  }
}