import store from '../../store'

class BaseShape {
  constructor (svg, data, imWidth, imHeight) {
    this.svg = svg
    this.data = data
    this.imWidth = imWidth || 0
    this.imHeight = imHeight || 0
  }

  get imageDimensions () {
    return [this.imWidth, this.imHeight]
  }

  set imageDimensions (val) {
    this.imWidth = val[0] || 0
    this.imHeight = val[1] || 0
    this.draw()
  }

  get selectedId () {
    return store.getters['drawshapes/selectedId']
  }

  set selectedId (val) {
    store.commit('drawshapes/selectedId', val)
  }

  clicked = d => {
    if (d.defaultPrevented) return // dragged, so don't do click routine.
    this.selectedId = d.id
    this.draw()
  }

  dragstarted = d => {
    this.selectedId = d.id
  }

  draw () {
    throw new Error("Method 'draw' must be implemented.")
  }
}

export default BaseShape
