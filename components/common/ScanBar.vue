<template lang="pug">
  .ScanBar.flex.v-center
    span.title 條碼輸入
    .inputWrapper
      Operator(:oCol.sync="col")
        template(#icon)
          i.fas.fa-times.clearBtn(v-if="showClearBtn" @click="clearModel")
    .btnWrapper
      button.mat-btn.btn.full(@click="emit(false)") 輸入
    i.fas.fa-camera.icon(@click="toggleScanner(true)")

    ScanDialog(@onScanned="onScanned")

</template>

<script>
import ScanDialog from '@/components/dialog/ScanDialog'

export default {
  name: 'ScanBar',
  components: {
    ScanDialog,
  },
  props: {
    clearBtn: Boolean,
    syncStore: Boolean,
    scanUpdateKey: Number
  },
  data() {
    return {
      col: {
        model: '',
        class: '',
        showClearBtn: true
      },
    }
  },
  computed: {
    showClearBtn() {
      return this.col.model && this.clearBtn
    },
    caseQuery() {
      return this.$store.state.Case.query
    },
  },
  watch: {
    scanUpdateKey: {
      handler(newVal) {
        if (newVal && this.syncStore)
          this.col.model = this.caseQuery?.DocId || ''
      }
    }
  },

  methods: {
    /**
     * 按下輸入時將 model 值寫入 query 中
     *  - byScan: 經由掃描觸發
     */
    emit(byScan = false) {
      this.$emit('enter', { value: this.col.model, byScan })
    },

    /**
     * 掃描後自動傳出值
     */
    onScanned(v) {
      this.col.model = v
      this.emit(true)
    },

    /**
     * 
     */
    toggleScanner(open) {
      this.$store.commit('Dialog/setIsShowDialog', { key: 'isShowScanDialog', isShow: open })
    },

    /**
     * 
     */
    clearModel() {
      this.col.model = ''
      this.emit(false)
    },
  }
}
</script>

<style lang="stylus" scoped>

  .ScanBar
    .title
      flex 0 0 auto

    .inputWrapper
      flex 0 1 50%
      padding .25rem
      .clearBtn
        position absolute
        right .5rem

    .btnWrapper
      flex 0 0 auto
      width 80px
      .btn
        padding .125rem 0

    .icon
      font-size 2rem
      margin-left .5rem

</style>