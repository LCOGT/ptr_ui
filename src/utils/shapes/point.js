
import * as d3 from 'd3'


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

    clicked(event, d) {
        if (event.defaultPrevented) return; // dragged

        d3.select(this).selectAll('.main-line')
            .attr("stroke", "black")
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
            .attr("class", "point-selection")
            .call(d3.drag()
                .on("start", this.dragstarted)
                .on("drag", this.dragged)
                .on("end", this.dragended)
            )
            .on('click', this.clicked)

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
                .style('opacity', '0.0')
                .on('mouseover', function() {
                    d3.select(this).style('opacity', 0.5)
                })
                .on('mouseout', function() {
                    d3.select(this).style('opacity', 0)
                })
                .call(d3.drag().on("drag", this.dragged))

    }
}

export default Point 