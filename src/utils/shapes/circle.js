
import * as d3 from 'd3'
import tinycolor from 'tinycolor2'



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
        this.draw()
    }

    clicked(event, d) {
        if (event.defaultPrevented) return; // dragged

        d3.select(this).selectAll('.main-circle')
            .attr("stroke", "black")
    }

    draggedHandle = (d,i) => {
        d.radx += d3.event.dx / this.imWidth
    }

    dragged = (d,i) => {
        d.x += d3.event.dx / this.imWidth
        d.y += d3.event.dy / this.imHeight
    }

    draw() {

        // don't draw if the svg isn't visible
        if (this.imHeight * this.imWidth == 0) {return;}

        let g = this.svg.selectAll('.circle-selection')
            .data(this.data)
            .join('g')
            .attr("class", "circle-selection")
            .call(d3.drag()
                .on("drag", this.dragged)
            )
            .on('click', this.clicked)


        let point = g.selectAll('.main-circle')
            .data(d => [d])
            .join('circle')
                .attr('class', 'main-circle')
                .attr("cx", d => d.x * this.imWidth)
                .attr("cy", d => d.y * this.imHeight)
                .attr("r", d => Math.abs(d.radx) * this.imWidth)
                .attr("fill", "transparent")
                .attr('stroke', d => d.color)
                .attr('stroke-width', '2px')

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
                .attr("cx", d => (d.x + d.radx) * this.imWidth)
                .attr("cy", d => d.y * this.imHeight)
                .attr("r", d => 4)
                .attr("fill", "transparent")
                .attr('stroke', d => d.color)
                .attr('stroke-width', 1)

                
        let hoverArea = g.selectAll('.hover-circle')
            .data(d => [d])
            .join('circle')
                .attr('class', 'hover-circle')
                .attr("cx", d => (d.x + d.radx) * this.imWidth)
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
                .call(d3.drag().on("drag", this.draggedHandle))

    }
}

export default Circle