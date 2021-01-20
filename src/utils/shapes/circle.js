
import * as d3 from 'd3'
import store from '../../store'
import tinycolor from 'tinycolor2'

/**
 *  The input data should contain circle objects with keys:
 *      x: center x coordinate, proportion of imWidth
 *      y: center y coordinate, proportion of imHeight
 *      rx: x coordinate of click handle
 *      ry: y coordinate of click handle
 *      color: circle line color
 *      display: boolean whether to draw or not
 * 
 * These differ from the svg convention (cx, cy, r) so that users can draw
 * 'backwards' and not have to worry about negative radii (svg doesn't allow). 
 */

class Circle {
    constructor(svg, data, imWidth, imHeight) {
        this.svg = svg
        this.data = data
        this.imWidth = imWidth || 1
        this.imHeight = imHeight || 1
    }

    get imageDimensions() {
        return [this.imWidth, this.imHeight]
    }
    set imageDimensions(val) {
        this.imWidth = val[0]
        this.imHeight = val[1]
    }

    get selectedId() {
        return store.getters['drawshapes/selectedId']
    }
    set selectedId(val) {
        store.commit('drawshapes/selectedId', val)
    }

    clicked = (d,i) => {
        if (d.defaultPrevented) return; // dragged
        this.selectedId = d.id
        this.draw()
    }

    draggedHandle = (d,i) => {
        d.rx += d3.event.dx / this.imWidth
        d.ry += d3.event.dy / this.imHeight
    }

    dragged = (d,i) => {
        this.selectedId = d.id // make this the selected shape
        d.x += d3.event.dx / this.imWidth
        d.y += d3.event.dy / this.imHeight
    }

    draw() {

        // don't draw if the svg isn't visible
        if (this.imHeight * this.imWidth == 0) {return;}

        let g = this.svg.selectAll('.circle-selection')
            .data(this.data)
            .join('g')
            .attr("class", "circle-selection selectable-shape")
            .attr('id', d => d.id)
            .call(d3.drag()
                .on("drag", this.dragged)
            )
            .on('click', this.clicked)
            .on('mouseover', function () {
                d3.select(this).style('cursor', 'grab')
            })

        let circle = g.selectAll('.main-circle')
            .data(d => [d])
            .join('circle')
                .attr('class', 'main-circle selectable-shape')
                .attr("cx", d => d.x * this.imWidth)
                .attr("cy", d => d.y * this.imHeight)
                .attr("r", d => Math.sqrt((d.rx * this.imWidth)**2 + (d.ry * this.imHeight)**2))
                .attr("fill", "transparent")
                .attr('stroke', d => d.color)
                .attr('stroke-width', d => d.id == this.selectedId ? 3 : 1)

        let centerx = g.selectAll('.center-cross-x')
            .data(d => [d])
            .join('line')
                .attr('class', 'center-cross-x')
                .attr('x1', d => (d.x * this.imWidth) - 5)
                .attr('y1', d => d.y * this.imHeight)
                .attr('x2', d => (d.x * this.imWidth) + 5)
                .attr('y2', d => d.y * this.imHeight)
                .attr('stroke', d => d.color)
                .attr('stroke-width', 1)
        let centery = g.selectAll('.center-cross-y')
            .data(d => [d])
            .join('line')
                .attr('class', 'center-cross-y')
                .attr('x1', d => d.x * this.imWidth)
                .attr('y1', d => (d.y * this.imHeight) - 5)
                .attr('x2', d => d.x * this.imWidth)
                .attr('y2', d => (d.y * this.imHeight) + 5)
                .attr('stroke', d => d.color)
                .attr('stroke-width', 1)

        let dragHandle = g.selectAll('.drag-handle')
            .data(d => [d])
            .join('circle')
                .attr('class', 'drag-handle')
                .attr("cx", d => (d.x + d.rx) * this.imWidth)
                .attr("cy", d => (d.y + d.ry) * this.imHeight)
                //.attr("cy", d => d.y * this.imHeight)
                .attr("r", d => 4)
                .attr("fill", "transparent")
                .attr('stroke', d => d.color)
                .attr('stroke-width', 1)

                
        let hoverArea = g.selectAll('.hover-circle')
            .data(d => [d])
            .join('circle')
                .attr('class', 'hover-circle')
                .attr("cx", d => (d.x + d.rx) * this.imWidth)
                .attr("cy", d => (d.y + d.ry) * this.imHeight)
                //.attr("cy", d => d.y * this.imHeight)
                .attr("r", 20)
                .attr("fill", "transparent")
                .attr('stroke', d => d.color)
                .style('opacity', '0.0')
                .on('mouseover', function() {
                    d3.select(this)
                        .style('opacity', 0.5)
                        .style('cursor', 'ew-resize')
                })
                .on('mouseout', function() {
                    d3.select(this)
                        .style('opacity', 0)
                        .style('cursor', 'default')
                })
                .call(d3.drag().on("drag", this.draggedHandle))
    }
}

export default Circle
