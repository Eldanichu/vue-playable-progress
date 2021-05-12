'use strict';function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  var _i = arr && (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]);

  if (_i == null) return;
  var _arr = [];
  var _n = true;
  var _d = false;

  var _s, _e;

  try {
    for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}var script = /*#__PURE__*/{
  name: 'VueProgress',
  // vue component name
  props: {
    id: {
      type: String,
      default: "$$progress"
    },
    width: {
      type: [Number, String],
      default: 485
    },
    position: {
      type: String,
      default: 'bottom-left'
    },
    offset: {
      type: Array,
      default: function _default() {
        return [600, 40];
      }
    },
    draws: {
      type: Object,
      default: function _default() {
        return {};
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
      default: function _default() {
        return [];
      }
    }
  },
  data: function data() {
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
    };
  },
  computed: {
    _isRight: function _isRight() {
      return this.position.match('right');
    },
    _isTop: function _isTop() {
      return this.position.match('top');
    },
    _computedStyles: function _computedStyles() {
      var _style = {};
      _style["width"] = this.get_width();

      var _r = this._isRight ? 'right' : 'left',
          _t = this._isTop ? 'top' : 'bottom';

      var dw = this.draws[_r] && this.draws[_r].show ? 0 : -380;
      _style[_r] = "".concat(dw + this.offset[0], "px");
      _style[_t] = "".concat(this.offset[1], "px");
      return _style;
    },
    _hoverStyles: function _hoverStyles() {
      return {
        width: this.isHover ? this.rrect.left + "px" : 0,
        opacity: ~~!!this.isHover
      };
    },
    hoverTipStyles: function hoverTipStyles() {
      var _style = {};
      _style["left"] = this.rrect.left + "px";
      return _style;
    },
    fixedTipStyles: function fixedTipStyles() {
      var _style = {};
      _style["left"] = this.rrect.clickedLeft + "px";
      return _style;
    },
    _playedStyles: function _playedStyles() {
      return {
        width: this.rrect.clickedLeft + "px",
        transition: "width linear ".concat(this.isPlaying ? "0s" : ".2s", ", opacity linear .1s")
      };
    }
  },
  mounted: function mounted() {
    var _this = this;

    this.$nextTick(function () {
      _this.getBlockWidth();

      document.body.onresize = function () {
        _this.getBlockWidth();
      };
    });
  },
  watch: {
    dataIndex: function dataIndex(v) {
      this.$emit('bPlaying', {
        state: this.isPlaying,
        index: v
      });
    }
  },
  methods: {
    emove: function emove(e) {
      if (!this.isHover) return;

      var _prect = this._getComputedRects();

      var _pos = e.pageX - _prect.left;

      this.rrect.left = _pos < 0 ? 0 : _pos;

      var _el = this._getComputedElement();

      this.floatIndex = _el.floatIndex;
      this.$emit('bHover', {
        index: this.floatIndex
      });
    },
    eclick: function eclick(e) {
      var _prect = this._getComputedRects();

      var _pos = e.pageX - _prect.left;

      this.rrect.clickedLeft = _pos < 0 ? 0 : _pos;

      var _ele = this._getComputedElement();

      this.dataIndex = _ele.clickIndex;
      this.$emit('bClick', {
        index: this.dataIndex
      });
    },
    ehover: function ehover() {
      this.isHover = true;
    },
    eleave: function eleave() {
      this.isHover = false;
      this.$set(this.rrect, "left", 0);
      this.floatIndex = 0;
    },
    progress_state_update: function progress_state_update() {
      var _this2 = this;

      var _ele;

      this.interval = setInterval(function () {
        if (_this2.dataIndex < _this2.data.length - 1) {
          _ele = _this2._getComputedElement();
          ++_this2.dataIndex;
          _this2.rrect.clickedLeft = _this2.dataIndex * _ele.blockWidth;
        } else {
          if (_this2.dataIndex === _this2.data.length - 1) {
            _ele = _this2._getComputedElement();
            _this2.rrect.clickedLeft = _this2.data.length * _ele.blockWidth;
          }

          clearInterval(_this2.interval);
          _this2.isPlaying = false;
        }
      }, this.bInterval * 1000);
    },
    playPause: function playPause() {
      this.isPlaying = !this.isPlaying;

      if (this.isPlaying) {
        this.progress_state_update();
      } else {
        clearInterval(this.interval);
        this.$emit('bStopped', {
          state: false,
          index: this.dataIndex
        });
        this.interval = 0;
      }
    },
    get_width: function get_width() {
      if (typeof this.width === "string") {
        return parseFloat(this.width) + "%";
      } else if (typeof this.width === "number") {
        return parseFloat(this.width) + "px";
      }
    },
    _getComputedRects: function _getComputedRects() {
      var _$dom = document.getElementById(this.id);

      return _$dom.getClientRects()[0];
    },
    _getComputedElement: function _getComputedElement() {
      var _totalWidth = this._getComputedRects().width;

      var _len = this.data.length;

      var _blockWidth = _totalWidth / _len;

      var widthPercent = this.rrect.left / _totalWidth;
      var widthPercent_click = this.rrect.clickedLeft / _totalWidth;
      var _dataIndex = this.dataIndex;
      var fi = _len * widthPercent;
      var fi_click = _len * widthPercent_click;
      var round_fi = Math.round(fi - 0.5).toFixed(0);
      var round_fi_click = Math.round(fi_click - 0.5).toFixed(0);
      return {
        blockWidth: _blockWidth,
        widthPercent: widthPercent,
        indexPercent: _dataIndex / _len,
        floatIndex: round_fi < 0 ? 0 : round_fi,
        clickIndex: round_fi_click < 0 ? 0 : round_fi_click
      };
    },
    getBlockWidth: function getBlockWidth() {
      var _totalWidth = this._getComputedRects().width;

      this.rrect.width = _totalWidth;
      var _len = this.data.length;

      var _blockWidth = _totalWidth / _len;

      var _blocks = [];

      for (var i = 0; i < _len; ++i) {
        _blocks.push({
          start: _blockWidth
        });
      }

      this.blocks = _blocks;
    }
  }
};function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
    if (typeof shadowMode !== 'boolean') {
        createInjectorSSR = createInjector;
        createInjector = shadowMode;
        shadowMode = false;
    }
    // Vue.extend constructor export interop.
    const options = typeof script === 'function' ? script.options : script;
    // render functions
    if (template && template.render) {
        options.render = template.render;
        options.staticRenderFns = template.staticRenderFns;
        options._compiled = true;
        // functional template
        if (isFunctionalTemplate) {
            options.functional = true;
        }
    }
    // scopedId
    if (scopeId) {
        options._scopeId = scopeId;
    }
    let hook;
    if (moduleIdentifier) {
        // server build
        hook = function (context) {
            // 2.3 injection
            context =
                context || // cached call
                    (this.$vnode && this.$vnode.ssrContext) || // stateful
                    (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
            // 2.2 with runInNewContext: true
            if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                context = __VUE_SSR_CONTEXT__;
            }
            // inject component styles
            if (style) {
                style.call(this, createInjectorSSR(context));
            }
            // register component module identifier for async chunk inference
            if (context && context._registeredComponents) {
                context._registeredComponents.add(moduleIdentifier);
            }
        };
        // used by ssr in case component is cached and beforeCreate
        // never gets called
        options._ssrRegister = hook;
    }
    else if (style) {
        hook = shadowMode
            ? function (context) {
                style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
            }
            : function (context) {
                style.call(this, createInjector(context));
            };
    }
    if (hook) {
        if (options.functional) {
            // register for functional component in vue file
            const originalRender = options.render;
            options.render = function renderWithStyleInjection(h, context) {
                hook.call(context);
                return originalRender(h, context);
            };
        }
        else {
            // inject component registration as beforeCreate hook
            const existing = options.beforeCreate;
            options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
    }
    return script;
}function createInjectorSSR(context) {
    if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__;
    }
    if (!context)
        return () => { };
    if (!('styles' in context)) {
        context._styles = context._styles || {};
        Object.defineProperty(context, 'styles', {
            enumerable: true,
            get: () => context._renderStyles(context._styles)
        });
        context._renderStyles = context._renderStyles || renderStyles;
    }
    return (id, style) => addStyle(id, style, context);
}
function addStyle(id, css, context) {
    const group = css.media || 'default' ;
    const style = context._styles[group] || (context._styles[group] = { ids: [], css: '' });
    if (!style.ids.includes(id)) {
        style.media = css.media;
        style.ids.push(id);
        let code = css.source;
        style.css += code + '\n';
    }
}
function renderStyles(styles) {
    let css = '';
    for (const key in styles) {
        const style = styles[key];
        css +=
            '<style data-vue-ssr-id="' +
                Array.from(style.ids).join(' ') +
                '"' +
                (style.media ? ' media="' + style.media + '"' : '') +
                '>' +
                style.css +
                '</style>';
    }
    return css;
}/* script */
var __vue_script__ = script;
/* template */

var __vue_render__ = function __vue_render__() {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "d-progress-bar",
    style: _vm._computedStyles
  }, [_vm._ssrNode("<div class=\"play-pause\" data-v-49310845><div class=\"action-btn\" data-v-49310845><i" + _vm._ssrClass(null, ['fa', _vm.isPlaying ? 'fa-pause-circle-o' : 'fa-play-circle-o']) + " data-v-49310845></i></div></div> <div" + _vm._ssrAttr("id", _vm.id) + " class=\"progress-bar\" data-v-49310845><div class=\"hover-fill\"" + _vm._ssrStyle(null, _vm._hoverStyles, null) + " data-v-49310845></div> <div class=\"played-fill\"" + _vm._ssrStyle(null, _vm._playedStyles, null) + " data-v-49310845></div> " + (_vm.tags ? "<div class=\"tags\" data-v-49310845>" + _vm._ssrList(_vm.blocks, function (block, index) {
    return "<span class=\"tag__item\"" + _vm._ssrStyle(null, {
      width: block.start + 'px'
    }, null) + " data-v-49310845></span>";
  }) + "</div>" : "<!---->") + "</div> "), _vm._ssrNode("<div class=\"timecode time-code ghost-timecode\"" + _vm._ssrStyle(null, _vm.hoverTipStyles, {
    display: _vm.isHover && _vm.hoverTip && _vm.data.length ? '' : 'none'
  }) + " data-v-49310845>", "</div>", [_vm._ssrNode("<div class=\"box\" data-v-49310845>", "</div>", [_vm._ssrNode(_vm._ssrEscape("\n      " + _vm._s(_vm.data[_vm.floatIndex]) + "\n      ")), _vm._t("hover-box")], 2)]), _vm._ssrNode(" "), _vm._ssrNode("<div class=\"timecode main-timecode\"" + _vm._ssrStyle(null, _vm.fixedTipStyles, {
    display: _vm.data.length ? '' : 'none'
  }) + " data-v-49310845>", "</div>", [_vm._ssrNode("<div class=\"box\" data-v-49310845>", "</div>", [_vm._ssrNode(_vm._ssrEscape("\n      " + _vm._s(_vm.data[_vm.dataIndex]) + "\n      ")), _vm._t("box")], 2), _vm._ssrNode(" "), _vm._ssrNode("<div" + _vm._ssrClass(null, ['box-details']) + " data-v-49310845>", "</div>", [_vm._t("boxInfo")], 2)], 2)], 2);
};

var __vue_staticRenderFns__ = [];
/* style */

var __vue_inject_styles__ = function __vue_inject_styles__(inject) {
  if (!inject) return;
  inject("data-v-49310845_0", {
    source: ".d-progress-bar[data-v-49310845]{position:absolute}.d-progress-bar .play-pause[data-v-49310845]{position:absolute;left:-10%;top:-17px;z-index:20;color:#fff}.d-progress-bar .play-pause .action-btn[data-v-49310845]{font-size:1.8rem}.d-progress-bar .progress-bar[data-v-49310845],.d-progress-bar .progress-bar .hover-fill[data-v-49310845],.d-progress-bar .progress-bar .played-fill[data-v-49310845]{position:relative;height:8px;background-color:#8d8d8d;border-radius:3px}.d-progress-bar .progress-bar .hover-fill[data-v-49310845],.d-progress-bar .progress-bar .played-fill[data-v-49310845]{position:absolute;top:0;background-color:#e2d3ae;transition:width linear .1s,opacity linear .1s}.d-progress-bar .progress-bar .played-fill[data-v-49310845]{position:absolute;top:0;background-color:#fff}.d-progress-bar .progress-bar .tags[data-v-49310845]{position:relative;top:100%;text-align:center;font-size:12px}.d-progress-bar .progress-bar .tags .tag__item[data-v-49310845]{display:inline-block;border-right:1px solid #fff;color:#fff}.d-progress-bar .progress-bar .tags .tag__item[data-v-49310845]:last-child{border-right:none}.d-progress-bar .timecode[data-v-49310845]{font-size:12px;position:absolute;display:block;box-sizing:border-box;top:-2.4em}.d-progress-bar .timecode .box[data-v-49310845]{height:1.8em;box-sizing:border-box;padding:.1em .8em;white-space:nowrap;text-align:center;display:table-cell;vertical-align:middle;border-radius:.5em}.d-progress-bar .timecode .box[data-v-49310845]::before{cursor:default;top:100%;left:2em;content:\" \";height:0;width:0;position:absolute;border:.5em solid transparent}.d-progress-bar .timecode.main-timecode[data-v-49310845]{font-size:12px;margin-left:-2.7em}.d-progress-bar .timecode.main-timecode .box[data-v-49310845]{cursor:default;position:relative;background-color:#d49500;color:#fff;box-shadow:0 0 4px 0 #000}.d-progress-bar .timecode.main-timecode .box[data-v-49310845]::before{border-top-color:#d49500}.d-progress-bar .timecode.ghost-timecode[data-v-49310845]{display:inline-block;opacity:1;pointer-events:none;margin-left:-2.7em;z-index:1;font-size:12px}.d-progress-bar .timecode.ghost-timecode .box[data-v-49310845]{box-shadow:none;cursor:pointer;color:#fff;background-color:rgba(68,65,65,.84)}.d-progress-bar .timecode.ghost-timecode .box[data-v-49310845]::before{border-top-color:rgba(68,65,65,.84)}.d-progress-bar .timecode .box-details[data-v-49310845]{transition:.3s opacity .2s,left linear .3s;display:block;min-height:20px;min-width:110px;border-radius:.5em;position:absolute;bottom:100%;margin-bottom:5px;padding:.1em .8em}.d-progress-bar .timecode .box-details.light[data-v-49310845]{color:#000;background-color:rgba(255,255,255,.85)}.d-progress-bar .timecode .box-details.dark[data-v-49310845]{color:#fff}",
    map: undefined,
    media: undefined
  });
};
/* scoped */


var __vue_scope_id__ = "data-v-49310845";
/* module identifier */

var __vue_module_identifier__ = "data-v-49310845";
/* functional template */

var __vue_is_functional_template__ = false;
/* style inject shadow dom */

var __vue_component__ = /*#__PURE__*/normalizeComponent({
  render: __vue_render__,
  staticRenderFns: __vue_staticRenderFns__
}, __vue_inject_styles__, __vue_script__, __vue_scope_id__, __vue_is_functional_template__, __vue_module_identifier__, false, undefined, createInjectorSSR, undefined);// Import vue component
// IIFE injects install function into component, allowing component
// to be registered via Vue.use() as well as Vue.component(),

var component = /*#__PURE__*/(function () {
  // Get component instance
  var installable = __vue_component__; // Attach install function executed by Vue.use()

  installable.install = function (Vue) {
    Vue.component('VueProgress', installable);
  };

  return installable;
})(); // It's possible to expose named exports when writing components that can
// also be used as directives, etc. - eg. import { RollupDemoDirective } from 'rollup-demo';
// export const RollupDemoDirective = directive;
var namedExports=/*#__PURE__*/Object.freeze({__proto__:null,'default': component});// only expose one global var, with named exports exposed as properties of
// that global var (eg. plugin.namedExport)

Object.entries(namedExports).forEach(function (_ref) {
  var _ref2 = _slicedToArray(_ref, 2),
      exportName = _ref2[0],
      exported = _ref2[1];

  if (exportName !== 'default') component[exportName] = exported;
});module.exports=component;