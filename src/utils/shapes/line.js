import * as d3 from 'd3'
import BaseShape from './base_shape'

class Line extends BaseShape {
    constructor(svg, data, imWidth, imHeight) {
        super(svg, data, imWidth, imHeight)
    }

    mouseover = d => {
        d3.select('#'+d.id)
            .style('opacity', 0.9)
            .style('cursor', 'grab')
    }

    mouseout = (d,i) => {
        const stroke = d.color
        d3.select('#'+d.id).select('.main-line')
            .attr('stroke-width', d => d.id == this.selectedId ? 3 : 2)
            .attr('stroke', stroke)
            .style('opacity', 0.8)
    }

    dragged = d => {
        d.x1 += d3.event.dx / this.imWidth
        d.y1 += d3.event.dy / this.imHeight
        d.x2 += d3.event.dx / this.imWidth
        d.y2 += d3.event.dy / this.imHeight
    }

    dragended = () => {
        d3.selectAll('g')
            .attr('pointer-events', 'all')
    }

    handle1dragged = d => {
        d.x1 += d3.event.dx / this.imWidth
        d.y1 += d3.event.dy / this.imHeight
    }
    handle2dragged = d => {
        d.x2 += d3.event.dx / this.imWidth
        d.y2 += d3.event.dy / this.imHeight
    }

    draw() {

        // don't draw if the svg isn't visible
        if (this.imHeight * this.imWidth == 0) {return;}

        let g = this.svg.selectAll('.line-selection')
            .data(this.data)
            .join('g')
            .attr("class", "line-selection selectable-shape")
            .attr('id', d => d.id)
            .call(d3.drag()
                .on("start", this.dragstarted)
                .on("drag", this.dragged)
                .on("end", this.dragended)
            )
            .on('click', this.clicked)

        let line = g.selectAll('.main-line')
            .data(d => [d])
            .join('line')
                .attr('class', 'main-line')
                .attr("x1", d => d.x1 * this.imWidth)
                .attr("y1", d => d.y1 * this.imHeight)
                .attr("x2", d => d.x2 * this.imWidth)
                .attr("y2", d => d.y2 * this.imHeight)
                .attr("stroke-width", d => d.id == this.selectedId ? 3 : 2)
                .attr("stroke", d => d.color)
                .style('opacity', d => d.id == this.selectedId ? 1 : 0.8)


        let hoverArea = g.selectAll('.hover-line')
            .data(d => [d])
            .join('line')
                .attr('class', 'hover-line')
                .attr("x1", d => d.x1 * this.imWidth)
                .attr("x2", d => d.x2 * this.imWidth)
                .attr("y1", d => d.y1 * this.imHeight)
                .attr("y2", d => d.y2 * this.imHeight)
                .attr('stroke-width', 25)
                .attr('stroke', 'white')
                .style('opacity', '0')
                .on('mouseover', this.mouseover)
                .on('mouseout', this.mouseout)

        let dragHandle1Area = g.selectAll('.drag-handle-1-area')
            .data(d => [d])
            .join('circle')
                .attr('class', 'drag-handle-1-area')
                .attr("cx", d => d.x1 * this.imWidth)
                .attr("cy", d => d.y1 * this.imHeight)
                .attr("r", 15)
                .attr("fill", "transparent")
                .attr('stroke', d => d.color)
                .style('opacity', '0.0')
                .on('mouseover', function() {
                    d3.select(this).style('opacity', 0.5)
                })
                .on('mouseout', function() {
                    d3.select(this).style('opacity', 0)
                })
                .call(d3.drag().on("drag", this.handle1dragged))
        let dragHandle1 = g.selectAll('.drag-handle-1')
            .data(d => [d])
            .join('circle')
                .attr('class', 'drag-handle-1')
                .attr("cx", d => d.x1 * this.imWidth)
                .attr("cy", d => d.y1 * this.imHeight)
                .attr("r", 3)
                .attr("fill", "transparent")
                .attr('stroke', d => d.color)
                .style('opacity', d => d.id == this.selectedId ? 1 : 0)
        let dragHandle2Area = g.selectAll('.drag-handle-2-area')
            .data(d => [d])
            .join('circle')
                .attr('class', 'drag-handle-2-area')
                .attr("cx", d => d.x2 * this.imWidth)
                .attr("cy", d => d.y2 * this.imHeight)
                .attr("r", 15)
                .attr("fill", "transparent")
                .attr('stroke', d => d.color)
                .style('opacity', 0)
                .on('mouseover', function() {
                    d3.select(this).style('opacity', 0.5)
                })
                .on('mouseout', function() {
                    d3.select(this).style('opacity', 0)
                })
                .call(d3.drag().on("drag", this.handle2dragged))
        let dragHandle2 = g.selectAll('.drag-handle-2')
            .data(d => [d])
            .join('circle')
                .attr('class', 'drag-handle-2')
                .attr("cx", d => d.x2 * this.imWidth)
                .attr("cy", d => d.y2 * this.imHeight)
                .attr("r", 3)
                .attr("fill", "transparent")
                .attr('stroke', d => d.color)
                .style('opacity', d => d.id == this.selectedId ? 1 : 0)
    }
}

export default Line
