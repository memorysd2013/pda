import config from '@/static/config.json'

export const form = {
  finished: {
    type: 'radio',
    options: [
      { label: '順利完成', value: 'finished' },
      { label: '未能完成', value: 'unfinished' },
    ],
    model: ''
  },
  reason: {
    outsideLabel: '失敗原因',
    class: '',
    hidden: false,
    model: '',
  },
  notes: {
    outsideLabel: '備註',
    class: '',
    model: '',
  },
}

const failedReason = config?.failedReason || ["查無此人", "客戶取消", "客戶改期", "其他"]

export const failedReasonCol = {
  label: '未能完成原因:',
  type: 'radio',
  dir: 'column',
  model: '',
  options: failedReason.map(r => ({ label: r, value: r }))
}

export const batchCol = {
  label: '',
  type: 'checkbox',
  dir: 'column',
  model: [],
  options: []
}