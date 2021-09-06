<template lang="pug">
  .CaseCard(:id="docId" @click="cardClick")
    .cardInfo
      span(v-if="caseType") {{ caseType }}, 
      span.docId(v-if="data.DocId") {{ data.DocId }}
      span(v-if="option.action") {{ ', ' + option.action }}

    .cardContainer
      .spacing(:style="cardStyle")
        CaseCardLayout(:layout="layout")
      
</template>

<script>
import CaseCardLayout from '@/components/unit/CaseCardLayout'
import { getLayout, mapping } from './CaseCard.data'
import _ from 'lodash'

export default {
  name: 'CaseCard',
  components: {
    CaseCardLayout,
  },
  props: {
    data: {
      type: Object,
      default: () => ({})
    },
    index: Number,
    /**
     * @param
     *  - list: 列表頁卡片
     *  - detail: 詳細頁卡片
     */
    mode: {
      type: String,
      default: 'list'
    },
    maxHeight: Number,
    option: {
      type: Object,
      default: () => ({})
    },
  },
  data() {
    return {
      mapping,

      layout: {},

      highlight: false,
    }
  },
  computed: {
    docId() {
      return this.data?.DocId || ''
    },
    caseType() {
      let { InOut } = this.data
      return this.mapping.caseType?.[InOut] || ''
    },
    cardStyle() {
      return this.maxHeight
        ? {
          'max-height': `${this.maxHeight}px`,
          'overflow-x': 'hidden',
          'overflow-y': 'auto',
        }
        : {}
    },
  },

  mounted() {
    this.setLayout()
  },

  methods: {
    /**
     * 根據案件的各種條件選擇 layout, 塞入各欄位特殊需求的資料
     */
    setLayout() {
      let { data } = this
        , _layout = getLayout(this.mode, this.data.InOut, this.option)
        , getData = key => data?.LatestProcess && (data.LatestProcess?.[key] || '')

      Object.keys(_layout).forEach(key => {
        let col = _layout[key]
        switch (key) {
          case 'customer':
            col.cutomer = `#${this.index + 1} ${data.CustomerName}`
            col.destination = `${data.StartPlace} > ${data.EndPlace}`
            break
          case 'specified_time':
            col.date = data.DesignatedDate
            col.notes = data.Remark
            break
          case 'contact_phone':
            col.value = data.ContactTel
            col.name = data.ContactName
            col.hidden = !data?.ContactTel
            break
          case 'contact_phone_2':
            col.value = data.ContactTel2
            col.name = data.ContactName
            col.hidden = !data?.ContactTel2
            break
          case 'address':
            col.value = data.ContactAddress
            col.hidden = !data?.ContactAddress
            break
          case 'finished':
            col.value = this.mapping.closed?.[data.Closed] || ''
            break
          // 已點貨欄位, 沒有值的話隱藏 col [已被 last_process 取代]
          case 'inventory':
            let showInventory = data?.LatestProcess?.ActionName === '點貨存檔'
            col.hidden = !showInventory
            if (showInventory)
              col.value = `${getData('ProcessDate')} ${getData('ProcessTime')}`
            break
          // 已到廠欄位, 沒有值的話隱藏 col [已被 last_process 取代]
          case 'arrival':
            let showArrival = data?.LatestProcess?.ActionName === '貨到廠存檔'
            col.hidden = !showArrival
            if (showArrival)
              col.value = `${getData('ProcessDate')} ${getData('ProcessTime')} ${getData('SiteName')}`
            break
          // 列表頁才會有的欄位, 取代已點貨/已到廠欄位
          case 'last_process':
            col.hidden = !data?.LatestProcess?.ActionName
            if (data?.LatestProcess?.ActionName) {
              col.label = data.LatestProcess.ActionName
              col.value = `${getData('ProcessDate')} ${getData('ProcessTime')} ${getData('SiteName')}`
            }
            break
          default:
            if (col?.apiKey && col.apiKey.includes('LatestProcess.')) {
              let latestProcess = data?.LatestProcessList && data.LatestProcessList.find(p => p.Latest)
                , apiKeys = col.apiKey.split('LatestProcess.')
              if (latestProcess)
                col.value = latestProcess[apiKeys[1]]
            }
            else
              col.value = data?.[col.apiKey]
            break
        }

      })

      this.layout = _layout
    },

    /**
     * 卡片點擊事件
     */
    cardClick() {
      this.$emit('cardClick', this.data)
    },
  }
}
</script>

<style lang="stylus" scoped>
  .CaseCard
    position relative
    padding-top .75rem

    .cardInfo
      position absolute
      left 1rem
      top .125rem
      padding 0 .25rem
      background-color #fff

    .cardContainer
      border 3px solid #000
      padding .75rem .25rem .25rem
      .spacing
        hiddenScrollBar()

    .docId
      font-weight 500

</style>