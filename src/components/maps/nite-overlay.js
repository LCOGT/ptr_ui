/* Nite v1.7
 * A tiny library to create a night overlay over the map
 * Author: Rossen Georgiev @ https://github.com/rossengeorgiev
 * Requires: GMaps API 3
 */

/* eslint-disable */

const nite = {
  map: null,
  date: null,
  sun_position: null,
  moon_position: null,
  earth_radius_meters: 6371008,
  marker_twilight_civil: null,
  marker_twilight_nautical: null,
  marker_twilight_astronomical: null,
  marker_night: null,

  init: function (map) {
    if (typeof google === 'undefined' ||
      typeof google.maps === 'undefined') throw 'Nite Overlay: no google.maps detected'

    this.map = map
    this.sun_position = this.calculatePositionOfSun()
    this.moon_position = this.calculatePositionOfMoon()

    this.marker_twilight_civil = new google.maps.Circle({
      map: this.map,
      center: this.getShadowPosition(),
      radius: this.getShadowRadiusFromAngle(0.566666),
      fillColor: '#000',
      fillOpacity: 0.1,
      strokeOpacity: 0,
      clickable: false,
      editable: false
    })
    this.marker_twilight_nautical = new google.maps.Circle({
      map: this.map,
      center: this.getShadowPosition(),
      radius: this.getShadowRadiusFromAngle(6),
      fillColor: '#000',
      fillOpacity: 0.1,
      strokeOpacity: 0,
      clickable: false,
      editable: false
    })
    this.marker_twilight_astronomical = new google.maps.Circle({
      map: this.map,
      center: this.getShadowPosition(),
      radius: this.getShadowRadiusFromAngle(12),
      fillColor: '#000',
      fillOpacity: 0.1,
      strokeOpacity: 0,
      clickable: false,
      editable: false
    })
    this.marker_night = new google.maps.Circle({
      map: this.map,
      center: this.getShadowPosition(),
      radius: this.getShadowRadiusFromAngle(18),
      fillColor: '#000',
      fillOpacity: 0.1,
      strokeOpacity: 0,
      clickable: false,
      editable: false
    })
  },
  getShadowRadiusFromAngle: function (angle) {
    const shadow_radius = this.earth_radius_meters * Math.PI * 0.5
    const twilight_dist = ((this.earth_radius_meters * 2 * Math.PI) / 360) * angle
    return shadow_radius - twilight_dist
  },
  getSunPosition: function () {
    return this.sun_position
  },
  getMoonPosition: function () {
    return this.moon_position
  },
  getShadowPosition: function () {
    return (this.sun_position) ? new google.maps.LatLng(-this.sun_position.lat(), this.sun_position.lng() + 180) : null
  },
  refresh: function () {
    if (!this.isVisible()) return
    this.sun_position = this.calculatePositionOfSun(this.date)
    this.moon_position = this.calculatePositionOfMoon(this.date)
    const shadow_position = this.getShadowPosition()
    this.marker_twilight_civil.setCenter(shadow_position)
    this.marker_twilight_nautical.setCenter(shadow_position)
    this.marker_twilight_astronomical.setCenter(shadow_position)
    this.marker_night.setCenter(shadow_position)
  },
  jday: function (date) {
    return (date.getTime() / 86400000.0) + 2440587.5
  },
  calculatePositionOfSun: function (date) {
    date = (date instanceof Date) ? date : new Date()

    const rad = 0.017453292519943295

    // based on NOAA solar calculations
    const ms_past_midnight = ((date.getUTCHours() * 60 + date.getUTCMinutes()) * 60 + date.getUTCSeconds()) * 1000 + date.getUTCMilliseconds()
    const jc = (this.jday(date) - 2451545) / 36525
    const mean_long_sun = (280.46646 + jc * (36000.76983 + jc * 0.0003032)) % 360
    const mean_anom_sun = 357.52911 + jc * (35999.05029 - 0.0001537 * jc)
    const sun_eq = Math.sin(rad * mean_anom_sun) * (1.914602 - jc * (0.004817 + 0.000014 * jc)) + Math.sin(rad * 2 * mean_anom_sun) * (0.019993 - 0.000101 * jc) + Math.sin(rad * 3 * mean_anom_sun) * 0.000289
    const sun_true_long = mean_long_sun + sun_eq
    const sun_app_long = sun_true_long - 0.00569 - 0.00478 * Math.sin(rad * 125.04 - 1934.136 * jc)
    const mean_obliq_ecliptic = 23 + (26 + ((21.448 - jc * (46.815 + jc * (0.00059 - jc * 0.001813)))) / 60) / 60
    const obliq_corr = mean_obliq_ecliptic + 0.00256 * Math.cos(rad * 125.04 - 1934.136 * jc)

    const lat = Math.asin(Math.sin(rad * obliq_corr) * Math.sin(rad * sun_app_long)) / rad

    const eccent = 0.016708634 - jc * (0.000042037 + 0.0000001267 * jc)
    const y = Math.tan(rad * (obliq_corr / 2)) * Math.tan(rad * (obliq_corr / 2))
    const rq_of_time = 4 * ((y * Math.sin(2 * rad * mean_long_sun) - 2 * eccent * Math.sin(rad * mean_anom_sun) + 4 * eccent * y * Math.sin(rad * mean_anom_sun) * Math.cos(2 * rad * mean_long_sun) - 0.5 * y * y * Math.sin(4 * rad * mean_long_sun) - 1.25 * eccent * eccent * Math.sin(2 * rad * mean_anom_sun)) / rad)
    const true_solar_time_in_deg = ((ms_past_midnight + rq_of_time * 60000) % 86400000) / 240000

    const lng = -((true_solar_time_in_deg < 0) ? true_solar_time_in_deg + 180 : true_solar_time_in_deg - 180)

    return new google.maps.LatLng(lat, lng)
  },
  // Don't ask me how this works, formula from here -> https://stjarnhimlen.se/comp/tutorial.html#7
  calculatePositionOfMoon: function (date) {
    date = new Date()
    // Get the Julian Day Number for the given date
    const jdn = (date.getTime() / 86400000) + 2440587.5; // Convert milliseconds to days

    // Reference epoch (J2000)
    const referenceJDN = 2451545.0;

    // Calculate d
    const d = jdn - referenceJDN;

    // Constants
    const degToRad = Math.PI / 180;
    const radToDeg = 180 / Math.PI;

    // Normalize angle to 0-360 degrees
    function rev(angle) {
      const normalizedAngle = angle % 360;
      return normalizedAngle >= 0 ? normalizedAngle : normalizedAngle + 360;
    }

    // Initial orbital elements
    const N = rev(125.1228 - 0.0529538083 * d);
    const i = 5.1454;
    const w = rev(318.0634 + 0.1643573223 * d);
    const a = 60.2666;
    const e = 0.054900;
    const M = rev(115.3654 + 13.0649929509 * d);

    // Normalize M
    const normalizedM = rev(M + 129 * 360);

    // Compute eccentric anomaly (E)
    let E0 = normalizedM + (180 / Math.PI) * e * Math.sin(normalizedM) * (1 + e * Math.cos(normalizedM));
    let E1;

    do {
      E1 = E0 - (E0 - (180 / Math.PI) * e * Math.sin(E0) - normalizedM) / (1 - e * Math.cos(E0));
      E0 = E1;
    } while (Math.abs(E0 - E1) > 0.005);

    const E = E1;

    // Rectangular coordinates in the plane of the lunar orbit
    const x = a * (Math.cos(degToRad * E) - e);
    const y = a * Math.sqrt(1 - e * e) * Math.sin(degToRad * E);

    // Distance and true anomaly
    const r = Math.sqrt(x * x + y * y);
    const v = Math.atan2(y, x) * radToDeg;

    // Convert to ecliptic coordinates
    const xeclip = r * (Math.cos(degToRad * N) * Math.cos(degToRad * (v + w)) - Math.sin(degToRad * N) * Math.sin(degToRad * (v + w)) * Math.cos(degToRad * i));
    const yeclip = r * (Math.sin(degToRad * N) * Math.cos(degToRad * (v + w)) + Math.cos(degToRad * N) * Math.sin(degToRad * (v + w)) * Math.cos(degToRad * i));
    const zeclip = r * Math.sin(degToRad * (v + w)) * Math.sin(degToRad * i);

    // Convert to ecliptic longitude, latitude, and distance
    const eclipticLongitude = Math.atan2(yeclip, xeclip) * radToDeg;
    const eclipticLatitude = Math.atan2(zeclip, Math.sqrt(xeclip * xeclip + yeclip * yeclip)) * radToDeg;

    console.log(eclipticLongitude)
    console.log(eclipticLatitude)

    return new google.maps.LatLng(eclipticLatitude, eclipticLongitude)
  },
  setDate: function (date) {
    this.date = date
    this.refresh()
  },
  setMap: function (map) {
    this.map = map
    this.marker_twilight_civil.setMap(this.map)
    this.marker_twilight_nautical.setMap(this.map)
    this.marker_twilight_astronomical.setMap(this.map)
    this.marker_night.setMap(this.map)
  },
  show: function () {
    this.marker_twilight_civil.setVisible(true)
    this.marker_twilight_nautical.setVisible(true)
    this.marker_twilight_astronomical.setVisible(true)
    this.marker_night.setVisible(true)
    this.refresh()
  },
  hide: function () {
    this.marker_twilight_civil.setVisible(false)
    this.marker_twilight_nautical.setVisible(false)
    this.marker_twilight_astronomical.setVisible(false)
    this.marker_night.setVisible(false)
  },
  isVisible: function () {
    return this.marker_night.getVisible()
  }
}

export default nite

/* eslint-enable */
