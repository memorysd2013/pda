<template lang="pug">
  DialogContainer.ScanDialog(:show="isShowScanDialog" type="gray")
    template(#body)
      .scannerContainer.flex.column.between
        .wrapper.flex.v-center(v-if="isShowScanDialog")
          //- Scanner(
          //-   type="ScanQRCode"
          //-   scannerId="QRCodeScannerID"
          //-   @onScanned="onScanned"
          //- )
          ScannerV2(@onScanned="onScanned")

        .btn
          button.mat-btn.full.medium(@click="closeScanner") 關閉

</template>

<script>
import Scanner from '@/components/unit/Scanner'
import ScannerV2 from '@/components/unit/ScannerV2'

export default {
  name: 'ScanDialog',
  components: {
    Scanner,
    ScannerV2,
  },
  computed: {
    isShowScanDialog() {
      return this.$store.state.Dialog.isShowScanDialog
    },
  },

  methods: {
    /**
     * 
     */
    onScanned(v) {
      if (v) {
        this.$emit('onScanned', v)
        this.closeScanner()
      }
    },

    closeScanner() {
      this.$store.commit('Dialog/setIsShowDialog', { key: 'isShowScanDialog', isShow: false })
    },
  }
}
</script>

<style lang="stylus" scoped>

  .ScanDialog
    .scannerContainer
      height 100%

      .wrapper
        flex 1 1 auto

</style>