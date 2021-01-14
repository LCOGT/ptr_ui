
import * as d3 from 'd3'
import store from '../../store'


class Point {
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
        this.imWidth = val[0] || 1
        this.imHeight = val[1] || 1
        this.draw()
    }
    get selectedId() {
        return store.getters['drawshapes/selectedId']
    }
    set selectedId(val) {
        store.commit('drawshapes/selectedId', val)
    }

    clicked = (d, i) => {
        if (d.defaultPrevented) return; // dragged

        this.svg.select(d.id).selectAll('.main-point')
            .attr("stroke", "black")
    }

    dragstarted = d => {
        this.selectedId = d.id
    }
    dragged = (d,i) => {
        d.x += d3.event.dx / this.imWidth
        d.y += d3.event.dy / this.imHeight
    }

    draw() {

        // don't draw if the svg isn't visible
        if (this.imHeight * this.imWidth == 0) {return;}


        let g = this.svg.selectAll('.point-selection')
            .data(this.data)
            .join('g')
            .attr("class", "point-selection selectable-shape")
            .attr('id', d => d.id)
            .on('click', this.clicked)
            .on('mouseover', function () {
                d3.select(this).style('cursor', 'grab')
            })

        let point = g.selectAll('.main-point')
            .data(d => [d])
            .join('circle')
                .attr('class', 'main-point')
                .attr("cx", d => d.x * this.imWidth)
                .attr("cy", d => d.y * this.imHeight)
                .attr("r", 4)
                .attr("fill", "transparent")
                .attr('stroke', d => d.color)
                .attr('stroke-width', '2px')
                
        let hoverArea = g.selectAll('.hover-point')
            .data(d => [d])
            .join('circle')
                .attr('class', 'hover-point')
                .attr("cx", d => d.x * this.imWidth)
                .attr("cy", d => d.y * this.imHeight)
                .attr("r", 20)
                .attr("fill", "transparent")
                .attr('stroke', d => d.color)
                .style('opacity', d => d.id == this.selectedId ? 0.5 : 0)
                .on('mouseover', function() {
                    d3.select(this).style('opacity', 0.5)
                })
                .on('mouseout', d => {
                    this.svg.select(d.id).style('opacity', d => 
                        d.id == this.selectedId ? 0.5 : 0)
                })
                .call(d3.drag()
                    .on("start", this.dragstarted)
                    .on("drag", this.dragged)
                    .on("end", this.dragended)
                )

    }
}

export default Point 