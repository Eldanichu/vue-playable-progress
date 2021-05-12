# vue-playable-progress
##version:0.11
```
example:
    npm i @eldanorg/vue-progress
    
    import VueProgress from '@eldanorg/vue-progress'
    Vue.use(VueProgress)
```
```
events:
    bClick:{index:Number}
    bStopped:{state:Boolean | index:Number}
    bPlaying:{state:Boolean | index:Number}
```
```
props:
    //dom Element id
    id: {
      type: String,
      default: "$$progress",
    },
    data: {
      type: Array,
      default: () => {
        return [];
      },
    },
    //it can pass with like (40%) or Number(300)
    width: {
      type: [Number, String],
      default: 485,
    },
    //top-left | top-right | bottom-left | bottom-right
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
    }
```