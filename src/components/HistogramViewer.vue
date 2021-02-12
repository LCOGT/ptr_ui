<template>
  <div ref="histogram-plot" id="histogram-plot" style="height: 500px;">
    <!--svg id="histogram-svg" :viewbox="`0 0 500 ${height}`" :style="`width: ${width}px; height: ${height}px`">
      <path id="hist-line-path" :d="linePath" fill="none" stroke="gold" stroke-width="1.5" ></path>
      <g id="hist-y-axis" />
      <g id="hist-x-axis" />
    </svg-->
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as d3 from 'd3'
import { select } from 'd3-selection'
import transition from 'd3-transition'
import D3Axis from '@/components/svg/D3Axis'

export default {
  name: 'HistogramViewer',

  props: {
    counts: {
      type: Array,
      default: () => [0,1,3,2,0,1,0],
    },
    edges: {
      type: Array,
      default: () => [0,0.5,1,1.5,2,3, 4, 5],
    }
  },

  components: {
    D3Axis,
  },

  data() {
    return {

      chartMargin: {
        top: 20,
        right: 30,
        bottom: 30,
        left: 40,
      },
      // aka
      mtop: 20,
      mright: 30,
      mbottom: 30,
      mleft: 40,

      width: 600 - 30 - 40, //subtract margins
      height: 400 - 20 - 30,

    }
  },

  mounted() {

    this.resizeObserver()

    // append the svg object to the body of the page
    this.svg = d3.select("#histogram-plot")
      .append("svg")
        .attr("width", this.width + this.mleft + this.mright)
        .attr("height", this.height + this.mtop + this.mbottom)
      .append("g")
        .attr("transform",
              "translate(" + this.mleft + "," + this.mtop + ")");

    // Add X axis
    this.x = d3.scaleLinear()
      .domain([this.edges[0], this.edges[this.edges.length - 1]])
      .range([0, this.width])
    this.xAxis = this.svg.append("g")
      .attr("transform", "translate(0," + this.height + ")")
      .call(d3.axisBottom(this.x));

    // Add Y axis
    this.y = d3.scaleLinear()
      //.domain([0, d3.max(data, function(d) { return +d.value; })])
      .domain([d3.min(this.counts), d3.max(this.counts)])
      .range([ this.height, 0 ]);
    this.yAxis = this.svg.append("g")
      .call(d3.axisLeft(this.y));

    this.clip = this.svg.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", this.width )
        .attr("height", this.height )
        .attr("x", 0)
        .attr("y", 0);

    // Add brushing
    this.brush = d3.brushX()                 // Add the brush feature using the d3.brush function
      .extent( [ [0,0], [this.width,this.height] ] ) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
      .on("end", this.updateChart) // Each time the brush selection changes, trigger the 'updateChart' function

    // Create the line variable: where both the line and the brush take place
    this.line = this.svg.append('g')
      .attr("clip-path", "url(#clip)")

    // Add the line
    this.line.append("path")
      .datum(this.histogramCombined)
      .attr("class", "line")  // I add the class line to be able to modify this line later on.
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x(d => this.x(d[0]) )
        .y(d => this.y(d[1]) )
      )

    // Add the brushing
    this.line
      .append("g")
        .attr("class", "brush")
        .call(this.brush);

    this.draw()
  },

  watch: {
    edges() { this.draw(); },
    count() { this.draw(); },
  },

  methods: {

    draw() {

      // Add X axis --> it is a date format
      this.x
        //.domain(d3.extent(data, function(d) { return d.date; }))
        .domain([this.edges[0], this.edges[this.edges.length - 1]])
        //.range([margin.left, this.width - margin.right])
        .range([0, this.width])
      this.xAxis
        //.attr("transform", "translate(0," + this.height + ")")
        .call(d3.axisBottom(this.x));

      // Add Y axis
      this.y
        .domain([d3.min(this.counts), d3.max(this.counts)])
        .range([ this.height, 0 ]);
      this.yAxis
        .call(d3.axisLeft(this.y));

      // Add a clipPath: everything out of this area won't be drawn.
      //this.clip = this.svg.append("defs").append("svg:clipPath")
          //.attr("id", "clip")
          //.append("svg:rect")
          //.attr("width", this.width )
          //.attr("height", this.height )
          //.attr("x", 0)
          //.attr("y", 0);
      this.line.select('path')
        .datum(this.histogramCombined)
        .attr("class", "line")  // I add the class line to be able to modify this line later on.
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
          .x(d => this.x(d[0]) )
          .y(d => this.y(d[1]) )
        )

      // If user double click, reinitialize the chart
      this.svg.on("dblclick",() => {
        this.x.domain([this.edges[0], this.edges[this.edges.length - 1]])
        this.y.domain([d3.min(this.counts), d3.max(this.counts)])
        this.xAxis.transition().call(d3.axisBottom(this.x))
        this.line
          .select('.line')
          .transition()
          .attr("d", d3.line()
            .x(d => this.x(d[0]) )
            .y(d => this.y(d[1]) )
        )
      });
    },

    updateChart(e) {

      // What are the selected boundaries?
      let selection = d3.event.selection

      // If no selection, back to initial coordinate. Otherwise, update X axis domain
      if(selection === null){
        //if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
        //this.x.domain([ 4,8])
      }else{
        this.x.domain([ this.x.invert(selection[0]), this.x.invert(selection[1]) ])
        this.line.select(".brush").call(this.brush.move, null) // This remove the grey brush area as soon as the selection has been done
      }

      // Update axis and line position
      this.xAxis.transition().duration(1000).call(d3.axisBottom(this.x))
        //.attr("transform", "translate(0," + this.height + ")")
        .call(d3.axisBottom(this.x));
      this.line
          .select('.line')
          .transition()
          .duration(1000)
          .attr("d", d3.line()
            .x(d => this.x(d[0]) )
            .y(d => this.y(d[1]) )
          )
    },

    drawYAxis() {
      //this.yAxis = d3.select('#hist-y-axis')
        //.attr("transform", `translate(${this.chartMargin.left},0)`)
        //.call(d3.axisLeft(this.yScale).ticks(6, d3.format(",.0f")))
    },
    drawXAxis() {
      //this.xAxis = d3.select('#hist-x-axis')
        //.attr("transform", `translate(0,${this.height - this.chartMargin.bottom})`)
        //.call(d3.axisBottom(this.xScale).ticks(this.width / 80).tickSizeOuter(0))
    },

    // Responsive sizing
    resizeObserver() {
      const updateSize = (w,h) => {
        this.width = w
        this.height = h
        //this.drawYAxis()
        //this.drawXAxis()
      }
      let ro = new ResizeObserver(entries => {
        for (let entry of entries) {
          const cr = entry.contentRect;
          updateSize(cr.width, cr.height)
        }
      });
      let imageEl = this.$refs['histogram-plot']
      console.log(this.$refs)
      //this.imageEl = document.getElementById('histogram-plot')
      // Set observers on the element(s)
      ro.observe(imageEl);
    },

  },

  computed: {

    ...mapState('dev', ['quickanalysis_endpoint']),

    histogramCombined() {
      if (this.counts.length >= this.edges.length) {
        console.error("Histogram counts and edges don't correspond.")
        return [[0,0], [0,0]]
      }
      let combined = []
      this.counts.forEach((count, idx) => {
        let edge_mid = this.edges[idx] + ((this.edges[idx + 1] - this.edges[idx]) / 2)
        combined.push([edge_mid, count])
      })
      return combined
    },

    xScale() {
      let margin = this.chartMargin
      return (
        d3.scaleLinear()
          .domain([this.edges[0], this.edges[this.edges.length - 1]])
          .range([margin.left, this.width - margin.right])
      )
    },
    yScale() {
      let margin = this.chartMargin
      return (
        d3.scaleLinear()
          .domain([d3.min(this.counts), d3.max(this.counts)])
          .range([this.height - margin.bottom, margin.top])
      )
    },

    //brushing() {
      //// Add brushing
      //return d3.select("#histogram-svg")
        //.call( d3.brushX()                     // Add the brush feature using the d3.brush function
          //.extent( [ [0,0], [this.width, this.height] ] )       // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
        //)
    //},

    linePath() {
      this.drawYAxis()
      this.drawXAxis()
      const line = d3
          .line()
          .x(d => this.xScale(d[0]))
          .y(d => this.yScale(d[1]))(this.histogramCombined)
      return line
    },
  }



}
</script>
