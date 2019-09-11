
// initial state
const state = {
    genBiasDarkMaster: {
        numOfBias: 1,
        darkTime: 300,
        numOfDark: 1,
        dark2Time: 300,
        numOfDark2: 1,
        coldMap: true,
        hotMap: true,
    },
    genScreenFlatMasters: {
        numFrames: 15,
        gainCalc: true,
        shutterCompensation: true,
    },
    takeUGRIZSStack: {
        numFrames: 1,
        skipU: true,
        skipZS: true,
    },

    // If a script is not in this list, the UI settings button will be disabled.
    scriptsWithSettings: [
        'gen_bias_dark_master',
        'gen_screen_flat_masters',
        'take_UGRIZS_stack',
    ]
}

// getters
const getters = {

    genBiasDarkMaster: state => state.genBiasDarkMaster,
    genBiasDarkMaster_numOfBias: state => state.genBiasDarkMaster.numOfBias,
    genBiasDarkMaster_darkTime: state => state.genBiasDarkMaster.darkTime, 
    genBiasDarkMaster_numOfDark: state => state.genBiasDarkMaster.numOfDark, 
    genBiasDarkMaster_dark2Time: state => state.genBiasDarkMaster.dark2Time, 
    genBiasDarkMaster_numOfDark2: state => state.genBiasDarkMaster.numOfDark2, 
    genBiasDarkMaster_coldMap: state => state.genBiasDarkMaster.coldMap, 
    genBiasDarkMaster_hotMap: state => state.genBiasDarkMaster.hotMap, 

    genScreenFlatMasters: state => state.genScreenFlatMasters,
    genScreenFlatMasters_numFrames: 
        state => state.genScreenFlatMasters.numFrames,
    genScreenFlatMasters_gainCalc: 
        state => state.genScreenFlatMasters.gainCalc,
    genScreenFlatMasters_shutterCompensation: 
        state => state.genScreenFlatMasters.shutterCompensation,

    takeUGRIZSStack: state => state.takeUGRIZSStack,
    takeUGRIZSStack_numFrames: state => state.takeUGRIZSStack.numFrames,
    takeUGRIZSStack_skipU: state => state.takeUGRIZSStack.skipU,
    takeUGRIZSStack_skipZS: state => state.takeUGRIZSStack.skipZS,

    scriptsWithSettings: state => state.scriptsWithSettings,
}

// actions
const actions = {
}

// mutations
const mutations = {

    set_genBiasDarkMaster_numOfBias(state, val) { state.genBiasDarkMaster.numOfBias = val },
    set_genBiasDarkMaster_darkTime(state, val) { state.genBiasDarkMaster.darkTime= val },
    set_genBiasDarkMaster_numOfDark(state, val) { state.genBiasDarkMaster.numOfDark= val },
    set_genBiasDarkMaster_dark2Time(state, val) { state.genBiasDarkMaster.dark2Time= val },
    set_genBiasDarkMaster_numOfDark2(state, val) { state.genBiasDarkMaster.numOfDark2= val },
    set_genBiasDarkMaster_coldMap(state, val) { state.genBiasDarkMaster.coldMap= val },
    set_genBiasDarkMaster_hotMap(state, val) { state.genBiasDarkMaster.hotMap= val },

    set_genScreenFlatMasters_numFrames(state, val) { state.genScreenFlatMasters.numFrames = val },
    set_genScreenFlatMasters_gainCalc(state, val) { state.genScreenFlatMasters.gainCalc= val },
    set_genScreenFlatMasters_shutterCompensation(state, val) { state.genScreenFlatMasters.shutterCompensation= val },

    set_takeUGRIZSStack_numFrames(state, val) { state.takeUGRIZSStack.numFrames = val },
    set_takeUGRIZSStack_skipU(state, val) { state.takeUGRIZSStack.skipU= val },
    set_takeUGRIZSStack_skipZS(state, val) { state.takeUGRIZSStack.skipZS= val },

}

export default {
    state,
    getters,
    actions,
    mutations
}