<template>
  <div ref="histogram-plot" id="histogram-plot"></div>
</template>

<script>
import { mapState } from 'vuex'
import * as d3 from 'd3'
import D3Axis from '@/components/svg/D3Axis'

export default {
  name: 'HistogramViewer',

  props: {
    counts: {
      type: Array,
      default: () => [0],
    },
    edges: {
      type: Array,
      default: () => [0, 1],
    }
  },

  components: {
    D3Axis,
  },

  data() {
    return {

      // chart margins
      mtop: 20,
      mright: 30,
      mbottom: 30,
      mleft: 50,

      // total chart dimensions (changed by resizeObserver) in pixels
      chart_width: 600,
      chart_height: 150,

      // Number of ticks on each axis
      x_ticks: 4,
      y_ticks: 4,
    }
  },

  mounted() {

    this.resizeObserver()

    // append the svg object to the body of the page
    this.svg = d3.select(this.$refs['histogram-plot'])
      .append("svg")
        .attr("width", this.chart_width)
        .attr("height", this.chart_height)
      .append("g")
        .attr("transform",
              "translate(" + this.mleft + "," + this.mtop + ")");

    // Add X axis
    this.x = d3.scaleLinear()
      .domain([this.edges[0], this.edges[this.edges.length - 1]])
      .range([0, this.inner_width])
    this.xAxis = this.svg.append("g")
      .attr("transform", "translate(0," + this.inner_height + ")")
      .call(d3.axisBottom(this.x).ticks(this.x_ticks));

    // Add Y axis
    this.y = d3.scaleLinear()
      .domain([d3.min(this.counts), d3.max(this.counts)])
      .range([ this.inner_height, 0 ]);
    this.yAxis = this.svg.append("g")
      .call(d3.axisLeft(this.y).ticks(this.y_ticks));

    this.clip = this.svg.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", this.inner_width)
        .attr("height", this.inner_height )
        .attr("x", 0)
        .attr("y", 0);

    // Add brushing
    this.brush = d3.brushX()
      .extent( [ [0,0], [this.inner_width, this.inner_height] ] ) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
      .on("end", this.updateChart) // Each time the brush selection changes, trigger the 'updateChart' function

    // Create the line variable where both the line and the brush take place
    this.line = this.svg.append('g')
      .attr("clip-path", "url(#clip)")

    // Add the line
    this.line.append("path")
      .datum(this.histogramCombined)
      .attr("class", "line")  
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
    chart_width() { this.draw(); }
  },

  methods: {

    draw() {

      d3.select(this.$refs['histogram-plot']).select('svg')
        .attr('width', this.chart_width)
        .attr('height', this.chart_height)

      // Add X axis 
      this.x
        .domain([this.edges[0], this.edges[this.edges.length - 1]])
        .range([0,this.inner_width])
      this.xAxis
        .call(d3.axisBottom(this.x).ticks(this.x_ticks));

      // Add Y axis
      this.y
        .domain([d3.min(this.counts), d3.max(this.counts)])
        .range([ this.inner_height, 0 ]);
      this.yAxis
        .call(d3.axisLeft(this.y).ticks(this.y_ticks));

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
        this.xAxis.transition().call(d3.axisBottom(this.x).ticks(this.x_ticks))
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
      if(selection !== null){
        this.x.domain([ this.x.invert(selection[0]), this.x.invert(selection[1]) ])
        this.line.select(".brush").call(this.brush.move, null) // This remove the grey brush area as soon as the selection has been done
      }

      // Update axis and line position
      this.xAxis.transition().duration(1000).call(d3.axisBottom(this.x))
        .call(d3.axisBottom(this.x).ticks(this.x_ticks));
      this.yAxis.transition().duration(1000).call(d3.axisLeft(this.y))
        .call(d3.axisLeft(this.y).ticks(this.y_ticks));
      this.line
          .select('.line')
          .transition()
          .duration(1000)
          .attr("stroke-width", 1.5)
          .attr("d", d3.line()
            .x(d => this.x(d[0]) )
            .y(d => this.y(d[1]) )
          )
    },

    // Responsive sizing: change chart size when parent changes.
    resizeObserver() {
      const updateSize = (w,h) => {
        this.chart_width = w
      }
      let ro = new ResizeObserver(entries => {
        for (let entry of entries) {
          const cr = entry.contentRect;
          updateSize(cr.width, cr.height)
        }
      });
      let imageEl = this.$refs['histogram-plot']
      // Set observers on the element(s)
      ro.observe(imageEl);
    },
  },


  computed: {

    ...mapState('dev', ['quickanalysis_endpoint']),

    inner_width() {
      return this.chart_width - this.mleft - this.mright
    },
    inner_height() {
      return this.chart_height - this.mtop - this.mbottom
    },

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
  }
}

</script>

<style scoped>
</style>
