import _ from 'lodash'

const customer = {
  label: '',
  className: '',
  cutomer: '',
  destination: '',
}

const specified_time = {
  label: '指定時間',
  date: '',
  notes: '',
}

const contact_phone = {
  icon: 'fas fa-mobile-alt',
  type: 'phone',
  hidden: false,
  value: '',
  name: '',
}

const contact_phone_2 = {
  icon: 'fas fa-mobile-alt',
  type: 'phone',
  hidden: false,
  value: '',
  name: '',
}

const address = {
  icon: 'fas fa-map-marker-alt',
  type: 'address',
  value: '',
}
// [!] 只使用在列表頁 (已被last_process取代)
const inventory = {
  label: '已點貨',
  hidden: false,
  value: '',
}
// [!] 只使用在列表頁 (已被last_process取代)
const arrival = {
  label: '已到廠',
  hidden: false,
  value: '',
}
// [!] 只使用在列表頁
const last_process = {
  label: '',
  hidden: false,
  value: '',
}

const destination = {
  label: '終點',
  apiKey: 'EndPlace',
  value: '',
}

const finished = {
  label: '已完成',
  value: '',
}

const deliver_company = {
  label: '送件公司',
  apiKey: 'FromCustomerName',
  value: '',
}

const deliver_staff = {
  label: '送件人員',
  apiKey: 'FromContactName',
  value: '',
}

const deliver_address = {
  label: '送件地址',
  apiKey: 'FromAddress',
  type: 'address',
  value: '',
}

const from_tel_1 = {
  label: '送件電話一',
  apiKey: 'FromTel_1',
  type: 'phone',
  value: '',
}

const from_tel_2 = {
  label: '送件電話二',
  apiKey: 'FromTel_2',
  type: 'phone',
  value: '',
}

const receive_company = {
  label: '收件公司',
  apiKey: 'ToCustomerName',
  value: '',
}

const receive_staff = {
  label: '收件人員',
  apiKey: 'ToContactName',
  value: '',
}

const receive_address = {
  label: '收件地址',
  apiKey: 'ToAddress',
  type: 'address',
  value: '',
}

const to_tel_1 = {
  label: '收件電話一',
  apiKey: 'ToTel_1',
  type: 'phone',
  value: '',
}

const to_tel_2 = {
  label: '收件電話二',
  apiKey: 'ToTel_2',
  type: 'phone',
  value: '',
}

const lastProcessDivide = {
  // 含分隔線
  text: '最後一筆外務處理紀錄',
}

const processor_id = {
  label: '外務工號',
  apiKey: 'LatestProcess.ProcessorIdNo',
  value: '',
}
const processor_name = {
  label: '外務姓名',
  apiKey: 'LatestProcess.ProcessorName',
  value: '',
}
const process_date = {
  label: '日期',
  apiKey: 'LatestProcess.ProcessDate',
  value: '',
}
const process_time = {
  label: '日期',
  apiKey: 'LatestProcess.ProcessTime',
  value: '',
}
const action_name = {
  label: '事項',
  apiKey: 'LatestProcess.ActionName',
  value: '',
}
const process_note = {
  label: '備註',
  apiKey: 'LatestProcess.Remark',
  value: '',
}

/**
 * 統一管理卡片用到的文字
 */
export const mapping = {
  caseType: {
    I: '取件',
    O: '送件',
  },
  closed: {
    N: '否',
    Y: '是',
  }
}

export function getLayout(mode, type, option) {
  let clone = _.cloneDeep

  // 取件
  if (mode === 'list' && type === 'I') {
    return clone({ customer, specified_time, contact_phone, contact_phone_2, address, last_process })
  }

  // 送件
  if (mode === 'list' && type === 'O') {
    return clone({ customer, destination, specified_time, contact_phone, contact_phone_2, address, last_process })
  }

  // 取件詳細頁
  if (mode === 'detail' && type === 'I')
    return clone({ finished, deliver_company, deliver_staff, deliver_address, from_tel_1, from_tel_2, receive_company, receive_staff, receive_address, to_tel_1, to_tel_2, lastProcessDivide, processor_id, processor_name, process_date, process_time, action_name, process_note })

  // 送件詳細頁
  if (mode === 'detail' && type === 'O')
    return clone({ finished, deliver_company, deliver_staff, deliver_address, from_tel_1, from_tel_2, receive_company, receive_staff, receive_address, to_tel_1, to_tel_2, lastProcessDivide, processor_id, processor_name, process_date, process_time, action_name, process_note })
}

/**
 * 將案件詳細頁欄位轉換成對應的列表頁欄位
 * [目前沒有用到]
 */
export function transformCaseKey(data) {
  let { Closed, FromAddress, FromContactName, FromCustomerName, FromTel_1, FromTel_2, ToAddress, ToContactName, ToCustomerName, ToTel_1, ToTel_2, DesignatedDate, DocId, LatestProcessList, EndPlace, StartPlace, InOut, Remark, Urgent } = data
  return {
    Closed,
    ContactAddress: InOut === "I" ? FromAddress : ToAddress,
    ContactName: InOut === "I" ? FromContactName : ToContactName,
    ContactTel: InOut === "I" ? FromTel_1 : ToTel_1,
    ContactTel2: InOut === "I" ? FromTel_2 : ToTel_2,
    CustomerName: InOut === "I" ? FromCustomerName : ToCustomerName,
    DesignatedDate,
    DocId,
    EndPlace,
    InOut,
    LatestProcess: LatestProcessList.find(l => l.Latest) || {},
    Remark,
    StartPlace,
    Urgent,
  }
}