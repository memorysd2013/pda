<template lang="pug">
  canvas.Signature.canvas-signature(
    :id="canvasID" 
    :ref="canvasID"
    @touchstart="touchstart"
    @touchmove="touchmove"
    @touchend="touchend"
    @mouseup="mouseup"
    @mouseleave="mouseleave"
    @mousedown="mousedown"
    @mousemove="mousemove"
  )
</template>

<script>
export default {
  name: 'Signature',
  props: {
    canvasID: String,
    containerID: String,
    offsetY: {
      type: [String, Number],
      default: 0
    },
    offsetX: {
      type: [String, Number],
      default: 0
    },
    triggerClear: Number,
    createSignature: Number,
    hasContain: Boolean,
  },
  data: () => ({
    //
    canvas: null,

    // 紀錄畫線
    point: {},

    // Canvas Context
    context: {},

    // 紀錄滑鼠或手指是否有按下
    isPressed: false,

    // 是否為行動裝置
    isMobile: false,

    // 優化動畫
    requestAnimationFrame: null,

    // 產生的 Data
    dataURL: null,
    dataBlob: null,
  }),
  watch: {
    triggerClear: {
      handler(newVal) {
        this.clear()
      }
    },
    createSignature: {
      handler(newVal) {
        this.sendSignature()
      }
    }
  },

  mounted() {
    this.requestAnimationFrame = window.requestAnimationFrame
    this.isMobile = /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i.test(window.navigator.userAgent)
    this.createSignatureSection()
  },

  methods: {
    createSignatureSection() {
      document.querySelector(`#${this.containerID}`).scrollTo(0, 0)
      this.canvas = this.$refs[this.canvasID]
      const { left, top } = this.canvas.getBoundingClientRect()
      const parentW = this.canvas.parentElement.offsetWidth
      const parentH = this.canvas.parentElement.offsetHeight
      const paddingR = getComputedStyle(this.canvas.parentElement, null).getPropertyValue('padding-right').replace('px', '')
      const paddingL = getComputedStyle(this.canvas.parentElement, null).getPropertyValue('padding-left').replace('px', '')

      this.canvas.width = parentW - paddingR - paddingL - this.offsetX
      this.canvas.height = parentH - this.offsetY < 350 ? 350 : parentH - this.offsetY

      this.context = this.canvas.getContext('2d')
      this.optimizeByDevicePixelRatio()
      // set white bg
      this.context.fillStyle = "white"
      this.context.fillRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight)

      this.canvasSetting()
      this.left = left
      this.top = top
    },

    canvasSetting() {
      this.context.lineWidth = 6;
      this.context.strokeStyle = 'black';
      this.context.lineCap = 'round';
      this.context.lineJoin = 'round';
    },

    /**
     * Retina屏是用4个物理像素绘制一个虚拟像素，屏幕宽度相同的画布，其每个像素点都会由4倍物理像素去绘制，画布中点与点之间的距离增加，会产生较为明显的锯齿，可通过放大画布然后压缩展示来解决这个问题。
     * reference: https://juejin.im/post/595f41766fb9a06bc17c2c8d#heading-11
     */
    optimizeByDevicePixelRatio() {
      let { width, height } = this.canvas

      // 根據設備像素比優化 Canvas 繪圖
      const devicePixelRatio = window.devicePixelRatio
      if (devicePixelRatio) {
        this.canvas.style.width = `${width}px`
        this.canvas.style.height = `${height}px`
        this.canvas.height = height * devicePixelRatio
        this.canvas.width = width * devicePixelRatio
        this.context.scale(devicePixelRatio, devicePixelRatio)
      }
    },

    /**
     *
     */
    create(signal, e) {
      try {
        let { scrollTop } = document.querySelector(`#${this.containerID}`)
        if (signal === 1)
          this.isPressed = true
        if (signal === 1 || this.isPressed) {
          e = this.isMobile ? e.touches?.[0] : e
          /**
           * 為何要加 0.5 (canvas 1px 出现模糊解决方法及原理)
           * reference: https://segmentfault.com/a/1190000011546636
           */
          this.point.x = e.clientX - this.left + 0.5
          this.point.y = e.clientY - this.top + 0.5 + scrollTop
          this.paint(signal)
        }
      } catch (err) {
        console.warn('Something wrong occurred!', err)
      }
    },

    /**
     * 畫線
     */
    paint(signal) {
      switch (signal) {
        // 開始路徑
        case 1:
          this.context.beginPath()
          this.context.moveTo(this.point.x, this.point.y)
        // 沒有 break, 是為了點擊時就能畫出一個點
        case 2:
          this.updateContain(true)
          this.context.lineTo(this.point.x, this.point.y)
          this.context.stroke()
          break
      }
    },

    /**
     * 畫布清空, 產生的檔案清空
     */
    clear() {
      this.dataURL = null
      this.dataBlob = null
      this.updateContain(false)

      // this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
      // **原本是呼叫 canvas.clearRect  來清空 canvas 內的圖片, 不曉得為什麼清空後無法正確生成 file (getImageSize)
      // 目前已重建 canvas 實例代替 clearRect
      this.canvas = null
      this.createSignatureSection()
    },

    updateContain(boolean) {
      this.$emit('update:hasContain', boolean)
    },

    /**
     * 取得繪製的檔案
     */
    getPNGImg() {
      this.dataURL = this.canvas.toDataURL('image/png')
      this.dataBlob = this.dataURLtoBlob(this.dataURL)
      return { url: this.dataURL, blob: this.dataBlob }
    },

    getImageSize() {
      let canvas = this.$refs[this.canvasID]
      return [canvas.width, canvas.height]
    },

    /**
     * 繪製的檔案轉成 blob
     */
    dataURLtoBlob(dataURL) {
      const arr = dataURL.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bStr = atob(arr[1]);
      let n = bStr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bStr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    },

    async sendSignature() {
      let file = await this.getPNGImg()
        , [w, h] = await this.getImageSize()

      this.$emit('sign', { file, w, h })
    },

    start(e) {
      this.create(1, e)
    },

    move(e) {
      this.create(2, e)
    },

    // ===========================================
    //                    操作
    // ===========================================
    /**
     * PC Event
     */
    mouseup() {
      this.isPressed = false
    },

    /**
     * PC Event
     */
    mouseleave() {
      this.isPressed = false
    },

    /**
     * PC Event
     */
    mousedown(e) {
      this.isPressed = true
      this.start(e)
    },

    /**
     * PC Event
     */
    mousemove(e) {
      this.requestAnimationFrame ? requestAnimationFrame(() => this.move(e)) : this.move(e)
    },

    /**
     * Mobile Touch Start Event
     */
    touchstart(e) {
      this.isPressed = true
      document.body.style.overflow = 'hidden'
      document.querySelector(`#${this.containerID}`).style.overflow = 'hidden'
      document.addEventListener('touchmove', e => e.preventDefault, false)
      this.start(e)
    },

    /**
     * Mobile Touch Move Event
     */
    touchmove(e) {
      this.requestAnimationFrame ? requestAnimationFrame(() => this.move(e)) : this.move(e)
    },

    /**
     * Mobile Touch End Event
     */
    touchend() {
      document.body.style.overflow = ''
      document.querySelector(`#${this.containerID}`).style.overflow = 'auto'
      document.removeEventListener("touchmove", e => e.preventDefault, false)
    }
  }
}
</script>

<style lang="stylus" scoped>

  canvas
    cursor crosshair

</style>
