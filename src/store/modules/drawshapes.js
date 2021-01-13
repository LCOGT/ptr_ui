

const state = {

    activeDrawShape: 'line',

    points: [ {x: .7, y: .65, color: "gold", show: true, selected: false} ],
    lines: [ {x1: .6, y1: .35, x2: .9, y2: .1, color: "gold", show: true, selected: false,}, ],
    rects: [ {x1: .2, y1: .23, x2: .704, y2: .20, color: 'gold', show: true}, ],
    circles: [ {x: .3, y: .35, rx:0.03, ry: 0.02, color: "gold", show: true, selected: false}, ],
    starmarkers: [ {x: 0.5, y: 0.5, color: 'gold', show: true}, ],
}

const getters = {
    activeDrawShape: state => state.activeDrawShape,

    points: state => state.points,
    lines: state => state.lines,
    rects: state => state.rects,
    circles: state => state.circles,
    starmarkers: state => state.starmarkers,
}

const mutations = {

    activeDrawShape(state, val) { state.activeDrawShape = val },

    addPoint(state, newPoint) {
        state.points.push(newPoint)
    },

    addLine( state, newLine) {
        state.lines.push(newLine)
    },

    addRect( state, newRect) {
        state.rects.push(newRect)
    },

    addCircle( state, newCircle) {
        state.circles.push(newCircle)
    },

    newStarmarkers(state, newStarmarker) {
        state.starmarkers.push(newStarmarker)
    }
}

export default {
    namespaced: true,
    state,
    getters,
    mutations
}