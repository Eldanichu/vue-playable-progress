<script>

export default /*#__PURE__*/{
  name: 'VueProgress', // vue component name
  props: {
    id: {
      type: String,
      default: "$$progress",
    },
    width: {
      type: [Number, String],
      default: 485,
    },
    position: {
      type: String,
      default: 'bottom-left'
    },
    offset: {
      type: Array,
      default: () => {
        return [600, 40]
      }
    },
    draws: {
      type: Object,
      default: () => {
        return {}
      }
    },
    bInterval: {
      type: [String, Number],
      default: 300
    },
    tags: {
      type: Boolean,
      default: false
    },
    hoverTip: {
      type: Boolean,
      default: true
    },
    Tip: {
      type: Boolean,
      default: true
    },
    data: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
  data() {
    return {
      isHover: false,
      isPlaying: false,
      rrect: {
        width: 0,
        left: 0,
        clickedLeft: 0,
      },
      dataIndex: 0,
      floatIndex: 0,
      interval: null,
      blocks: [],
    };
  },
  computed: {
    _isRight() {
      return this.position.match('right')
    },
    _isTop() {
      return this.position.match('top')
    },
    _computedStyles() {
      let _style = {};
      _style["width"] = this.get_width();
      let _r = this._isRight ? 'right' : 'left',
          _t = this._isTop ? 'top' : 'bottom';
      let dw = this.draws[_r] && this.draws[_r].show ? 0 : -380;
      _style[_r] = `${dw + this.offset[0]}px`;
      _style[_t] = `${this.offset[1]}px`;
      return _style;
    },
    _hoverStyles() {
      return {
        width: this.isHover ? this.rrect.left + "px" : 0,
        opacity: ~~!!this.isHover,
      };
    },
    hoverTipStyles() {
      let _style = {};
      _style["left"] = this.rrect.left + "px";
      return _style;
    },
    fixedTipStyles() {
      let _style = {};
      _style["left"] = this.rrect.clickedLeft + "px";
      return _style;
    },
    _playedStyles() {
      return {
        width: this.rrect.clickedLeft + "px",
        transition: `width linear ${
            this.isPlaying ? "0s" : ".2s"
        }, opacity linear .1s`,
      };
    }
  },
  mounted() {
    this.$nextTick(()=>{
      this.getBlockWidth();
      document.body.onresize = () => {
        this.getBlockWidth();
      };
    })
  },
  watch: {
    dataIndex(v) {
      this.$emit('bPlaying', {state: this.isPlaying, index: v})
    }
  },
  methods: {
    emove(e) {
      if (!this.isHover) return;
      let _prect = this._getComputedRects();
      let _pos = e.pageX - _prect.left;
      this.rrect.left = _pos < 0 ? 0 : _pos;
      let _el = this._getComputedElement();
      this.floatIndex = _el.floatIndex;
      this.$emit('bHover', {index: this.floatIndex})
    },
    eclick(e) {
      let _prect = this._getComputedRects();
      let _pos = e.pageX - _prect.left;
      this.rrect.clickedLeft = _pos < 0 ? 0 : _pos;
      let _ele = this._getComputedElement();
      this.dataIndex = _ele.clickIndex;
      this.$emit('bClick', {index: this.dataIndex})
    },
    ehover() {
      this.isHover = true;
    },
    eleave() {
      this.isHover = false;
      this.$set(this.rrect, "left", 0);
      this.floatIndex = 0;
    },
    progress_state_update() {
      let _ele;
      this.interval = setInterval( () => {
        if (this.dataIndex < this.data.length -1) {
          _ele = this._getComputedElement();
          ++this.dataIndex
          this.rrect.clickedLeft = this.dataIndex * _ele.blockWidth
        }else{
          if(this.dataIndex === this.data.length -1){
            _ele = this._getComputedElement();
            this.rrect.clickedLeft =this.data.length * _ele.blockWidth
          }
          clearInterval(this.interval)
          this.isPlaying = false
        }
      }, this.bInterval * 1000);
    },
    playPause() {
      this.isPlaying = !this.isPlaying;
      if (this.isPlaying) {
        this.progress_state_update();
      } else {
        clearInterval(this.interval);
        this.$emit('bStopped', {state: false, index: this.dataIndex})
        this.interval = 0;
      }
    },
    get_width() {
      if (typeof this.width === "string") {
        return parseFloat(this.width) + "%";
      } else if (typeof this.width === "number") {
        return parseFloat(this.width) + "px";
      }
    },
    _getComputedRects() {
      let _$dom = document.getElementById(this.id);
      return _$dom.getClientRects()[0];
    },
    _getComputedElement() {
      let _totalWidth = this._getComputedRects().width;
      let _len = this.data.length;
      let _blockWidth = _totalWidth / _len;
      let widthPercent = this.rrect.left / _totalWidth;
      let widthPercent_click = this.rrect.clickedLeft / _totalWidth;
      let _dataIndex = this.dataIndex;

      let fi = _len * widthPercent;
      let fi_click = _len * widthPercent_click;
      let round_fi = Math.round(fi - 0.5).toFixed(0);
      let round_fi_click = Math.round(fi_click - 0.5).toFixed(0);
      return {
        blockWidth: _blockWidth,
        widthPercent: widthPercent,
        indexPercent: _dataIndex / _len,
        floatIndex: round_fi < 0 ? 0 : round_fi,
        clickIndex: round_fi_click < 0 ? 0 : round_fi_click,
      };
    },
    getBlockWidth() {
      let _totalWidth = this._getComputedRects().width;
      this.rrect.width = _totalWidth;

      let _len = this.data.length;
      let _blockWidth = _totalWidth / _len;
      let _blocks = [];
      for (let i = 0; i < _len; ++i) {
        _blocks.push({
          start: _blockWidth,
        });
      }
      this.blocks = _blocks;
    },
  },
};
</script>

<template>
  <div class="d-progress-bar" :style="_computedStyles">
    <div class="play-pause">
      <div class="action-btn">
        <i @click="playPause">
          <svg v-if="!isPlaying" t="1620489165504" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1129" width="200" height="200"><path d="M512 0C229.376 0 0 229.376 0 512s229.376 512 512 512 512-229.376 512-512S794.624 0 512 0z m189.952 537.6l-261.12 150.528c-17.92 10.24-39.936-2.56-39.936-23.04V364.032c0-20.48 22.528-33.28 39.936-23.04l261.12 150.528c17.92 10.24 17.92 35.84 0 46.08z" p-id="1130"></path></svg>
          <svg v-else t="1620489305380" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1862" width="200" height="200"><path d="M510.293333 139.377778a369.777778 369.777778 0 1 0 369.777778 369.777778 369.777778 369.777778 0 0 0-369.777778-369.777778z m110.933334 480.711111h-224.711111v-224.711111h224.711111z" p-id="1863"></path></svg>
        </i>
      </div>
    </div>
    <div
        class="progress-bar"
        :id="id"
        @click="eclick"
        @mousemove="emove"
        @mouseover="ehover"
        @mouseleave="eleave"
    >

      <div class="hover-fill" :style="_hoverStyles"/>
      <div class="played-fill" :style="_playedStyles"/>
      <div class="tags" v-if="tags">
        <template v-for="(block, index) in blocks">
          <span
              class="tag__item"
              :style="{
              width: block.start + 'px',
            }"
              :key="block.start + Math.random()"
          >
          </span>
        </template>
      </div>
    </div>
    <!--    hover time tip-->
    <div
        class="timecode time-code ghost-timecode"
        :style="hoverTipStyles"
        v-show="isHover && hoverTip && data.length"
    >
      <div class="box">
        {{ data[floatIndex] }}
        <slot name="hover-box"/>
      </div>
    </div>
    <!--  fixed time tip  -->
    <div
        class="timecode main-timecode"
        v-show="data.length"
        :style="fixedTipStyles"
    >
      <div class="box">
        {{ data[dataIndex] }}
        <slot name="box"/>
      </div>
      <div :class="['box-details']">
        <slot name="boxInfo"/>
      </div>
    </div>

    <!--    &lt;!&ndash;    debug button&ndash;&gt;-->
    <!--    <button @click="playbar" style="margin: 30px">play</button>-->
    <!--    &lt;!&ndash;    debug info&ndash;&gt;-->
    <!--    <div>isHover:{{ isHover }}</div>-->
    <!--    <div>hoverData: {{ data[floatIndex] }}</div>-->
    <!--    <div>hoverIndex: {{ floatIndex }}</div>-->
    <!--    <div>clickIndex {{ dataIndex }}</div>-->
  </div>
</template>

<style lang="scss" scoped>
@import "css/index";
</style>
