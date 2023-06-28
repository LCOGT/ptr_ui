/**
 * @fileoverview This is the vuex store that maintains the state of various
 * tabs, pages, etc in the user interface.
 */

const state = {

  selected_subpage: 'home',
  selected_target_tab: 'telescope controls',
  selected_image_tools_tab: 'controls',
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

  selected_subpage (state, subpage) {
    state.selected_subpage = subpage
  },
  selected_target_tab (state, target_tab) {
    state.selected_target_tab = target_tab
  },
  selected_image_tools_tab (state, image_tools_tab) {
    state.selected_image_tools_tab = image_tools_tab
  },
  selected_controls_tab (state, controls_tab) {
    state.selected_controls_tab = controls_tab
  }

}

export default {
  namespaced: true,
  state,
  getters,
  mutations
}
