<template lang="pug">
  DialogContainer.SignDialog#Sign(:show="isShowSignDialog" v-loading="!renderSign")
    template(#body)   
      Signature(
        v-if="renderSign"
        containerID="Sign"
        canvasID="SignatureInPunchOut"
        offsetY=80
        offsetX=10
        :hasContain.sync="hasContain"
        :triggerClear="triggerClear"
        :createSignature="createSignature"
        @sign="sign"
      )

      .btns
        ButtonRow(:btns="btns")

</template>

<script>
import Signature from '@/components/unit/Signature'
import DialogContainer from '@/components/dialog/DialogContainer'

export default {
  name: 'SignDialog',
  components: {
    Signature,
    DialogContainer,
  },
  data() {
    return {
      hasContain: false,

      triggerClear: 0,
      createSignature: 0,

      renderSign: false,
    }
  },
  computed: {
    btns() {
      return [
        { label: '存檔結案', className: this.hasContain ? 'medium' : 'medium disabled', event: this.create.bind(this) },
        { label: '取消', className: 'medium', event: this.cancel.bind(this) },
      ]
    },
    isShowSignDialog() {
      return this.$store.state.Dialog.isShowSignDialog
    },
  },
  watch: {
    /**
     * 因應 Dialog 動畫未結束前, 組件隱藏於畫面上方, Canvas 會抓錯位置
     */
    isShowSignDialog: {
      handler(newVal) {
        setTimeout(() => this.renderSign = newVal, 500)
      }
    }
  },

  methods: {
    sign({ file, w, h }) {
      let { url } = file
      this.$store.commit('Dialog/setSignFile', url)
      this.$store.commit('Case/setsignTriggerKey')
      this.$store.commit('Dialog/setIsShowDialog', { key: 'isShowSignDialog', isShow: false })
    },

    cancel() {
      this.triggerClear++
      this.$store.commit('Dialog/setIsShowDialog', { key: 'isShowSignDialog', isShow: false })
    },

    create() {
      this.createSignature++
    },
  },
}
</script>

<style lang="stylus" scoped>

  .SignDialog
    .btns
      margin-top .5rem
      >>> .ButtonRow
        .btn
          width 50%

</style>