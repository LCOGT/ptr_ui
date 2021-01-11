
function cartesian(x, y) {
    return {
        get: function() { return [x.get(), y.get()]; },
        set: function(p) { x.set(p[0]); y.set(p[1]); }
    };
};
function Model(init) {
    this.get = init.get;
    this.set = init.set;
}

Model.ref = /* static */ function(obj, prop) {
    return new Model({
        get: function() { return obj[prop]; },
        set: function(v) { obj[prop] = v; }
    });
};

Model.constant = /* static */ function(v) {
    return new Model({
        get: function() { return v; },
        set: function(_) { }
    });
};

Model.prototype.clamped = function(lo, hi) {
    var m = this;
    return new Model({
        get: function() { return m.get(); },
        set: function(v) { m.set(Math.min(hi, Math.max(lo, v))); }
    });
}

Model.prototype.add = function(a) {
    var m = this;
    return new Model({
        get: function() { return m.get() + a; },
        set: function(v) { m.set(v - a); }
    });
}

var obj = {x: 5, y: 2};
var model = Model.ref(obj, 'x').add(4)

model.set(6)


//console.log(obj)
//console.log(model.get())
//console.log(obj)
//console.log(model.get())

//console.log(cartesian)



import * as d3 from 'd3'


//class lineRef {
    //constructor(line) {
        //this.
    //}

//}

class Line2 {
    constructor(svg, data, imWidth, imHeight) {
        this.svg = svg
        this.data = data
        this.imWidth = imWidth
        this.imHeight = imHeight
    }

    set imageDimensions(val) {
        this.imWidth = val[0] || 1
        this.imHeight = val[1] || 1
        this.draw()
    }

    

    draw() {
        let g = this.svg.selectAll('.line-selection2')
            .data(this.data)
            .join('g')
            .attr("class", "line-selection2")
            .call(d3.drag()
                .on("start", this.dragstarted)
                .on("drag", this.dragged)
                .on("end", this.dragended)
            )
            .on('click', this.clicked)

        let line = g.selectAll('.main-line2')
            .data(d => [d])
            .join('line')
                .attr('class', 'main-line2')
                .attr("x1", d => d.x1)
                .attr("x2", d => d.x2)
                .attr("y1", d => d.y1)
                .attr("y2", d => d.y2)
                .attr("stroke-width", 3)
                .attr("stroke", d => d.fill)

        let hoverArea = g.selectAll('.hover-line2')
            .data(d => [d])
            .join('line')
                .attr('class', 'hover-line2')
                .attr("x1", d => d.x1)
                .attr("x2", d => d.x2)
                .attr("y1", d => d.y1)
                .attr("y2", d => d.y2)
                .attr('stroke-width', 25)
                .attr('stroke', 'white')
                .style('opacity', '0')
                .on('mouseover', this.handleLineMouseOver)
                .on('mouseout', this.mouseout)

    }
}

export default Line2