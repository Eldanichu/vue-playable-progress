export default {
  namespace: true,
  state: {
    progress: {}
  },
  mutations: {
    m_menuCollapse(state) {
      state.menuCollapse = !state.menuCollapse
    }
  },
  actions: {
    set_menuCollapse({commit}, data) {
      commit('m_menuCollapse', data)
    }
  },

}