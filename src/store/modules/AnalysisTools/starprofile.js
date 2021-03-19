
// initial state
const state = {
  region_stats_loading: false,
  image_stats_loading: false,

  region_min: '--',
  region_max: '--',
  region_median: '--',
  region_mean: '--',
  region_mode: '--',
  region_std: '--',
  region_MAD: '--',

  num_good_stars: '--',
  pixscale: 1,

  median_plot_color: '#209cee',
  median_fwhm: '--',
  median_hfd: '--',
  median_profile: [0,0],
  median_relative_pos_x: -1,
  median_relative_pos_y: -1,

  brightest_plot_color: '#efea5a',
  brightest_fwhm: '--',
  brightest_hfd: '--',
  brightest_profile: [0,0],
  brightest_relative_pos_x: -1,
  brightest_relative_pos_y: -1,

  // Unsaturated brightest object
  u_brightest_plot_color: '#209cee',
  u_brightest_fwhm: '--',
  u_brightest_hfd: '--',
  u_brightest_profile: [0,0],
  u_brightest_relative_pos_x: -1,
  u_brightest_relative_pos_y: -1,

  starProfileToolActive: false,
  inspect_region_loading: false,
  inspect_image_loading: false,
}

// getters
const getters = {
  brightest_star_display: state => {
    return {
        x: state.brightest_relative_pos_x,
        y: state.brightest_relative_pos_y,
        color: state.u_brightest_plot_color,
    }
  },
  marked_stars: state => {
    const brightest_star = {
      x: state.brightest_relative_pos_x,
      y: state.brightest_relative_pos_y,
      color: state.brightest_plot_color,
    }
    const brightest_unsaturated = {
      x: state.u_brightest_relative_pos_x,
      y: state.u_brightest_relative_pos_y,
      color: state.u_brightest_plot_color,
    }
    return [ brightest_star,brightest_unsaturated ]
  },
}

// actions
const actions = {
  reset_star_markers({ commit }) {
      commit('brightest_relative_pos_x', -1)
      commit('brightest_relative_pos_y', -1)
      commit('u_brightest_relative_pos_x', -1)
      commit('u_brightest_relative_pos_y', -1)
  },
}

// mutations
const mutations = {
  region_stats_loading(state, val) {state.region_stats_loading = val},
  image_stats_loading(state, val) {state.image_stats_loading = val},

  region_min(state, val) {state.region_min = val},
  region_max(state, val) {state.region_max = val},
  region_median(state, val) {state.region_median = val},
  region_mean(state, val) {state.region_mean = val},
  region_mode(state, val) {state.region_mode = val},
  region_std(state, val) {state.region_std = val},
  region_MAD(state, val) {state.region_MAD = val},

  num_good_stars(state, val) {state.num_good_stars = val},
  pixscale(state, val) {state.pixscale = val},

  median_plot_color(state, val) {state.median_plot_color = val},
  median_fwhm(state, val) {state.median_fwhm = val},
  median_hfd(state, val) {state.median_hfd = val},
  median_profile(state, val) {state.median_profile = val},
  median_relative_pos_x(state, val) {state.median_relative_pos_x = val},
  median_relative_pos_y(state, val) {state.median_relative_pos_y = val},

  brightest_plot_color(state, val) {state.brightest_plot_color = val},
  brightest_fwhm(state, val) {state.brightest_fwhm = val},
  brightest_hfd(state, val) {state.brightest_hfd = val},
  brightest_profile(state, val) {state.brightest_profile = val},
  brightest_relative_pos_x(state, val) {state.brightest_relative_pos_x = val},
  brightest_relative_pos_y(state, val) {state.brightest_relative_pos_y = val},

  // Unsaturated brightest object
  u_brightest_plot_color(state, val) {state.u_brightest_plot_color = val},
  u_brightest_fwhm(state, val) {state.u_brightest_fwhm = val},
  u_brightest_hfd(state, val) {state.u_brightest_hfd = val},
  u_brightest_profile(state, val) {state.u_brightest_profile = val},
  u_brightest_relative_pos_x(state, val) {state.u_brightest_relative_pos_x = val},
  u_brightest_relative_pos_y(state, val) {state.u_brightest_relative_pos_y = val},

  starProfileToolActive(state, val) {state.starProfileToolActive = val},
  inspect_region_loading(state, val) {state.inspect_region_loading = val},
  inspect_image_loading(state, val) {state.inspect_image_loading = val},
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}