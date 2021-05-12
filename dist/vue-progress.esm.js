var script = /*#__PURE__*/{
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
      default: () => {
        return [600, 40];
      }
    },
    draws: {
      type: Object,
      default: () => {
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
      default: () => {
        return [];
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
    };
  },

  computed: {
    _isRight() {
      return this.position.match('right');
    },

    _isTop() {
      return this.position.match('top');
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
        opacity: ~~!!this.isHover
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
        transition: `width linear ${this.isPlaying ? "0s" : ".2s"}, opacity linear .1s`
      };
    }

  },

  mounted() {
    this.$nextTick(() => {
      this.getBlockWidth();

      document.body.onresize = () => {
        this.getBlockWidth();
      };
    });
  },

  watch: {
    dataIndex(v) {
      this.$emit('bPlaying', {
        state: this.isPlaying,
        index: v
      });
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
      this.$emit('bHover', {
        index: this.floatIndex
      });
    },

    eclick(e) {
      let _prect = this._getComputedRects();

      let _pos = e.pageX - _prect.left;

      this.rrect.clickedLeft = _pos < 0 ? 0 : _pos;

      let _ele = this._getComputedElement();

      this.dataIndex = _ele.clickIndex;
      this.$emit('bClick', {
        index: this.dataIndex
      });
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

      this.interval = setInterval(() => {
        if (this.dataIndex < this.data.length - 1) {
          _ele = this._getComputedElement();
          ++this.dataIndex;
          this.rrect.clickedLeft = this.dataIndex * _ele.blockWidth;
        } else {
          if (this.dataIndex === this.data.length - 1) {
            _ele = this._getComputedElement();
            this.rrect.clickedLeft = this.data.length * _ele.blockWidth;
          }

          clearInterval(this.interval);
          this.isPlaying = false;
        }
      }, this.bInterval * 1000);
    },

    playPause() {
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
        clickIndex: round_fi_click < 0 ? 0 : round_fi_click
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
          start: _blockWidth
        });
      }

      this.blocks = _blocks;
    }

  }
};

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
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
}

const isOldIE = typeof navigator !== 'undefined' &&
    /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
function createInjector(context) {
    return (id, style) => addStyle(id, style);
}
let HEAD;
const styles = {};
function addStyle(id, css) {
    const group = isOldIE ? css.media || 'default' : id;
    const style = styles[group] || (styles[group] = { ids: new Set(), styles: [] });
    if (!style.ids.has(id)) {
        style.ids.add(id);
        let code = css.source;
        if (css.map) {
            // https://developer.chrome.com/devtools/docs/javascript-debugging
            // this makes source maps inside style tags work properly in Chrome
            code += '\n/*# sourceURL=' + css.map.sources[0] + ' */';
            // http://stackoverflow.com/a/26603875
            code +=
                '\n/*# sourceMappingURL=data:application/json;base64,' +
                    btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) +
                    ' */';
        }
        if (!style.element) {
            style.element = document.createElement('style');
            style.element.type = 'text/css';
            if (css.media)
                style.element.setAttribute('media', css.media);
            if (HEAD === undefined) {
                HEAD = document.head || document.getElementsByTagName('head')[0];
            }
            HEAD.appendChild(style.element);
        }
        if ('styleSheet' in style.element) {
            style.styles.push(code);
            style.element.styleSheet.cssText = style.styles
                .filter(Boolean)
                .join('\n');
        }
        else {
            const index = style.ids.size - 1;
            const textNode = document.createTextNode(code);
            const nodes = style.element.childNodes;
            if (nodes[index])
                style.element.removeChild(nodes[index]);
            if (nodes.length)
                style.element.insertBefore(textNode, nodes[index]);
            else
                style.element.appendChild(textNode);
        }
    }
}

/* script */
const __vue_script__ = script;
/* template */

var __vue_render__ = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "d-progress-bar",
    style: _vm._computedStyles
  }, [_c('div', {
    staticClass: "play-pause"
  }, [_c('div', {
    staticClass: "action-btn"
  }, [_c('i', {
    on: {
      "click": _vm.playPause
    }
  }, [!_vm.isPlaying ? _c('svg', {
    staticClass: "icon",
    attrs: {
      "t": "1620489165504",
      "viewBox": "0 0 1024 1024",
      "version": "1.1",
      "xmlns": "http://www.w3.org/2000/svg",
      "p-id": "1129",
      "width": "200",
      "height": "200"
    }
  }, [_c('path', {
    attrs: {
      "d": "M512 0C229.376 0 0 229.376 0 512s229.376 512 512 512 512-229.376 512-512S794.624 0 512 0z m189.952 537.6l-261.12 150.528c-17.92 10.24-39.936-2.56-39.936-23.04V364.032c0-20.48 22.528-33.28 39.936-23.04l261.12 150.528c17.92 10.24 17.92 35.84 0 46.08z",
      "p-id": "1130"
    }
  })]) : _c('svg', {
    staticClass: "icon",
    attrs: {
      "t": "1620489305380",
      "viewBox": "0 0 1024 1024",
      "version": "1.1",
      "xmlns": "http://www.w3.org/2000/svg",
      "p-id": "1862",
      "width": "200",
      "height": "200"
    }
  }, [_c('path', {
    attrs: {
      "d": "M510.293333 139.377778a369.777778 369.777778 0 1 0 369.777778 369.777778 369.777778 369.777778 0 0 0-369.777778-369.777778z m110.933334 480.711111h-224.711111v-224.711111h224.711111z",
      "p-id": "1863"
    }
  })])])])]), _vm._v(" "), _c('div', {
    staticClass: "progress-bar",
    attrs: {
      "id": _vm.id
    },
    on: {
      "click": _vm.eclick,
      "mousemove": _vm.emove,
      "mouseover": _vm.ehover,
      "mouseleave": _vm.eleave
    }
  }, [_c('div', {
    staticClass: "hover-fill",
    style: _vm._hoverStyles
  }), _vm._v(" "), _c('div', {
    staticClass: "played-fill",
    style: _vm._playedStyles
  }), _vm._v(" "), _vm.tags ? _c('div', {
    staticClass: "tags"
  }, [_vm._l(_vm.blocks, function (block, index) {
    return [_c('span', {
      key: block.start + Math.random(),
      staticClass: "tag__item",
      style: {
        width: block.start + 'px'
      }
    })];
  })], 2) : _vm._e()]), _vm._v(" "), _c('div', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: _vm.isHover && _vm.hoverTip && _vm.data.length,
      expression: "isHover && hoverTip && data.length"
    }],
    staticClass: "timecode time-code ghost-timecode",
    style: _vm.hoverTipStyles
  }, [_c('div', {
    staticClass: "box"
  }, [_vm._v("\n      " + _vm._s(_vm.data[_vm.floatIndex]) + "\n      "), _vm._t("hover-box")], 2)]), _vm._v(" "), _c('div', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: _vm.data.length,
      expression: "data.length"
    }],
    staticClass: "timecode main-timecode",
    style: _vm.fixedTipStyles
  }, [_c('div', {
    staticClass: "box"
  }, [_vm._v("\n      " + _vm._s(_vm.data[_vm.dataIndex]) + "\n      "), _vm._t("box")], 2), _vm._v(" "), _c('div', {
    class: ['box-details']
  }, [_vm._t("boxInfo")], 2)])]);
};

var __vue_staticRenderFns__ = [];
/* style */

const __vue_inject_styles__ = function (inject) {
  if (!inject) return;
  inject("data-v-442fe296_0", {
    source: ".d-progress-bar[data-v-442fe296]{position:absolute}.d-progress-bar .play-pause[data-v-442fe296]{position:absolute;left:-10%;top:-17px;z-index:20;color:#fff}.d-progress-bar .play-pause .action-btn .icon[data-v-442fe296]{width:2.5rem;height:2.5rem}.d-progress-bar .progress-bar[data-v-442fe296],.d-progress-bar .progress-bar .hover-fill[data-v-442fe296],.d-progress-bar .progress-bar .played-fill[data-v-442fe296]{position:relative;height:8px;background-color:#8d8d8d;border-radius:3px}.d-progress-bar .progress-bar .hover-fill[data-v-442fe296],.d-progress-bar .progress-bar .played-fill[data-v-442fe296]{position:absolute;top:0;background-color:#e2d3ae;transition:width linear .1s,opacity linear .1s}.d-progress-bar .progress-bar .played-fill[data-v-442fe296]{position:absolute;top:0;background-color:#fff}.d-progress-bar .progress-bar .tags[data-v-442fe296]{position:relative;top:100%;text-align:center;font-size:12px}.d-progress-bar .progress-bar .tags .tag__item[data-v-442fe296]{display:inline-block;border-right:1px solid #fff;color:#fff}.d-progress-bar .progress-bar .tags .tag__item[data-v-442fe296]:last-child{border-right:none}.d-progress-bar .timecode[data-v-442fe296]{font-size:12px;position:absolute;display:block;box-sizing:border-box;top:-2.4em}.d-progress-bar .timecode .box[data-v-442fe296]{height:1.8em;box-sizing:border-box;padding:.1em .8em;white-space:nowrap;text-align:center;display:table-cell;vertical-align:middle;border-radius:.5em}.d-progress-bar .timecode .box[data-v-442fe296]::before{cursor:default;top:100%;left:2em;content:\" \";height:0;width:0;position:absolute;border:.5em solid transparent}.d-progress-bar .timecode.main-timecode[data-v-442fe296]{font-size:12px;margin-left:-2.7em}.d-progress-bar .timecode.main-timecode .box[data-v-442fe296]{cursor:default;position:relative;background-color:#d49500;color:#fff;box-shadow:0 0 4px 0 #000}.d-progress-bar .timecode.main-timecode .box[data-v-442fe296]::before{border-top-color:#d49500}.d-progress-bar .timecode.ghost-timecode[data-v-442fe296]{display:inline-block;opacity:1;pointer-events:none;margin-left:-2.7em;z-index:1;font-size:12px}.d-progress-bar .timecode.ghost-timecode .box[data-v-442fe296]{box-shadow:none;cursor:pointer;color:#fff;background-color:rgba(68,65,65,.84)}.d-progress-bar .timecode.ghost-timecode .box[data-v-442fe296]::before{border-top-color:rgba(68,65,65,.84)}.d-progress-bar .timecode .box-details[data-v-442fe296]{transition:.3s opacity .2s,left linear .3s;display:block;min-height:20px;min-width:110px;border-radius:.5em;position:absolute;bottom:100%;margin-bottom:5px;padding:.1em .8em}.d-progress-bar .timecode .box-details.light[data-v-442fe296]{color:#000;background-color:rgba(255,255,255,.85)}.d-progress-bar .timecode .box-details.dark[data-v-442fe296]{color:#fff}",
    map: undefined,
    media: undefined
  });
};
/* scoped */


const __vue_scope_id__ = "data-v-442fe296";
/* module identifier */

const __vue_module_identifier__ = undefined;
/* functional template */

const __vue_is_functional_template__ = false;
/* style inject SSR */

/* style inject shadow dom */

const __vue_component__ = /*#__PURE__*/normalizeComponent({
  render: __vue_render__,
  staticRenderFns: __vue_staticRenderFns__
}, __vue_inject_styles__, __vue_script__, __vue_scope_id__, __vue_is_functional_template__, __vue_module_identifier__, false, createInjector, undefined, undefined);

// Import vue component
// IIFE injects install function into component, allowing component
// to be registered via Vue.use() as well as Vue.component(),

var entry_esm = /*#__PURE__*/(() => {
  // Get component instance
  const installable = __vue_component__; // Attach install function executed by Vue.use()

  installable.install = Vue => {
    Vue.component('VueProgress', installable);
  };

  return installable;
})(); // It's possible to expose named exports when writing components that can
// also be used as directives, etc. - eg. import { RollupDemoDirective } from 'rollup-demo';
// export const RollupDemoDirective = directive;

export default entry_esm;
