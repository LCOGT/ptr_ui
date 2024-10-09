class Starmarker {
  constructor (svg, data, imWidth, imHeight) {
    this.svg = svg
    this.data = data
    this.imWidth = imWidth || 1
    this.imHeight = imHeight || 1
  }

  get imageDimensions () {
    return [this.imWidth, this.imHeight]
  }

  set imageDimensions (val) {
    this.imWidth = val[0]
    this.imHeight = val[1]
    this.draw()
  }

  updateData (data) {
    this.data = data
  }

  draw () {
    // don't draw if the svg isn't visible
    if (this.imHeight * this.imWidth == 0) { return }

    const g = this.svg.selectAll('.star-marker1')
      .data(this.data)
      .join('g')
      .attr('class', 'star-marker1')

    g.selectAll('.line-left')
      .data(d => [d])
      .join('line')
      .attr('class', 'line-left')
      .attr('x1', d => (d.x * this.imWidth) - 15)
      .attr('y1', d => d.y * this.imHeight)
      .attr('x2', d => (d.x * this.imWidth) - 5)
      .attr('y2', d => d.y * this.imHeight)
      .attr('stroke', d => d.color)
      .attr('stroke-width', 2)

    g.selectAll('.line-right')
      .data(d => [d])
      .join('line')
      .attr('class', 'line-right')
      .attr('x1', d => (d.x * this.imWidth) + 15)
      .attr('y1', d => d.y * this.imHeight)
      .attr('x2', d => (d.x * this.imWidth) + 5)
      .attr('y2', d => d.y * this.imHeight)
      .attr('stroke', d => d.color)
      .attr('stroke-width', 2)

    g.selectAll('.line-top')
      .data(d => [d])
      .join('line')
      .attr('class', 'line-top')
      .attr('x1', d => d.x * this.imWidth)
      .attr('y1', d => (d.y * this.imHeight) - 15)
      .attr('x2', d => d.x * this.imWidth)
      .attr('y2', d => (d.y * this.imHeight) - 5)
      .attr('stroke', d => d.color)
      .attr('stroke-width', 2)

    g.selectAll('.line-bottom')
      .data(d => [d])
      .join('line')
      .attr('class', 'line-bottom')
      .attr('x1', d => d.x * this.imWidth)
      .attr('y1', d => (d.y * this.imHeight) + 15)
      .attr('x2', d => d.x * this.imWidth)
      .attr('y2', d => (d.y * this.imHeight) + 5)
      .attr('stroke', d => d.color)
      .attr('stroke-width', 2)
  }
}

export default Starmarker
