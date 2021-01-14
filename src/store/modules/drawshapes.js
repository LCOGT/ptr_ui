
const idToShapelistName = id => {
    if (id[0] == 'p') return 'points'
    if (id[0] == 'l') return 'lines'
    if (id[0] == 'r') return 'rects'
    if (id[0] == 'c') return 'circles'
}

const simpleId = () => Math.random().toString(36).slice(-6)

const state = {

    activeDrawShape: 'none',

    selectedId: 'none', 
     
    points: [ 
        //{id: 'p0', x: .7, y: .65, color: "gold", show: true}, 
    ],
    lines: [ 
        //{id: 'l0', x1: .6, y1: .35, x2: .9, y2: .1, color: "gold", show: false, }, 
    ],
    rects: [ 
        //{id: 'r0', x1: .2, y1: .23, x2: .704, y2: .20, color: 'gold', show: true,}, 
    ],
    circles: [ 
        //{id: 'c0', x: .3, y: .35, rx:0.03, ry: 0.02, color: "gold", show: true, }, 
    ],
    starmarkers: [ {x: 0.5, y: 0.5, color: 'gold', show: true}, ],
}

const getters = {
    activeDrawShape: state => state.activeDrawShape,
    selectedId: state => state.selectedId,

    selectedShape: state => {
        if (state.selectedId == 'none') return 'none'
        const allShapes = [...state.points, ...state.lines, ...state.rects, ...state.circles]
        const selected = allShapes.find(x => x.id == state.selectedId)
        return selected
    },

    points: state => state.points,
    lines: state => state.lines,
    rects: state => state.rects,
    circles: state => state.circles,
    starmarkers: state => state.starmarkers,
}

const mutations = {

    activeDrawShape(state, val) { state.activeDrawShape = val },
    selectedId(state, val) { console.log('changing selected id'); state.selectedId = val },


    addPoint(state, newPoint) {
        newPoint.id = 'p' + simpleId()
        state.points.push(newPoint)
    },

    addLine( state, newLine) {
        newLine.id = 'l' + simpleId()
        state.lines.push(newLine)
    },

    addRect( state, newRect) {
        newRect.id = 'r' + simpleId()
        state.rects.push(newRect)
    },

    addCircle( state, newCircle) {
        newCircle.id = 'c' + simpleId()
        state.circles.push(newCircle)
    },

    newStarmarkers(state, newStarmarker) {
        state.starmarkers.push(newStarmarker)
    },

    removeElement(state, {shape, id}) {
        let index = state[shape].findIndex(s => s.id == id)
        if (index == -1) return; // no element found
        console.log(id)
        console.log(index)
        console.log(state[shape])
        state[shape].splice(index, 1)
        console.log(state[shape])
    },
}

const actions = {
    deleteShape({state, commit}, id) {
        console.log('deleting ', id)
        const shape = idToShapelistName(id)
        commit('removeElement', {shape, id})
    },
    deleteSelectedShape({commit, state, dispatch}) {
        dispatch('deleteShape', state.selectedId)
        commit('selectedId', 'none')
    },
}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
}