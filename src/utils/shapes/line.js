import * as d3 from 'd3'


class Line {
    constructor(svg, data, imWidth, imHeight) {
        this.svg = svg
        this.data = data
        this.imWidth = imWidth || 0
        this.imHeight = imHeight || 0

    }

    get imageDimensions() {
        return [this.imWidth, this.imHeight]
    }
    set imageDimensions(val) {
        this.imWidth = val[0] || 0
        this.imHeight = val[1] || 0
        this.draw()
    }


    // Display helpers:
    //p1(l) { return [this.imWidth * l.x1, this.imHeight * l.y1] }
    //p2(l) { return [this.imWidth * l.x2, this.imHeight * l.y2]}

    handleLineMouseOver(d, i) {
        d3.select(this.parentNode).selectAll('.main-line')
            .attr('stroke-width', 5)
            .attr('stroke', 'orange')

        d3.select(this)
            .style('cursor', 'grab')
    }

    mouseout(d,i) {
        //console.log('mouseout')
        const stroke = d3.select(this).data()[0].color
        d3.select(this.parentNode).selectAll('.main-line')
            .attr('stroke-width', 3)
            .attr('stroke', stroke)
    }

    dragstarted() {
        //console.log('drag started')
    }

    clicked(event, d) {
        if (event.defaultPrevented) return; // dragged

        d3.select(this).selectAll('.main-line')
            .attr("stroke", "black")

        d.selected = true
    }

    dragged = (d,i) => {
        d.x1 += d3.event.dx / this.imWidth
        d.y1 += d3.event.dy / this.imHeight
        d.x2 += d3.event.dx / this.imWidth
        d.y2 += d3.event.dy / this.imHeight
    }

    dragended() {
        //d3.select(this).attr("stroke", null);
        d3.selectAll('g')
            .attr('pointer-events', 'all')
    }

    handle1dragged = (d,i) => {
        d.x1 += d3.event.dx / this.imWidth
        d.y1 += d3.event.dy / this.imHeight
    }
    handle2dragged = (d,i) => {
        d.x2 += d3.event.dx / this.imWidth
        d.y2 += d3.event.dy / this.imHeight
    }

    draw() {

        // don't draw if the svg isn't visible
        if (this.imHeight * this.imWidth == 0) {return;}


        let g = this.svg.selectAll('.line-selection')
            .data(this.data)
            .join('g')
            .attr("class", "line-selection")
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
                .attr("stroke-width", 3)
                .attr("stroke", d => d.color)

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
                .on('mouseover', this.handleLineMouseOver)
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
    }
}

export default Line