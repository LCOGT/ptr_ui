
function idToShapelistName(id) {
    if (id == 'none') return 'none'
    if (id[0] == 'p') return 'points'
    if (id[0] == 'l') return 'lines'
    if (id[0] == 'r') return 'rects'
    if (id[0] == 'c') return 'circles'
    console.log('unknown shape type from id: ', id)
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
    selectionExists: state => state.selectedId != 'none',

    selectedShape: state => {
        if (state.selectedId == 'none') return 'none'
        const allShapes = [...state.points, ...state.lines, ...state.rects, ...state.circles]
        const selected = allShapes.find(x => x.id == state.selectedId)
        return selected
    },
    selectedShapeType: state => idToShapelistName(state.selectedId),

    // This is used as a camera command param
    subframeFromShape: (state, getters) => {
        const fullSubframe = { x0: 0, y0: 0, x1: 1, y1: 1 }

        // If no shape is selected, the subframe is the default full image
        if (state.selectedId == 'none') {
            return fullSubframe
        }
        const shape = getters.selectedShape
        const type = getters.selectedShapeType

        if (type == 'rects' || type == 'lines') {
            return {
                x0: shape.x1,
                y0: shape.y1,
                x1: shape.x2,
                y1: shape.y2,
            }
        } else if (type == 'circles') {
            // get the square that encloses the circle
            const rad_length = Math.sqrt((shape.rx ** 2) + (shape.ry ** 2))
            return {
                x0: shape.cx - rad_length,
                y0: shape.cy - rad_length,
                x1: shape.cx + rad_length,
                y1: shape.xy + rad_length
            }
        } else {
            // Default case
            return fullSubframe
        }
    },

    points: state => state.points,
    lines: state => state.lines,
    rects: state => state.rects,
    circles: state => state.circles,
    starmarkers: state => state.starmarkers,
}

const mutations = {

    activeDrawShape(state, val) { state.activeDrawShape = val },
    selectedId(state, val) { state.selectedId = val },

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
        state[shape].splice(index, 1)
    },
}

const actions = {
    deleteShape({state, commit}, id) {
        const shape = idToShapelistName(id)
        commit('removeElement', {shape, id})
    },
    deleteSelectedShape({commit, state, dispatch}) {
        if (state.selectedId == "none") return; // if nothing is selected
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
