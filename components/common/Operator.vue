<template lang="pug">
  .operator(:class="[_oCol.disabledCol && 'disabled']")
    .main
      .label(v-if="_oCol.label")
        span {{ _oCol.label }}

      .wrapper.flex.v-center(v-if="_oCol.type === 'password'")
        input.mat-input(v-model="_oCol.model" :class="[_oCol.error && 'danger', _oCol.class]" type='password' @keyup="onKeyup" :placeholder="_oCol.placeholder" :disabled="_oCol.disabled" autocomplete="off")

      .wrapper.checkbox(v-else-if="oCol.type === 'checkbox'")
        .flex(:class="[oCol.dir === 'column' && 'column']")
          .opt.flex.v-center(v-for="opt in oCol.options")
            input.mat-checkbox(v-model="_oCol.model" :class="[_oCol.error && 'danger', _oCol.class]" :value="opt.value" type='checkbox' :disabled="_oCol.disabled")
            label.optLabel(@click="onEvent(opt)") {{ opt.label }}

      .wrapper.radio(v-else-if="oCol.type === 'radio'")
        .flex(:class="[oCol.dir === 'column' && 'column']")
          .opt.flex.v-center(v-for="opt in oCol.options")
            input.mat-radio(v-model="_oCol.model" :class="[_oCol.error && 'danger', _oCol.class]" :value="opt.value" type='radio' :disabled="_oCol.disabled")
            label.optLabel(@click="onEvent(opt)") {{ opt.label }}

      //- Default
      .wrapper.flex.v-center(v-else)
        input.mat-input(v-model="_oCol.model" :class="[_oCol.error && 'danger', _oCol.class]" ref="input" :type="_oCol.type" @keyup="onKeyup" :placeholder="_oCol.placeholder" :disabled="_oCol.disabled")
        slot(name="icon")

</template>

<script>
import _ from 'lodash'

export default {
  name: 'Operator',
  props: {
    oKey: [String, Number],
    oCol: Object,
  },
  data: () => ({

  }),
  computed: {
    _oCol: {
      get() {
        return this.oCol
      },
      set(val) {
        this.$emit('update:oCol', val)
      }
    }
  },

  methods: {
    onKeyup() {
      this.$emit('onKeyup')
    },

    /**
     * 點擊文字欄位觸發 checkbox, radio 事件
     */
    onEvent(opt) {
      let { type } = this.oCol
        , _oCol = _.cloneDeep(this.oCol)

      switch (type) {
        case 'radio':
          _oCol.model = opt.value
          break
        case 'checkbox':
          _oCol.model.includes(opt.value)
            ? _oCol.model = _oCol.model.filter(f => f !== opt.value)
            : _oCol.model.push(opt.value)
          break
      }
      this._oCol = _oCol

      // 外層用 v-for 渲染不知道為什麼 sync/update:col 不起作用, 所以另外寫 emit 事件強制更新
      this.$emit('update', _oCol)
    },
  }
}
</script>

<style lang="stylus" scoped>

  .operator
    width 100%
    &.disabled 
      opacity .5
      pointer-events none
    
    .main
      .wrapper
        position relative

    .checkbox, .radio
      .opt
        .optLabel
          margin-left .25rem
      .column
        .opt
          & + .opt
            margin-top .25rem
      :not(.column)
        .opt
          & + .opt
            margin-left .75rem

</style>