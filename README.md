# vue-playable-progress
##version:0.2
```
props:
  // theme
  v: {
      type: String,
      default: 'v2'
    },
    // dom id
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
    bInterval: {
      type: [String, Number],
      default: 300
    },
    loop: {
      type: Boolean,
      default: true
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
```