<template>
  <div class="d-progress-bar"
       :class="[isCentered,v]"
       :style="_computedStyles">
    <div class="warp">
      <div class="play-pause cursor-pointer" @click="playPause">
        <div class="action-btn">
          <i
              :class="['fa',isPlaying?'fa-pause':'fa-play']"
              :style="{'margin-left':!isPlaying?'2px':'0'}"
          />
        </div>
      </div>
      <!--   timebar   -->
      <div
          class="progress-bar select-none"
          :id="id"
          @click="eclick"
          @mousemove="emove"
          @mousedown="edown"
          @mouseover="ehover"
          @mouseleave="eleave"
      >
        <div class="click-shadow absolute h-8 w-full -top-1/2 transform-gpu -translate-y-1/2"></div>
        <div class="hover-fill" :style="_hoverStyles"/>
        <div class="played-fill relative" :style="_playedStyles">
          <i class="played-point"
             @mousedown="edown"
             v-if="v==='v2'"/>
        </div>

        <div class="tags" v-if="tags">
          <template v-for="(block, index) in blocks">
          <span
              class="tag__item"
              :style="{
              width: block.start + 'px',
            }"
              :key="block.start + Math.random()"
          >
            {{ tagformatter(data[index]) }}
          </span>
          </template>
        </div>
      </div>
      <!--   loop button   -->
      <div class="loop">
        <button class="btn-loop text-white rounded-full transition transition-all duration-200"
                :class="[isLoop?'bg-blue-500':'bg-gray-400']"
                @click="toggleLoop"
        >
          <i class="fa fa-refresh"/>
        </button>
      </div>

      <slot name="tool"></slot>

      <!--    hover time tip-->
      <div class="timecode time-code ghost-timecode select-none"
           :style="hoverTipStyles"
           v-if="isHover && hoverTip && data.length"
      >
        <div class="box">
          {{ data[floatIndex] | dataExists }}
          <slot name="hover-box"/>
        </div>
      </div>

      <!--  fixed time tip  -->
      <div class="timecode main-timecode select-none"
           v-show="data.length || !this.isDragging"
           :style="fixedTipStyles"
      >
        <div class="box">
          {{ data[currentIndex] | dataExists }}
          <slot name="box"/>
        </div>
        <div :class="['box-details']">
          <slot name="boxInfo"/>
        </div>
      </div>


      <!--      <div class="time-code-blocked" v-if="v==='v2'">-->
      <!--        <span class="time">-->
      <!--         {{ data[dataIndex] }}-->
      <!--          <slot name="box"/>-->
      <!--        </span>-->
      <!--      </div>-->
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import lodash_func from 'lodash/function';

export default {
  name: "ProgressBar",
  props: {
    v: {
      type: String,
      default: 'v2'
    },
    id: {
      type: String,
      default: "$$progress",
    },
    width: {
      type: [Number, String],
      default: '30',
    },
    position: {
      type: String,
      default: 'bottom-left'
    },
    offset: {
      type: Array,
      default: () => {
        return [0, 20];
      }
    },
    draws: {
      type: Object,
      default: () => {
        return {};
      }
    },
    loading:{
      type:Boolean,
      default:false
    },
    bInterval: {
      type: [String, Number],
      default: 300
    },
    loop: {
      type: Boolean,
      default: true
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
    value: {
      type: [String, Number],
      default: 0
    }
  },
  data() {
    return {
      isDragging: false,
      isHover: false,
      isPlaying: false,
      rrect: {
        width: 0,
        left: 0,
        clickedLeft: 0,
      },
      dataIndex: 0,
      currentIndex: 0,
      floatIndex: 0,
      interval: null,
      blocks: [],
      isLoop: true
    };
  },
  computed: {
    _isRight() {
      return this.position.match('right');
    },
    _isTop() {
      return this.position.match('top');
    },
    _isCenter() {
      return this.position.match('center');
    },
    isCentered() {
      return this._isCenter ? 'transform-gpu left-1/2 -translate-x-1/2' : '';
    },
    _computedStyles() {
      let _style = {};
      _style["width"] = this.get_width();
      let _r = this._isRight ? 'right' : 'left',
          _t = this._isTop ? 'top' : 'bottom';
      let dw = this.draws[_r] && this.draws[_r].show && this.draws[_r].width || 150;

      _style[_r] = this.isCentered ? '' : `${dw + this.offset[0]}px`;

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
      };
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initializeBar();
    });
  },
  watch: {
    value: {
      handler(value) {
        this.$nextTick(() => {
          if (typeof value === 'number') {
            this.setPercentByIndex(value);
            this.dataIndex = value;
            this.currentIndex = value;
          } else if (typeof value === 'string') {
            //TODO: search current dates for index
          }
        });
      },
    },
    data() {
      this.resetProgress();
    },
    dataIndex(v) {
      if (this.isPlaying) {
        this.$emit('bPlaying', {state: this.isPlaying, index: Number(v)});
      }
    },
    loop(value) {
      this.isLoop = value;
    }
  },
  methods: {
    initializeBar() {
      this.getBlockWidth();
      this.bindEvents();
    },
    bindEvents() {
      window.addEventListener('resize', this.recalculate);
      document.addEventListener('mouseup', this.unDrag);
      document.addEventListener('mousemove', this.globalMouseMove);
    },
    globalMouseMove(e) {
      if (this.isDragging) {
        this.eclick(e);
      }
    },
    unDrag() {
      this.isDragging = false;
    },
    removeEvents() {
      window.removeEventListener('resize', this.recalculate);
      document.removeEventListener('mouseup', this.unDrag);
      document.removeEventListener('onmousemove', this.globalMouseMove);
    },
    toggleLoop() {
      this.isLoop = !this.isLoop;
    },
    emove(e) {
      if (!this.isHover) return;
      this.rrect.left = this.getPositivePosition(e);
      let _el = this._getComputedElement();
      this.floatIndex = _el.floatIndex;
      this.$emit('bHover', {index: Number(this.floatIndex)});
    },
    eclick(e) {
      let _left = this.getPositivePosition(e);
      this.rrect.left = _left;
      this.rrect.clickedLeft = _left;
      let _el = this._getComputedElement();
      this.currentIndex = _el.clickIndex;
      this.dragDebounce(this, _el);
    },
    ehover() {
      this.isHover = true;
    },
    edown() {
      this.isDragging = true;
    },
    eleave() {
      this.isHover = false;
      this.$set(this.rrect, "left", 0);
      this.floatIndex = 0;
    },
    emitDataIndex(index) {
      this.dataIndex = index;
      this.currentIndex = index;
      this.$emit('bClick', {index: Number(index), state: true});
    },
    dragDebounce: lodash_func.debounce((self, el) => {
      self.emitDataIndex(el.clickIndex);
    }, 200),
    getPositivePosition(e) {
      let _rect = this._getComputedRects();
      let _mousePosition = e.pageX - _rect.left;
      let _barWidth = _rect.width;

      let _position;
      if (_mousePosition >= _barWidth) {
        _position = _barWidth - 1;
      } else if (_mousePosition <= 0) {
        _position = 0;
      } else {
        _position = _mousePosition;
      }

      return _position;
    },
    progress_state_update() {
      let dataLen = this.data.length - 1;
      if (this.dataIndex >= dataLen) {
        this.dataIndex = 0;
        this.currentIndex = this.dataIndex;
        this.setPercentByIndex(this.currentIndex);

        this.$emit('bPlaying', {state: this.isPlaying, index: Number(this.dataIndex)});
      }
      this.interval = setInterval(() => {
        dataLen = this.data.length - 1;

        if (this.dataIndex < dataLen) {
          ++this.dataIndex;
        } else if (this.dataIndex === dataLen) {
          if (this.isLoop) {
            this.rrect.clickedLeft = 0;
            this.dataIndex = 0;
          } else {
            clearInterval(this.interval);
            this.isPlaying = false;
          }
        }
        this.currentIndex = this.dataIndex;
        this.setPercentByIndex(this.currentIndex);
      }, this.bInterval * 1000);
    },
    playPause() {
      if (!this.data[this.currentIndex]) {
        return;
      }
      this.isPlaying = !this.isPlaying;
      this.$emit('beforePlay', {state: this.isPlaying, index:  Number(this.dataIndex)});
      if (this.isPlaying) {
        this.progress_state_update();
      } else {
        this.stop();
      }
    },
    stop() {
      clearInterval(this.interval);
      this.$emit('bStopped', {state: false, index:  Number(this.dataIndex)});
      this.isPlaying = false;
      this.interval = 0;
    },
    resetProgress() {
      this.getBlockWidth();
      this.dataIndex = 0;
      this.currentIndex = 0;
      this.stop();
      // this.$set(this.rrect, 'left', 0);
      this.$set(this.rrect, 'clickedLeft', 0);
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
      let rect =  _$dom.getClientRects();
      if (!rect.length){
        throw ('ProgressBar initialize failed');
      }
      if (_$dom && rect) {
        return rect[0];
      }

    },
    _getComputedElement() {
      let _rects = this._getComputedRects();
      if (!_rects) return;
      let _totalWidth = _rects.width || 0;
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
        floatIndex: round_fi <= 0 ? 0 : round_fi,
        clickIndex: round_fi_click <= 0 ? 0 : round_fi_click,
      };
    },
    setPercentByIndex(index) {
      let _rects = this._getComputedRects();
      let _totalWidth = _rects?.width || 0;
      let _len = this.data.length;
      let _blockWidth = _totalWidth / _len;
      let _left = index * _blockWidth;

      if (index === _len -1){
        _left = _totalWidth;
      }

      // this.$set(this.rrect, 'left', _left);
      this.$set(this.rrect, 'clickedLeft', _left);
    },
    async getBlockWidth() {
      let _rects = this._getComputedRects();
      let _totalWidth = _rects && _rects.width || 0;
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
      this._getComputedElement();
      this.recalculate();
    },
    debounceRecalculate:lodash_func.debounce((self)=>{
      self.setPercentByIndex(self.dataIndex);
    },100),
    recalculate(){
      this.debounceRecalculate(this);
    },
    tagformatter(v) {
      let _v;
      let r = this.rrect.width;
      let _m = moment(v);
      if (r >= 300) {
        if (r < 600) {
          _v = _m.format("HH");
        } else if (r < 768) {
          _v = moment(v).format("DD日 HH时");
        } else if (r < 960) {
          _v = _m.format("MM-DD HH时");
        } else if (r < 1024) {
          _v = _m.format("MM-DD HH:MM");
        } else if (r < 1140) {
          _v = _m.format("YYYY-MM-DD HH");
        }
      } else {
        _v = "";
      }
      return _v;
    },
    dispose() {
      this.removeEvents();
      if (this.interval) {
        clearInterval(this.interval);
      }
    }
  },
  filters: {
    dataExists(v) {
      return v || '暂无数据';
    }
  },
  beforeDestroy() {
    this.dispose();
  },
};
</script>

<style lang="scss" scoped>
@import "css/progress-bar_v1";
@import "css/progress-bar_v2";
</style>
