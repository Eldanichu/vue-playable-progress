<template>
  <div
      class="d-progress-bar"
      :style="_computedStyles"

  >
    <div
        class="progress-bar"
        :id="id"
        @click="eclick"
        @mousemove="emove"
        @mouseover="ehover"
        @mouseleave="eleave"
    >
      <div
          class="hover-fill"
          :style="_hoverStyles"
      />
      <div
          class="played-fill"
          :style="_playedStyles"
      />
      <div class="tags">
        <template v-for="(block,index) in blocks">
          <span
              class="tag__item"
              :style="{
              width:block.start +'px'
            }"
              :key="block.start + Math.random()"
          >
            {{ tagformatter(data[index]) }}
          </span>
        </template>
      </div>
    </div>
    <!--    hover time tip-->
    <div
        class="timecode time-code ghost-timecode"
        :style="hoverTipStyles"
        v-show="isHover"
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
      <div
          :class="['box-details']"
      >
        <slot name="boxInfo"/>
      </div>
    </div>

    <!--    debug button-->
    <button
        @click="playbar"
        style="margin: 30px"
    >
      play
    </button>
    <!--    debug info-->
    <div>isHover:{{ isHover }}</div>
    <div>hoverData: {{ data[floatIndex] }}</div>
    <div>hoverIndex: {{ floatIndex }}</div>
    <div>clickIndex {{ dataIndex }}</div>
  </div>
</template>

<script>
import moment from 'moment';

export default {
  name: "ProgressBar",
  props: {
    id: {
      type: String,
      default: '$$progress'
    },
    width: {
      type: [Number, String],
      default: 485
    },
    data: {
      type: Array,
      default: () => {
        return [
          '2019-01-01 00:00',
          '2019-01-01 01:00',
          '2019-01-01 02:00',
          '2019-01-01 03:00',
          '2019-01-01 04:00',
          '2019-01-01 05:00',
          '2019-01-01 06:00',
          '2019-01-01 07:00',
          '2019-01-01 08:00',
          '2019-01-01 09:00',
          '2019-01-01 10:00',
        ]
      }
    }
  },
  data() {
    return {
      isHover: false,
      isPlaying: false,
      rrect: {
        width: 0,
        left: 0,
        clickedLeft: 0
      },
      dataIndex: 0,
      floatIndex: 0,
      interval: null,
      blocks: []
    }
  },
  computed: {
    _computedStyles() {
      let _style = {}
      _style['width'] = this.get_width()
      return _style
    },
    _hoverStyles() {
      return {
        width: this.isHover ? this.rrect.left + 'px' : 0,
        opacity: ~~!!this.isHover,
      }
    },
    hoverTipStyles() {
      let _style = {}
      _style['left'] = this.rrect.left + 'px'
      return _style
    },
    fixedTipStyles() {
      let _style = {}
      _style['left'] = this.rrect.clickedLeft + 'px'
      return _style
    },
    _playedStyles() {
      return {
        width: this.rrect.clickedLeft + 'px',
        transition: `width linear ${(this.isPlaying ? '0s' : '.2s')}, opacity linear .1s`
      }
    }
  },
  mounted() {
    this.getBlockWidth()
    document.body.onresize = () => {
      this.getBlockWidth()
    }
  },
  methods: {
    async emove(e) {
      if (!this.isHover) return;
      let _prect = await this._getComputedRects()
      let _pos = e.pageX - _prect.left
      this.rrect.left = _pos < 0 ? 0 : _pos;
      let _el = await this._getComputedElement();
      this.floatIndex = _el.floatIndex
    },
    async eclick(e) {
      let _prect = await this._getComputedRects();
      let _pos = e.pageX - _prect.left
      this.rrect.clickedLeft = _pos < 0 ? 0 : _pos;
      let _ele = await this._getComputedElement();
      this.dataIndex = _ele.clickIndex;
    },
    ehover() {
      this.isHover = true;
    },
    async eleave() {
      this.isHover = false;
      this.$set(this.rrect, 'left', 0)
      this.floatIndex = 0
    },
    playbar() {
      this.isPlaying = !this.isPlaying
      if (this.isPlaying) {
        this.progress_state_update();
      } else {
        clearInterval(this.interval);
        this.interval = 0
      }
    },
    progress_state_update() {
      let timer, _ele, _maxW;
      clearInterval(this.interval);
      this.interval = setInterval(async () => {
        _maxW = await this._getComputedRects()
        if (this.rrect.clickedLeft >= _maxW.width) {
          this.rrect.clickedLeft = 0
        }
        if (!timer) {
          timer = setTimeout(async () => {
            clearTimeout(timer);
            timer = 0;
            _ele = await this._getComputedElement();
            this.dataIndex = _ele.clickIndex
          }, 300)
        }
        ++this.rrect.clickedLeft
      }, 25)
    },
    get_width() {
      if (typeof this.width === 'string') {
        return parseFloat(this.width) + '%'
      } else if (typeof this.width === 'number') {
        return parseFloat(this.width) + 'px';
      }
    },
    async _getComputedRects() {
      await this.$nextTick()
      let _$dom = document.getElementById(this.id);
      return _$dom.getClientRects()[0]
    },
    async _getComputedElement() {
      let _totalWidth = (await this._getComputedRects()).width;
      let _len = this.data.length;
      let _blockWidth = _totalWidth / _len;
      let widthPercent = this.rrect.left / _totalWidth;
      let widthPercent_click = this.rrect.clickedLeft / _totalWidth;
      let _dataIndex = this.dataIndex

      let fi = _len * widthPercent
      let fi_click = _len * widthPercent_click
      let round_fi = Math.round(fi - 0.5).toFixed(0)
      let round_fi_click = Math.round(fi_click - 0.5).toFixed(0)
      return {
        blockWidth: _blockWidth,
        widthPercent: widthPercent,
        indexPercent: _dataIndex / _len,
        floatIndex: round_fi < 0 ? 0 : round_fi,
        clickIndex: round_fi_click < 0 ? 0 : round_fi_click,
      }
    },
    async getBlockWidth() {
      let _totalWidth = (await this._getComputedRects()).width;
      this.rrect.width = _totalWidth;

      let _len = this.data.length;
      let _blockWidth = _totalWidth / _len;
      let _blocks = [];
      for (let i = 0; i < _len; ++i) {
        _blocks.push({
          start: _blockWidth,
        })
      }
      this.blocks = _blocks
    },
    tagformatter(v) {
      let _v;
      let r = this.rrect.width;
      let _m = moment(v)
      if (r >= 300) {
        if (r < 600) {
          _v = _m.format('HH时')
        } else if (r < 768) {
          _v = moment(v).format('DD日 HH时')
        } else if (r < 960) {
          _v = _m.format('MM-DD HH时')
        } else if (r < 1024) {
          _v = _m.format('MM-DD HH:MM')
        } else if (r < 1140) {
          _v = _m.format('YYYY-MM-DD HH')
        }
      } else {
        _v = ''
      }
      return _v;
    }
  }
}
</script>

<style lang="scss" scoped>
$tag-text-color: white;
$tag-border-color: white;

$progress-bar-color: #8d8d8d;
$played-fill-color: rgba(255, 255, 255, 1);
$hover-fill-color: rgb(226, 211, 174);

.d-progress-bar {

  .progress-bar {
    position: relative;
    height: 8px;
    background-color: $progress-bar-color;
    border-radius: 3px;

    .hover-fill {
      @extend .progress-bar;
      position: absolute;
      top: 0;
      background-color: $hover-fill-color;
      transition: width linear .2s, opacity linear .1s;
    }

    .played-fill {
      @extend .hover-fill;
      position: absolute;
      top: 0;
      background-color: $played-fill-color;
    }

    .tags {
      position: relative;
      top: 100%;
      text-align: center;
      font-size: 12px;

      .tag__item {
        display: inline-block;
        border-right: 1px solid $tag-border-color;
        color: $tag-text-color;

        &:last-child {
          border-right: none;
        }
      }
    }
  }

  .timecode {
    transition: .2s opacity .2s, left linear .05s;
    font-size: 12px;
    position: absolute;
    display: block;
    box-sizing: border-box;
    top: -2.4em;


    .box {
      height: 1.8em;
      box-sizing: border-box;
      padding: .1em .8em;
      white-space: nowrap;
      text-align: center;
      display: table-cell;
      vertical-align: middle;
      border-radius: .5em;

      &::before {
        cursor: default;
        top: 100%;
        left: 2em;
        content: ' ';
        height: 0;
        width: 0;
        position: absolute;
        border: .5em solid transparent;
      }
    }

    &.main-timecode {
      font-size: 12px;
      margin-left: -2.7em;

      .box {
        cursor: default;
        transition: .2s opacity .2s, left linear .05s;
        position: relative;
        background-color: #d49500;
        color: white;
        box-shadow: 0 0 4px 0 black;

        &::before {
          border-top-color: #d49500;
        }
      }
    }

    &.ghost-timecode {
      display: inline-block;
      opacity: 1;
      pointer-events: none;
      margin-left: -2.7em;
      z-index: 1;
      transition: .3s opacity .2s, left linear .05s, top linear .05s;
      font-size: 12px;

      .box {
        box-shadow: none;
        cursor: pointer;
        color: white;
        background-color: rgba(68, 65, 65, 0.84);

        &::before {
          border-top-color: rgba(68, 65, 65, 0.84);
        }
      }
    }

    .box-details {
      transition: .3s opacity .2s, left linear .3s;
      display: block;
      min-height: 20px;
      min-width: 110px;
      border-radius: .5em;
      position: absolute;
      bottom: 100%;
      margin-bottom: 5px;
      padding: .1em .8em;

      &.light {
        color: black;
        background-color: rgba(255, 255, 255, 0.85);
      }

      &.dark {
        color: white;
      }
    }


  }
}
</style>