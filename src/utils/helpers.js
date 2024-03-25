
/* Useful general functions */

const helpers = {
  siderealTime: function (lon, date = null) {
    /* Local Sidereal Time with reference to J2000
        *
        * Equations courtesy of www.stargazing.net/kepler/altaz.html
        * and www.aberdeenastro.org.uk/sidereal_time.htm

        *  LST = 100.46 + 0.985647 * d + lon + 15*UT
        *
        *       d    is the days from J2000, including the fraction of a day
        *       UT   is the universal time in decimal hours
        *       lon is your longitude in decimal degrees, East positive.
        */
    lon = parseFloat(lon)

    // Calculate days since J2000
    let today_date
    // validate the date argument
    if (date instanceof Date && !isNaN(date.valueOf())) {
      today_date = new Date(date)
    } else {
      today_date = new Date()
    }
    const epoch_date = new Date(2000, 0, 1, 12, 0, 0)

    const today_time = today_date.getTime()
    const epoch_time = epoch_date.getTime()

    const milli_since_epoch = today_time - epoch_time
    const d = milli_since_epoch / 86400000

    // Calculate UT: universal time in decimal hours
    const h = today_date.getUTCHours()
    const m = today_date.getUTCMinutes()
    const s = today_date.getUTCSeconds()
    const UT = h + m / 60 + s / 3600

    // Local Sidereal Time:
    const lmst = ((100.46 + 0.985647 * d + lon + 15 * UT) % 360) / 15
    return lmst
  },
  eq2altaz: function (ra, dec, lat, lon, date = null) {
    /* Returns alt/az of a target at a given observation location and date
      * @param {number} ra, dec The right ascension and declination of the object
      * @param {number} lat, lon The latitude and longitude of the observer
      * @param {Date} date The date and time of observation, javascript Date object
      * @return {number} alt, az The altitude and azimuth of the object
      */

    // compute hour angle in degrees
    const sidereal = this.siderealTime(lon, date)
    let ha = sidereal - ra
    if (ha < 0) ha = ha + 360

    // convert degrees to radians
    ha = ha * Math.PI / 180
    dec = dec * Math.PI / 180
    lat = lat * Math.PI / 180

    // compute altitude in radians
    const sin_alt = Math.sin(dec) * Math.sin(lat) + Math.cos(dec) * Math.cos(lat) * Math.cos(ha)
    const alt = Math.asin(sin_alt)

    // compute azimuth in radians
    // divide by zero error at poles or if alt = 90 deg
    const cos_az = (Math.sin(dec) - Math.sin(alt) * Math.sin(lat)) / (Math.cos(alt) * Math.cos(lat))
    const az = Math.acos(cos_az)

    // convert radians to degrees
    const hrz_altitude = alt * 180 / Math.PI
    let hrz_azimuth = az * 180 / Math.PI

    // choose hemisphere
    if (Math.sin(ha) > 0) hrz_azimuth = 360 - hrz_azimuth
    return [hrz_altitude, hrz_azimuth]
  },

  hour2degree: ra => {
    return ra > 12 ? (ra - 24) * 15 : ra * 15
  },
  degree2hour: deg => {
    return deg > 0 ? deg / 15 : (deg + 360) / 15
  },
  rad2deg: rad => {
    return rad * 360 / (2 * Math.PI)
  },
  deg2rad: deg => {
    return deg * (2 * Math.PI) / 360
  },
  clamp: (val, min, max) => {
    return Math.max(Math.min(val, max), min)
  },
  xydistance: (a, b) => {
    const x1 = a[0]
    const x2 = b[0]
    const y1 = a[1]
    const y2 = b[1]
    return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2))
  },

  /**
     * Return the angular separation, in degrees, between two coordinates.
     * RA and Dec are inputs in decimal degrees because that is the most common unit we use for coordinates.
     *
     * Formula obtained from https://www.gyes.eu/calculator/calculator_page1.htm
     * @param {Number} ra1  RA of object 1, in decimal degrees
     * @param {Number} dec1 Dec of object 1, in decimal degrees
     * @param {Number} ra2  RA of obejct 2, in decimal degrees
     * @param {Number} dec2 Dec of object 2, in decimal degrees
     */
  angular_distance (ra1, dec1, ra2, dec2) {
    // convert to radians to use with js trig functions
    const ra1_r = this.deg2rad(ra1)
    const dec1_r = this.deg2rad(dec1)
    const ra2_r = this.deg2rad(ra2)
    const dec2_r = this.deg2rad(dec2)

    // Equation for angular distance A:
    // cos(A) = X + Y
    // where    X = sin(dec1)sin(dec2)
    // and      Y = cos(dec1)cos(dec2)cos(ra1 - ra2)

    const X = Math.sin(dec1_r) * Math.sin(dec2_r)
    const Y = Math.cos(dec1_r) * Math.cos(dec2_r) * Math.cos(ra1_r - ra2_r)

    const A = Math.acos(X + Y)

    // convert A to degrees before returning
    return this.rad2deg(A)
  },

  // Function to convert from julian days to unix time
  // Subtract difference in JD start vs unix start, then mulitply by
  // the number of miliseconds in a day.
  jd2unix (t) {
    return (t - 2440587.5) * 86400 * 1000
  }

}

export default helpers
