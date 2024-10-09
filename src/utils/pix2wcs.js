
/**
 *  Procedure for coordinate transformation as described here:
 *  https://fits.gsfc.nasa.gov/registry/sip/SIP_distortion_v1_0.pdf
 *
 *  Distortion is corrected using the Simple Imaging Polynomial (SIP) convention
 *  provided in the fits headers of astrometry.net solutions.
 *
 */
const wcs = {}

/**
 *  From relative pixel coordinates x and y and CD matrix, obtain the ra
 *  and dec with the following matrix equation:
 *  [ra dec] = [[CD1_1 CD1_2][CD2_1 CD2_2]] * [a=x+f(x,y) b=y+g(x,y)]
 *
 *  @param  {Number}    x   mouse x coordinates, where 0 is the left column.
 *  @param  {Number}    y   mouse y coordinates, where 0 is the top row.
 *  @return {Number[]}      array with [ra, dec] with ra in hour angles, dec in degrees.
 *
 */
wcs.pix2wcs = function (x, y) {
  // Relative pixel coordinates u,v are simply x,y coordinates shifted
  // so that the origin lies at the pixel values defined in the fits header
  // CRPIX1 and CRPIX2
  const u = x - this.crpix[0]
  const v = (this.imageH - y) - this.crpix[1]

  // Vector [a,b] is the sum of the relative pixel coordinates u,v and their SIP
  // distortion corrections f(u,v), g(u,v).
  const a = u + this.f(u, v)
  const b = v + this.g(u, v)

  // The 2x2 CD matrix multiplies with the distortion-corrected pixels from above.
  // We also add CRVAL1, CRVAL2 which specify the intermediate world
  // coordinates at the origin (u,v).
  const ra = this.crval[0] + (a * this.CD[0][0]) + (b * this.CD[0][1])
  const dec = this.crval[1] + (a * this.CD[1][0]) + (b * this.CD[1][1])

  // Convert ra from degrees to hour angles [0,24).
  // ra = this.degree2hour(ra)

  return [ra, dec]
}

/**
 *  SIP distortion correction in u
 *  @param  {Number}  u Relative pixel x-coordinate, defined in pix2wcs
 *  @param  {Number}  v Relative pixel y-coordinate, defined in pix2wcs
 *  @return {Number}    Polynomial solved for given inputs.
 */
wcs.f = function (u, v) {
  let f = 0
  for (let p = 0; p < 3; p++) {
    for (let q = 0; q < 3; q++) {
      if (p + q <= this.A_order) {
        f = f + (this.A[p][q] * Math.pow(u, p) * Math.pow(v, q))
      }
    }
  }
  return f
}

/**
 *  SIP distortion correction in v
 *  @param  {Number}  u Relative pixel x-coordinate, defined in pix2wcs
 *  @param  {Number}  v Relative pixel y-coordinate, defined in pix2wcs
 *  @return {Number}    Polynomial solved for given inputs.
 */
wcs.g = function (u, v) {
  let g = 0
  for (let p = 0; p < 3; p++) {
    for (let q = 0; q < 3; q++) {
      if (p + q <= this.B_order) {
        g = g + (this.B[p][q] * Math.pow(u, p) * Math.pow(v, q))
      }
    }
  }
  return g
}

// Helper for converting right ascension in degrees to hour angles.
wcs.degree2hour = function (deg) {
  return deg > 0 ? deg / 15 : (deg + 360) / 15
}

// Hardcoded data for initial testing
wcs.CD = [[], []]
wcs.CD[0][0] = parseFloat('-1.19972030202E-05')
wcs.CD[0][1] = parseFloat('-0.000761947551202')
wcs.CD[1][0] = parseFloat('0.000761749736952')
wcs.CD[1][1] = parseFloat('-1.20574437687E-05')
wcs.crval = [85.2023950309, -2.37870414584]
wcs.crpix = [430.770599365, 639.483825684]
wcs.imageW = 1391
wcs.imageH = 1039

wcs.A_order = 2
wcs.A = [[], [], []]
wcs.A[0][0] = parseFloat(0)
wcs.A[0][1] = parseFloat(0)
wcs.A[0][2] = parseFloat('-1.71486482976E-07')
wcs.A[1][0] = parseFloat(0)
wcs.A[1][1] = parseFloat('4.79514406902E-07')
wcs.A[2][0] = parseFloat('5.92989718308E-07')

wcs.B_order = 2
wcs.B = [[], [], []]
wcs.B[0][0] = parseFloat(0)
wcs.B[0][1] = parseFloat(0)
wcs.B[0][2] = parseFloat('1.43958164659E-06')
wcs.B[1][0] = parseFloat(0)
wcs.B[1][1] = parseFloat('3.09782120435E-07')
wcs.B[2][0] = parseFloat('2.38922598437E-07')

export default wcs
