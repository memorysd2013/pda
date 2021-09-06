<template lang="pug">
  #Scanner.flex.center-center
    div(:id="scannerId")
      slot(name="features")
    span(v-if="!jbScanner_instance") 無法開啟 jsqrscanner
</template>

<script>
export default {
  name: "Scanner",
  props: {
    type: String,
    scannerId: String
  },
  data: function () {
    return {
      jbScanner_instance: null
    }
  },

  destroyed() {
    this.jbScanner_instance?.stopScanning && this.jbScanner_instance.stopScanning()
    document.querySelector('#jsqrscanner')?.remove()
  },
  mounted() {
    window.JsQRScannerReady = this.JsQRScannerReady
    window.jsqrscanner();
  },

  methods: {
    closeScanner() {
      this.$emit('closeScanner')
      this.jbScanner_instance?.stopScanning && this.jbScanner_instance.stopScanning()
    },
    onQRCodeScanned(scannedText) {
      this.$emit('onScanned', scannedText)
    },
    JsQRScannerReady() {
      //create a new scanner passing to it a callback function that will be invoked when
      //the scanner succesfully scan a QR code
      this.jbScanner_instance = new window.JsQRScanner(this.onQRCodeScanned);

      //reduce the size of analyzed images to increase performance on mobile devices
      this.jbScanner_instance.setSnapImageMaxSize(300);
      var scannerParentElement = document.getElementById(this.scannerId);
      if (scannerParentElement) {
        //append the jbScanner to an existing DOM element
        this.jbScanner_instance.appendTo(scannerParentElement);
        document.querySelector('.qrPreviewVideo').style.position = "relative"
        document.querySelector('.qrPreviewVideo').style.zIndex = "10"
        document.querySelector('.qrPreviewVideo').style.width = '100%'
        document.querySelector('.qrPreviewVideo').style.height = '100%'
        document.querySelector('.qrPreviewVideo').parentElement.style.width = '100%'
        document.querySelector('.qrPreviewVideo').parentElement.style.height = '100%'

        // this.type === 'ScanQRCode'
        //   ? this.createBorderForQRCode(scannerParentElement)
        //   : this.createBorderForCamera(scannerParentElement)
      }
    },

    createBorderForQRCode(scannerParentElement) {
      let border = this.createBorder()
      scannerParentElement.appendChild(border)

      let [w, h] = ['25px', '4px']
      Array(8).fill({}).map((m, i) => this.createLine(border, i, { w, h }))
    },

    createBorderForCamera(scannerParentElement) {
      let border = this.createBorder()
      scannerParentElement.appendChild(border)

      let [w, h] = ['35px', '6px']
      Array(8).fill({}).map((m, i) => this.createLine(border, i, { w, h }))
    },

    createBorder() {
      let border = document.createElement('div')
      border.style.position = 'absolute'
      border.style.width = this.autoWH()
      border.style.height = this.autoWH()
      /**
       * 原始寫法
       * border.style.top = 'calc(50% - 250px / 2)'
       * border.style.left = 'calc(50% - 250px / 2)'
       */
      /**
       * 改進寫法
       * 原本在 autoWH 取得外框長寬時將 width * 0.8 取得比較小的 border
       * 改為使用 scale 只縮小視覺大小, 實際佔比還是跟螢幕一樣寬, 就不需要計算 left, 將 left 指定為 0 即可
       */
      border.style.top = '20%'
      border.style.left = 0
      border.style.transform = 'scale(0.8)'
      border.style.zIndex = 12

      return border
    },

    /**
     * i % 2 = 0 往上下,  = 1 往左右
     * i / 2 取整數位, 則知分組 (0左上 1右上 2右下 3左下)
     */
    createLine(border, i, { w, h }) {
      let line = document.createElement('div')
        , group = Math.floor(i / 2)
        , direction = i % 2
        , pos, origin, radius, transform

      line.style.position = 'absolute'
      line.style.width = w
      line.style.height = h
      line.style.backgroundColor = 'white'
      switch (group) {
        case 0:
          pos = { top: '0px', left: '0px' }
          origin = '0 0'
          radius = {
            borderTopRightRadius: '4px',
            borderBottomRightRadius: '4px',
            borderBottomLeftRadius: direction === 0 ? '4px' : '0px'
          }
          transform = direction === 0 ? 'rotate(90deg)' : 'rotate(0deg)'
          break
        case 1:
          pos = { top: '0px', right: '0px' }
          origin = '100% 0'
          radius = {
            borderTopLeftRadius: '4px',
            borderBottomLeftRadius: '4px',
            borderBottomRightRadius: direction === 0 ? '4px' : '0px'
          }
          transform = direction === 0 ? 'rotate(270deg)' : 'rotate(0deg)'
          break
        case 2:
          pos = { bottom: '0px', right: '0px' }
          origin = '100% 0'
          radius = {
            borderTopLeftRadius: '4px',
            borderBottomLeftRadius: '4px',
            borderBottomRightRadius: direction === 1 ? '4px' : '0px'
          }
          transform = direction === 0 ? 'rotate(90deg)' : 'rotate(0deg)'
          break
        case 3:
          pos = { bottom: '0px', left: '0px' }
          origin = '0 0'
          radius = {
            borderTopRightRadius: '4px',
            borderBottomRightRadius: '4px',
            borderBottomLeftRadius: direction === 1 ? '4px' : '0px'
          }
          transform = direction === 0 ? 'rotate(270deg)' : 'rotate(0deg)'
          break
      }

      setStyle({ pos, origin, radius, transform })
      function setStyle({ pos, origin, radius, transform }) {
        line.style.top = pos.top
        line.style.right = pos.right
        line.style.bottom = pos.bottom
        line.style.right = pos.right
        line.style.transform = transform
        line.style.transformOrigin = origin
        line.style.borderTopLeftRadius = radius.borderTopLeftRadius
        line.style.borderTopRightRadius = radius.borderTopRightRadius
        line.style.borderBottomLeftRadius = radius.borderBottomLeftRadius
        line.style.borderBottomRightRadius = radius.borderBottomRightRadius
      }

      border.append(line)
    },

    autoWH() {
      const scannerParentElement = document.getElementById(this.scannerId)
        , w = scannerParentElement.offsetWidth

      return w + 'px'
    }
  }
}
</script>

<style lang="stylus" scoped>

  #Scanner
    width 100%
    height 100%
    position relative
    > *
      width 100%
    >>> video
      width 100%
      height 100%
      object-fit fill

</style>
