import { openDB } from 'idb'
import { ls_user_key } from '@/service/setting'
import { message } from '@/methods/'

/**
 * 
 *  - 資料庫名稱: me-tek
 *  - version: 1
 *  - upgrade: 當發現當前版本較低或儲存庫時觸發, 建立新的儲存庫
 */
let db = null
  , dbName = 'ma-tek'
  , version = 1
  , storeName = 'pending-list'
  , actions = ['save', 'sign', 'complete', 'check', 'onlab']

/**
 * indexedDB 初始化
 */
export async function initDB() {
  db = await openDB(dbName, version, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(storeName)) {
        // 建立待發送列表
        let store = db.createObjectStore(storeName, {
          // The 'id' property of the object will be the key.
          keyPath: 'id',
          // If it isn't explicitly set, create a value by auto incrementing.
          autoIncrement: true,
        })

        store.createIndex('HumanID', 'HumanID')
      }
    }
  })
}

// 建立 db transaction
// safari 12 - 14 版本會有 transaction 事件關閉不完全的 bug
function createDbTransaction() {
  let tx = db.transaction(storeName, 'readwrite')

  tx.oncomplete = () => console.log('tx oncomplete')
  tx.onsuccess = () => console.log('tx onsuccess')
  tx.onerror = () => console.log('tx onerror')
  return tx
}

// 讀取特定待發送列表內的案件
export async function getRequest(key) {
  let openRequest = indexedDB.open(dbName)
    , tx = db.transaction(storeName, 'readwrite')
    , response = tx.store.get(key)
  tx.done
  return response
}

// 讀取所有待發送列表內的案件
export async function getAllRequest() {
  let openRequest = indexedDB.open(dbName)
    , tx = db.transaction(storeName, 'readwrite')
    , response = tx.store.getAll()
  tx.done
  return response
}

// 根據索引取得待發送列表的案件
export async function getRequestByIndex(indexKey, indexValue) {
  try {
    let openRequest = indexedDB.open(dbName)
      , tx = db.transaction(storeName, 'readwrite')
      , index = tx.store.index(indexKey)
      , response = index.getAll(indexValue)

    tx.done
    return response
  }
  catch (e) {
    console.error(e)
    return null
  }
}

/**
 * 將 requestBody 儲存到 db 待發送列表
 *  - [!] onsuccess, onerror event 沒有觸發所以 message 寫在 try catch 內, 否則比較理想應該是寫在 event 內
 */
export async function storeRequest(action, params) {
  let openRequest = indexedDB.open(dbName)
    , tx = db.transaction(storeName, 'readwrite')

  try {
    let res = await add(action, params)
    if (res)
      message({ type: 'warning', message: '失去網路連線。資料緩存成功，待網路重新連線時自動送出' })
    return res
  }
  catch (e) {
    console.error({ e })
    message({ type: 'error', message: '失去網路連線。操作無法緩存，請重新連線後再試' })
    return false
  }

  async function add(action, params) {
    let user = localStorage.getItem(ls_user_key)
      , { HumanID } = JSON.parse(user)
      , response = await tx.store.add({ action, HumanID, params })

    await tx.done
    return response
  }
}

/**
 * 刪除待發送列表內的案件
 */
export async function deleteRequest(key) {
  let openRequest = indexedDB.open(dbName)
    , tx = db.transaction(storeName, 'readwrite')
  await del(key)
  function del(key) {
    Promise.all([
      tx.store.delete(key),
      tx.done
    ])
  }
}