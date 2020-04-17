import Celestial from '@/components/celestialmap/celestial'

// initial state
const state = {
    selectedRa: -1,
    selectedDec: -1,
    filter: {
        star_types: ['star', 'Ds', '**'],
        star_mags: [-50, 50],
        dso_types: ['As','MW','Oc','Gc','Pl','Di','Bn','Dn','Sn','Cg','Sp','Ba','Ir','El','Ln','Px','Sx'],
        dso_mags: [-50, 50],
    },
}

// getters
const getters = {
    selectedRa: state => state.selectedRa,
    selectedDec: state => state.selectedDec,

    star_types: () => state.filter.star_types,
    star_mags: () => state.filter.star_mags,
    dso_types: () => state.filter.dso_types,
    dso_mags: () => state.filter.dso_mags,
}

// actions
const actions = {
    setSelected({ commit }, data) {
        commit('selectedRa', data[0]),
        commit('selectedDec', data[1])
        Celestial.redraw()
    },

    redrawMap(){
        console.log('redrawing map')
        Celestial.redraw()
    }
}

// mutations
const mutations = {
    selectedRa: (state, ra) => {state.selectedRa = ra}, 
    selectedDec: (state, dec) => state.selectedDec = dec, 
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}


