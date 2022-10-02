/**
 * @fileoverview This is the vuex store that maintains the state of various
 * tabs, pages, etc in the user interface.
 */

const state = {

  selected_subpage: 'home',
  selected_target_tab: 'telescope controls',
  selected_image_tools_tab: 'analysis',
  selected_controls_tab: 5 // camera tab default

}

const getters = {

  selected_subpage: state => {
    return state.selected_subpage
  },

  selected_target_tab: state => {
    return state.selected_target_tab
  },

  selected_image_tools_tab: state => {
    return state.selected_image_tools_tab
  },

  selected_controls_tab: state => {
    return state.selected_controls_tab
  }

}

const mutations = {

  setActiveSubpage (state, subpage) {
    state.selected_subpage = subpage
  },
  setActiveTargetTab (state, target_tab) {
    state.selected_target_tab = target_tab
  },
  setActiveImageToolsTab (state, image_tools_tab) {
    state.selected_image_tools_tab = image_tools_tab
  },
  setActiveControlsTab (state, controls_tab) {
    state.selected_controls_tab = controls_tab
  }

}

export default {
  namespaced: true,
  state,
  getters,
  mutations
}
