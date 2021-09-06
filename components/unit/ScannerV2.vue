<template lang="pug">
  .ScannerV2(v-loading="!showCanvas")
    .loadingMessage(v-if="!showCanvas") {{ loadingMessage }}
    #wrapper
      canvas#canvas(
        v-show="showCanvas"
        :width="canvasWidth"
        :height="canvasHeight"
        ref="canvasElement"
      )
    #output(v-if="text")
      span {{ text }}

</template>


<script>
// eslint-disable-next-line no-unused-vars
// import adapter from "webrtc-adapter";
// WebRTC适配器 只需要引入就ok
import jsQR from "jsqr";
import { delay } from '@/methods/'

export default {
  name: 'ScannerV2',
  data: () => ({
    video: document.createElement("video"),

    loadingMessage: '請確認允許開啟攝影鏡頭權限, 開啟中...',

    showCanvas: false,
    canvas2d: undefined,
    outputData: undefined,
    canvasWidth: 320,
    canvasHeight: 480,

    code: null,

    border: false,
  }),
  computed: {
    text() {
      return this.code?.data || ''
    },
    isShowScanDialog() {
      return this.$store.state.Dialog.isShowScanDialog
    },
  },

  async mounted() {
    this.openScan()

    // 30秒後關閉以減輕效能負擔
    // await delay(30000)
    // this.$store.commit('Dialog/setIsShowDialog', { key: 'isShowScanDialog', isShow: false })
  },
  beforeDestroy() {
    this.video.srcObject = null
    this.showCanvas = false
  },

  methods: {
    openScan() {
      // 桌機不支援前置鏡頭
      let isMobile = /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i.test(window.navigator.userAgent)
        , constraints = isMobile
          ? { video: { facingMode: { exact: "environment" } } }
          : { video: true }

      navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
          this.video.srcObject = stream;
          this.video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
          this.video.play();
          requestAnimationFrame(this.tick);
        })
        .catch(e => this.$message({ duration: 0, type: 'warning', message: `無法開啟取得攝影機權限 \n error message: ${e}` }))
    },
    tick() {
      if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
        this.showCanvas = true
        this.canvasHeight = this.video.videoHeight
        this.canvasWidth = this.video.videoWidth

        if (!this.canvas2d)
          this.canvas2d = this.$refs.canvasElement.getContext("2d")

        this.canvas2d.drawImage(this.video, 0, 0, this.canvasWidth, this.canvasHeight)

        var imageData = this.canvas2d.getImageData(0, 0, this.canvasWidth, this.canvasHeight)
        var code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert"
        })

        if (!this.border)
          this.createBorderForQRCode()

        if (code?.data) {
          this.video.srcObject = null
          this.showCanvas = false
          this.code = code

          this.$emit('onScanned', code.data)
        }
      }
      // 關閉組件後不再重複執行 以減輕效能負擔
      if (this.isShowScanDialog)
        requestAnimationFrame(this.tick)
    },

    createBorderForQRCode() {
      let el = document.getElementById('wrapper')
        , border = this.createBorder()

      el.appendChild(border)

      let [w, h] = ['25px', '4px']
      Array(8).fill({}).map((m, i) => this.createLine(border, i, { w, h }))
      this.border = true
    },

    createBorder() {
      let border = document.createElement('div')
      border.style.position = 'absolute'
      border.style.width = this.autoWH()
      border.style.height = this.autoWH()

      // border.style.top = 'calc(50% - 250px / 2)'
      // border.style.left = 'calc(50% - 250px / 2)'
      // border.style.top = '20%'
      // border.style.left = 0

      border.style.top = '50%'
      border.style.left = '50%'
      border.style.transform = 'translate(-50%, -50%) scale(0.7)'
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
      let el = document.getElementById('wrapper')
        , w = el.offsetWidth
      return w + 'px'
    }
  }
};
</script>

<style lang="stylus" scoped>
.ScannerV2
  max-width 640px
  margin 0 auto
  position relative

#githubLink
  position absolute
  right 0
  top 12px
  color #2d99ff

h1
  margin 10px 0
  font-size 40px

.loadingMessage
  text-align center
  padding 40px
  background-color #eee

#canvas
  width 100%
  position relative

#output
  margin-top 20px
  background #eee
  padding 10px
  padding-bottom 0

#output div
  padding-bottom 10px
  word-wrap break-word

#noQRFound
  text-align center

</style>