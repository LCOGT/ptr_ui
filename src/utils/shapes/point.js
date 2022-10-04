import * as d3 from 'd3'
import BaseShape from './base_shape'

class Point extends BaseShape {
  dragged = (d, i) => {
    d.x += d3.event.dx / this.imWidth
    d.y += d3.event.dy / this.imHeight
  }

  draw () {
    // don't draw if the svg isn't visible
    if (this.imHeight * this.imWidth == 0) { return }

    const g = this.svg.selectAll('.point-selection')
      .data(this.data)
      .join('g')
      .attr('class', 'point-selection selectable-shape')
      .attr('id', d => d.id)
      .on('click', this.clicked)
      .on('mouseover', function () {
        d3.select(this).style('cursor', 'grab')
      })

    // draw point
    g.selectAll('.main-point')
      .data(d => [d])
      .join('circle')
      .attr('class', 'main-point')
      .attr('cx', d => d.x * this.imWidth)
      .attr('cy', d => d.y * this.imHeight)
      .attr('r', 4)
      .attr('fill', 'transparent')
      .attr('stroke', d => d.color)
      .attr('stroke-width', '2px')

    // hover area
    g.selectAll('.hover-point')
      .data(d => [d])
      .join('circle')
      .attr('class', 'hover-point')
      .attr('cx', d => d.x * this.imWidth)
      .attr('cy', d => d.y * this.imHeight)
      .attr('r', 20)
      .attr('fill', 'transparent')
      .attr('stroke', d => d.color)
      .style('opacity', d => d.id == this.selectedId ? 0.5 : 0)
      .on('mouseover', function () {
        d3.select(this).style('opacity', 0.5)
      })
      .on('mouseout', d => {
        this.svg.select(d.id).style('opacity', d =>
          d.id == this.selectedId ? 0.5 : 0)
      })
      .call(d3.drag()
        .on('start', this.dragstarted)
        .on('drag', this.dragged)
      )
  }
}

export default Point
