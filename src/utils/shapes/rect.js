import * as d3 from 'd3'



/**
 * 
 *  The input data should contain rect objects with keys:
 *      x1: coordinate for one of the corners, as proportion of imWidth
 *      y1: coordiante for one of the corners, as proportion of imHeight
 *      x2: coordinate of the opposite corner, as proportion of imWidth
 *      y2: coordinate of the opposite corner, as proportion of imHeight
 *      color: circle line color
 *      display: boolean whether to draw or not
 * 
 * These differ from the svg convention (x,y,width,height) so that users can draw
 * 'backwards' and not have to worry about negative width/height, which
 * svg doesn't allow. 
 */
class Rect {
    constructor(svg, data, width, height) {
        this.svg = svg
        this.data = data
        this.imWidth = width || 1
        this.imHeight = height || 1
    }

    set imageDimensions(val) {
        this.imWidth = val[0] || 1
        this.imHeight = val[1] || 1
        this.draw()
    }

    // Rectangle helpers:
    minx(r) { return Math.min(r.x1, r.x2) * this.imWidth }
    miny(r) { return Math.min(r.y1, r.y2) * this.imHeight }
    rectwidth(r) { return Math.abs(r.x1 - r.x2) * this.imWidth }
    rectheight(r) { return Math.abs(r.y1 - r.y2) * this.imHeight }
    midx(r) { return (r.x1 + r.x2) * this.imWidth / 2 }
    midy(r) { return (r.y1 + r.y2) * this.imHeight / 2 }
    


    handleLineMouseOver(d, i) {  // Add interactivity
        // Use D3 to select element, change color and size
        d3.select(this)
            .attr('stroke-width', 5)
            .attr('stroke', 'orange')
    }


    dragstarted() {
        //console.log('drag started')
    }

    dragged = (d, i) => {
        d.x1 += d3.event.dx / this.imWidth
        d.x2 += d3.event.dx / this.imWidth
        d.y1 += d3.event.dy / this.imHeight
        d.y2 += d3.event.dy / this.imHeight
    }

    dragended() {
        //console.log('drag ended')
    }

    dragHandle1 = (d,i) => {
        d.x1 += d3.event.dx / this.imWidth
        d.y1 += d3.event.dy / this.imHeight
    }
    dragHandle2 = (d,i) => {
        d.x2 += d3.event.dx / this.imWidth
        d.y1 += d3.event.dy / this.imHeight
    }
    dragHandle3 = (d,i) => {
        d.x1 += d3.event.dx / this.imWidth
        d.y2 += d3.event.dy / this.imHeight
    }
    dragHandle4 = (d,i) => {
        d.x2 += d3.event.dx / this.imWidth
        d.y2 += d3.event.dy / this.imHeight
    }

    draw() {

        // don't draw if the svg isn't visible
        if (this.imHeight * this.imWidth == 0) {return;}

        let self = this

        const handleSelectableAreaRadius = 12

        let g = this.svg.selectAll('.custom-rect')
            .data(this.data)
            .join('g')
            .attr('class', 'custom-rect')
            //.on('mouseover', this.mouseover)
            //.on('mouseout', this.mouseout)
            .call(d3.drag()
                .on("start", this.dragstarted)
                .on("drag", this.dragged)
                .on("end", this.dragended)
            )

        let rect = g.selectAll('.main-rect')
            .data(d => [d])
            .join('rect')
                .attr('class', 'main-rect')
                .attr('x', r => self.minx(r))
                .attr('y', r => self.miny(r))
                .attr('width', r => self.rectwidth(r))
                .attr('height', r => self.rectheight(r))
                .attr('stroke', r => r.color)
                .attr("fill", 'transparent')
                //.on('mouseover', this.mouseover)
                //.on('mouseout', this.mouseout)

        let dragHandle1Area = g.selectAll('.drag-handle-1-area')
            .data(d => [d])
            .join('circle')
                .attr('class', 'drag-handle-1-area')
                .attr("cx", d => d.x1 * self.imWidth)
                .attr("cy", d => d.y1 * self.imHeight)
                .attr("r", handleSelectableAreaRadius)
                .attr("fill", "transparent")
                .attr('stroke', d => d.color)
                .style('opacity', 0)
                .on('mouseover', function() {
                    d3.select(this).style('opacity', 0.5)
                })
                .on('mouseout', function() {
                    d3.select(this).style('opacity', 0)
                })
                .call(d3.drag().on("drag", this.dragHandle1))
        let dragHandle1 = g.selectAll('.drag-handle-1')
            .data(d => [d])
            .join('circle')
                .attr('class', 'drag-handle-1')
                .attr("cx", d => d.x1 * self.imWidth)
                .attr("cy", d => d.y1 * self.imHeight)
                .attr("r", 3)
                .attr("fill", "transparent")
                .attr('stroke', d => d.color)

        let dragHandle2Area = g.selectAll('.drag-handle-2-area')
            .data(d => [d])
            .join('circle')
                .attr('class', 'drag-handle-2-area')
                .attr("cx", d => d.x2 * self.imWidth)
                .attr("cy", d => d.y1 * self.imHeight)
                .attr("r", handleSelectableAreaRadius)
                .attr('stroke', d => d.color)
                .attr("fill", "transparent")
                .style('opacity', 0)
                .on('mouseover', function() {
                    d3.select(this).style('opacity', 0.5)
                })
                .on('mouseout', function() {
                    d3.select(this).style('opacity', 0)
                })
                .call(d3.drag().on("drag", this.dragHandle2))
        let dragHandle2 = g.selectAll('.drag-handle-2')
            .data(d => [d])
            .join('circle')
                .attr('class', 'drag-handle-2')
                .attr("cx", d => d.x2 * self.imWidth)
                .attr("cy", d => d.y1 * self.imHeight)
                .attr("r", 3)
                .attr("fill", "transparent")
                .attr('stroke', d => d.color)

        let dragHandle3Area = g.selectAll('.drag-handle-3-area')
            .data(d => [d])
            .join('circle')
                .attr('class', 'drag-handle-3-area')
                .attr("cx", d => d.x1 * self.imWidth)
                .attr("cy", d => d.y2 * self.imHeight)
                .attr("r", handleSelectableAreaRadius)
                .attr("fill", "transparent")
                .attr('stroke', d => d.color)
                .style('opacity', 0)
                .on('mouseover', function() {
                    d3.select(this).style('opacity', 0.5)
                })
                .on('mouseout', function() {
                    d3.select(this).style('opacity', 0)
                })
                .call(d3.drag().on("drag", this.dragHandle3))
        let dragHandle3 = g.selectAll('.drag-handle-3')
            .data(d => [d])
            .join('circle')
                .attr('class', 'drag-handle-3')
                .attr("cx", d => d.x1 * self.imWidth)
                .attr("cy", d => d.y2 * self.imHeight)
                .attr("r", 3)
                .attr("fill", "transparent")
                .attr('stroke', d => d.color)

        let dragHandle4Area = g.selectAll('.drag-handle-4-area')
            .data(d => [d])
            .join('circle')
                .attr('class', 'drag-handle-4-area')
                .attr("cx", d => d.x2 * self.imWidth)
                .attr("cy", d => d.y2 * self.imHeight)
                .attr("r", handleSelectableAreaRadius)
                .attr("fill", "transparent")
                .attr('stroke', d => d.color)
                .style('opacity', 0)
                .on('mouseover', function() {
                    d3.select(this).style('opacity', 0.5)
                })
                .on('mouseout', function() {
                    d3.select(this).style('opacity', 0)
                })
                .call(d3.drag().on("drag", this.dragHandle4))
        let dragHandle4 = g.selectAll('.drag-handle-4')
            .data(d => [d])
            .join('circle')
                .attr('class', 'drag-handle-4')
                .attr("cx", d => d.x2 * self.imWidth)
                .attr("cy", d => d.y2 * self.imHeight)
                .attr("r", 3)
                .attr("fill", "transparent")
                .attr('stroke', d => d.color)

        let centerx = g.selectAll('.center-cross-x')
            .data(d => [d])
            .join('line')
                .attr('class', 'center-cross-x')
                .attr('x1', d => this.midx(d) - 5)
                .attr('y1', d => this.midy(d))
                .attr('x2', d => this.midx(d) + 5)
                .attr('y2', d => this.midy(d))
                .attr('color', d => d.color)
                .attr('stroke', d => d.color)
                .attr('stroke-width', 1)
        let centery = g.selectAll('.center-cross-y')
            .data(d => [d])
            .join('line')
                .attr('class', 'center-cross-y')
                .attr('x1', d => this.midx(d))
                .attr('y1', d => this.midy(d) - 5)
                .attr('x2', d => this.midx(d))
                .attr('y2', d => this.midy(d) + 5)
                .attr('color', d => d.color)
                .attr('stroke', d => d.color)
                .attr('stroke-width', 1)
    }
}

export default Rect