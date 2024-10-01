import { default_custom_object_styles } from './skymap_config'

const spectral_bv = {
  O5: -0.33,
  O9: -0.31,
  B0: -0.30,
  B2: -0.24,
  B5: -0.17,
  B8: -0.11,
  A0: -0.02,
  A2: 0.05,
  A5: 0.15,
  F0: 0.30,
  F2: 0.35,
  F5: 0.44,
  F8: 0.52,
  G0: 0.58,
  G2: 0.63,
  G5: 0.68,
  G8: 0.74,
  K0: 0.81,
  K2: 0.91,
  K5: 1.15,
  M0: 1.40,
  M2: 1.49,
  M5: 1.64
}

// b-v color index to rgb color value scale
const bvcolor = d3.scale
  .quantize()
  .domain([3.347, -0.335]) // main sequence <= 1.7
  .range(['#ff4700', '#ff4b00', '#ff4f00', '#ff5300', '#ff5600', '#ff5900', '#ff5b00', '#ff5d00', '#ff6000', '#ff6300', '#ff6500', '#ff6700', '#ff6900', '#ff6b00', '#ff6d00', '#ff7000', '#ff7300', '#ff7500', '#ff7800', '#ff7a00', '#ff7c00', '#ff7e00', '#ff8100', '#ff8300', '#ff8506', '#ff870a', '#ff8912', '#ff8b1a', '#ff8e21', '#ff9127', '#ff932c', '#ff9631', '#ff9836', '#ff9a3c', '#ff9d3f', '#ffa148', '#ffa34b', '#ffa54f', '#ffa753', '#ffa957', '#ffab5a', '#ffad5e', '#ffb165', '#ffb269', '#ffb46b', '#ffb872', '#ffb975', '#ffbb78', '#ffbe7e', '#ffc184', '#ffc489', '#ffc78f', '#ffc892', '#ffc994', '#ffcc99', '#ffce9f', '#ffd1a3', '#ffd3a8', '#ffd5ad', '#ffd7b1', '#ffd9b6', '#ffdbba', '#ffddbe', '#ffdfc2', '#ffe1c6', '#ffe3ca', '#ffe4ce', '#ffe8d5', '#ffe9d9', '#ffebdc', '#ffece0', '#ffefe6', '#fff0e9', '#fff2ec', '#fff4f2', '#fff5f5', '#fff6f8', '#fff9fd', '#fef9ff', '#f9f6ff', '#f6f4ff', '#f3f2ff', '#eff0ff', '#ebeeff', '#e9edff', '#e6ebff', '#e3e9ff', '#e0e7ff', '#dee6ff', '#dce5ff', '#d9e3ff', '#d7e2ff', '#d3e0ff', '#c9d9ff', '#bfd3ff', '#b7ceff', '#afc9ff', '#a9c5ff', '#a4c2ff', '#9fbfff', '#9bbcff'])

const starSize = (d, starbase, starexp) => {
  const mag = d.properties.mag
  if (mag === null) return 0.1
  const r = starbase * Math.exp(starexp * (mag + 2))
  return Math.max(r, 0.1)
}

// Set min distance between labels to prevent overlap; used in drawing functions
const PROXIMITY_LIMIT = 30

// Simple point distance function
const distance = (p1, p2) => {
  const d1 = p2[0] - p1[0]
  const d2 = p2[1] - p1[1]
  return Math.sqrt(d1 * d1 + d2 * d2)
}

const drawAirmassCircle = (Celestial, quadtree) => {
  // Draw a circle centered at the zenith with a radius that extends to a certain airmass (altitude) above horizon
  if (!Celestial.customData.airmassCircle?.show) return

  const mouseIsHovering = Celestial.customData.airmassCircle.isHovered
  const color = 'yellow'
  const lineWidth = 0.5

  const degreesAboveHorizon = Celestial.customData.airmassCircle.degAboveHorizon
  const degreesBelowZenith = 90 - degreesAboveHorizon

  const zenith = Celestial.zenith() // zenith ra/dec (degrees)
  const zenithXY = Celestial.mapProjection(zenith) // convert to xy pixel coords

  // Don't show if zenith is [0,0]
  // This is a simple fix to avoid rendering the circle before the map has positioned itself.
  // Not worth worrying about the rare and brief moments when the zenith actually is [0,0].
  // Maybe there is a more elegant solution but this sky chart is impossible to figure out sometimes.
  if (zenith[0] == 0 && zenith[1] == 0) return

  const horizon = [zenith[0], zenith[1] - degreesBelowZenith] // get a point on the horizon
  const horizonXY = Celestial.mapProjection(horizon) // convert to xy pixel coords

  // the radius of our circle is the difference between the y coordinate for the horizon point and zenith
  const radiusPix = Math.abs(zenithXY[1] - horizonXY[1])

  // draw the circle
  Celestial.context.strokeStyle = color
  Celestial.context.lineWidth = lineWidth
  Celestial.context.beginPath()
  Celestial.context.arc(zenithXY[0], zenithXY[1], radiusPix, 0, 2 * Math.PI)
  Celestial.context.closePath()
  Celestial.context.stroke()

  // Add object name if the user is hovering over the circle and if there is space
  const nameStyle = { fill: color, font: '12px Helvetica, Arial, serif', align: 'center', baseline: 'top' }
  const textPos = [zenithXY[0], zenithXY[1] + radiusPix + 5]
  const label = `altitude: ${Math.round(degreesAboveHorizon)}°`
  const nearest = quadtree.find(textPos)
  const no_overlap = !nearest || distance(nearest, textPos) > PROXIMITY_LIMIT
  if (no_overlap && mouseIsHovering) {
    quadtree.add(textPos)
    Celestial.setTextStyle(nameStyle)
    Celestial.context.fillText(label, zenithXY[0], zenithXY[1] + radiusPix + 5)
  }
}

const draw_star = (Celestial, quadtree, styles, starbase, starexp, d) => {
  if (!Celestial.customData.stars.show) return
  if (d.properties.mag > Celestial.customData.stars.minMagnitude) return
  const pt = Celestial.mapProjection(d.geometry.coordinates)
  const r = starSize(d, starbase, starexp)
  Celestial.setStyle(styles.star)
  // Apply spectral star colors unless we're in red mode.
  if (d.properties.spectral && styles.name != 'red') {
    const bv = spectral_bv[d.properties.spectral.slice(0, 2)]
    Celestial.context.fillStyle = bvcolor(bv)
  }
  Celestial.context.beginPath()
  Celestial.context.arc(pt[0], pt[1], r, 0, 2 * Math.PI)
  Celestial.context.closePath()
  Celestial.context.fill()

  // Add object name if there is space
  const nearest = quadtree.find(pt)
  const no_overlap = !nearest || distance(nearest, pt) > PROXIMITY_LIMIT
  if (no_overlap && d.properties.mag < styles.star.nameLimit) {
    quadtree.add(pt)
    Celestial.setTextStyle(styles.star.nameStyle)
    Celestial.context.fillText(d.properties.name, pt[0] + r, pt[1] - r)
  }
}

const draw_galaxy = (Celestial, quadtree, styles, d) => {
  if (!Celestial.customData.galaxies.show) return
  const pt = Celestial.mapProjection(d.geometry.coordinates)
  const mag = d.properties.mag
  const m = d.properties.messier
  const s = 9
  const r = s / Math.sqrt(3)
  if (mag > Celestial.customData.galaxies.minMagnitude || mag < Celestial.customData.galaxies.maxMagnitude) return
  styles.galaxy.opacity = Math.pow((3.0 / mag), 1.5) / 2 + 0.5 // arbitrary dimming calc
  Celestial.setStyle(styles.galaxy)
  Celestial.context.beginPath()
  Celestial.context.moveTo(pt[0], pt[1] - r)
  Celestial.context.lineTo(pt[0] + r, pt[1] + r)
  Celestial.context.lineTo(pt[0] - r, pt[1] + r)
  Celestial.context.closePath()
  Celestial.context.fill()

  // Add object name if there is space
  const nearest = quadtree.find(pt)
  const no_overlap = !nearest || distance(nearest, pt) > PROXIMITY_LIMIT
  if (no_overlap && mag < styles.galaxy.nameLimit) {
    quadtree.add(pt)
    Celestial.setTextStyle(styles.galaxy.nameStyle)
    Celestial.context.fillText('M' + m, pt[0] + r, pt[1] - r)
  }
}

const draw_nebula = (Celestial, quadtree, styles, d) => {
  if (!Celestial.customData.nebula.show) return
  const pt = Celestial.mapProjection(d.geometry.coordinates)
  const mag = d.properties.mag
  const m = d.properties.messier
  const s = 8
  const r = s / 1.5
  if (mag > Celestial.customData.nebula.minMagnitude || mag < Celestial.customData.nebula.maxMagnitude) return
  styles.nebula.opacity = Math.pow((5.5 / mag), 1.3)
  Celestial.setStyle(styles.nebula)
  Celestial.context.beginPath()
  Celestial.context.moveTo(pt[0], pt[1] - r)
  Celestial.context.lineTo(pt[0] + r, pt[1])
  Celestial.context.lineTo(pt[0], pt[1] + r)
  Celestial.context.lineTo(pt[0] - r, pt[1])
  Celestial.context.closePath()
  Celestial.context.fill()

  // Add object name if there is space
  const nearest = quadtree.find(pt)
  const no_overlap = !nearest || distance(nearest, pt) > PROXIMITY_LIMIT
  if (no_overlap && mag < styles.nebula.nameLimit) {
    quadtree.add(pt)
    Celestial.setTextStyle(styles.nebula.nameStyle)
    Celestial.context.fillText('M' + m, pt[0] + r, pt[1] - r)
  }
}

const draw_globular_cluster = (Celestial, quadtree, styles, d) => {
  if (!Celestial.customData.globularClusters.show) return
  const pt = Celestial.mapProjection(d.geometry.coordinates)
  const mag = d.properties.mag
  const m = d.properties.messier
  const s = 8
  const r = s / 1.5
  if (mag > Celestial.customData.globularClusters.minMagnitude || mag < Celestial.customData.globularClusters.maxMagnitude) return
  styles.globular_cluster.opacity = Math.pow((5.5 / mag), 6)
  Celestial.setStyle(styles.globular_cluster)
  Celestial.map(d)
  Celestial.context.beginPath()
  Celestial.context.arc(pt[0], pt[1], 3, 0, 2 * Math.PI)
  Celestial.context.closePath()
  Celestial.context.stroke()

  // Add object name if there is space
  const nearest = quadtree.find(pt)
  const no_overlap = !nearest || distance(nearest, pt) > PROXIMITY_LIMIT
  if (no_overlap && mag < styles.globular_cluster.nameLimit) {
    quadtree.add(pt)
    Celestial.setTextStyle(styles.globular_cluster.nameStyle)
    Celestial.context.fillText('M' + m, pt[0] + r, pt[1] - r)
  }
}

const draw_open_cluster = (Celestial, quadtree, styles, d) => {
  if (!Celestial.customData.openClusters.show) return
  const pt = Celestial.mapProjection(d.geometry.coordinates)
  const mag = d.properties.mag
  const m = d.properties.messier
  const s = 8
  const r = s / 1.5
  if (mag > Celestial.customData.openClusters.minMagnitude || mag < Celestial.customData.openClusters.maxMagnitude) return
  styles.open_cluster.opacity = Math.pow((4.5 / mag), 2) / 2 + 0.7
  Celestial.setStyle(styles.open_cluster)
  Celestial.map(d)
  Celestial.context.beginPath()
  Celestial.context.arc(pt[0], pt[1], 3, 0, 2 * Math.PI)
  Celestial.context.closePath()
  Celestial.context.stroke()

  // Add object name if there is space
  const nearest = quadtree.find(pt)
  const no_overlap = !nearest || distance(nearest, pt) > PROXIMITY_LIMIT
  if (no_overlap && mag < styles.open_cluster.nameLimit) {
    quadtree.add(pt)
    Celestial.setTextStyle(styles.open_cluster.nameStyle)
    Celestial.context.fillText('M' + m, pt[0] + r, pt[1] - r)
  }
}

const draw_generic = (Celestial, quadtree, styles, d) => {
  const pt = Celestial.mapProjection(d.geometry.coordinates)
  const s = 8
  const r = s / 1.5
  Celestial.setStyle(styles.point)
  Celestial.map(d)
  Celestial.context.beginPath()
  Celestial.context.arc(pt[0], pt[1], 5, 0, 2 * Math.PI)
  Celestial.context.closePath()
  Celestial.context.stroke()

  // Add object name if there is space
  const nearest = quadtree.find(pt)
  const no_overlap = !nearest || distance(nearest, pt) > PROXIMITY_LIMIT
  if (no_overlap && d.properties.name != null) {
    quadtree.add(pt)
    Celestial.setTextStyle(styles.point.nameStyle)
    Celestial.context.fillText(d.properties.name, pt[0] + r, pt[1] - r)
  }
}

// Helper functions to determine whether one of our sky objects is of a certain type. Used in drawing to canvas.
const is_nebula = type => ['Pl', 'Di', 'Bn', 'Dn', 'Sn'].indexOf(type) !== -1
const is_galaxy = type => ['Cg', 'Sp', 'Ba', 'Ir', 'El', 'Ln', 'Px', 'Sx'].indexOf(type) !== -1
const is_star = type => ['Ds', '**', 'star'].indexOf(type) !== -1

/**
 * Add custom data to the map from a json file. Currently, this is just a bunch of popular objects.
 * The method includes the callback function that Celestial uses to style and render the objects.
 */
const add_custom_data = (Celestial, base_config, data_list) => {
  // Default to normal object symbols on sky chart
  const styles = default_custom_object_styles

  // Add data and redraw the map
  Celestial.clear()
  for (const data_file of data_list) {
    Celestial.add({
      type: 'json',
      file: data_file,
      callback: (error, json) => {
        if (error) { return console.warn(error) }
        const sky_objects = Celestial.getData(json, base_config.transform)
        Celestial.container.selectAll('.custom_objects')
          .data(sky_objects.features)
          .enter().append('path')
          .attr('class', 'custom_obj')
      },
      redraw: () => {
        // The quadtree is used to avoid rendering object names that overlap
        const m = Celestial.metrics()
        const quadtree = d3.geom.quadtree().extent([[-1, -1], [m.width + 1, m.height + 1]])([])

        drawAirmassCircle(Celestial, quadtree)
        Celestial.container.selectAll('.custom_obj').each((d) => {
          if (Celestial.clip(d.geometry.coordinates)) {
            const type = d.properties.type
            if (is_galaxy(type)) {
              draw_galaxy(Celestial, quadtree, styles, d)
            } else if (is_nebula(type)) {
              draw_nebula(Celestial, quadtree, styles, d)
            } else if (type == 'Gc') {
              draw_globular_cluster(Celestial, quadtree, styles, d)
            } else if (type == 'Oc') {
              draw_open_cluster(Celestial, quadtree, styles, d)
            } else if (is_star(type)) {
              draw_star(Celestial, quadtree, styles,
                base_config.stars.size, base_config.stars.exponent, d)
            } else {
              draw_generic(Celestial, quadtree, styles, d)
            }
          }
        })
      }
    })
  };
}

export default add_custom_data
