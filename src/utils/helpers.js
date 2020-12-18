
/* Useful general functions */

var helpers = {
    siderealTime: function(lon) {
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

        var lmst, lon;
        var today_date;
        var epoch_date;
        var today_time;
        var epoch_time;
        var milli_since_epoch;
        var d, h, m, s;
        var UT;

        lon = parseFloat(lon)


        // Calculate days since J2000
        today_date = new Date();
        epoch_date = new Date(2000, 0, 1, 12, 0, 0);
        
        today_time = today_date.getTime();
        epoch_time = epoch_date.getTime();

        milli_since_epoch = today_time-epoch_time;
        d = milli_since_epoch/86400000;

        // Calculate UT: universal time in decimal hours
        h = today_date.getUTCHours();
        m = today_date.getUTCMinutes();
        s = today_date.getUTCSeconds();
        UT = h + m/60 + s/3600;

        // Local Sidereal Time:
        lmst = ((100.46 + 0.985647*d + lon + 15*UT) % 360) / 15;

        return lmst;
    },
    eq2altaz: function (ra, dec, lat, lon ) {
        // compute hour angle in degrees
        var sidereal = this.siderealTime(lon)
        var ha = sidereal - ra;
        if (ha < 0) ha = ha + 360;

        // convert degrees to radians
        ha  = ha*Math.PI/180
        dec = dec*Math.PI/180
        lat = lat*Math.PI/180

        // compute altitude in radians
        var sin_alt = Math.sin(dec)*Math.sin(lat) + Math.cos(dec)*Math.cos(lat)*Math.cos(ha);
        var alt = Math.asin(sin_alt);
        
        // compute azimuth in radians
        // divide by zero error at poles or if alt = 90 deg
        var cos_az = (Math.sin(dec) - Math.sin(alt)*Math.sin(lat))/(Math.cos(alt)*Math.cos(lat));
        var az  = Math.acos(cos_az);

        // convert radians to degrees
        var hrz_altitude = alt*180/Math.PI;
        var hrz_azimuth  = az*180/Math.PI;

        // choose hemisphere
        if (Math.sin(ha) > 0) hrz_azimuth = 360 - hrz_azimuth;
        return [hrz_altitude, hrz_azimuth]
    },

    hour2degree: ra => {
        return ra > 12? (ra - 24) * 15 : ra * 15;
    },
    degree2hour: deg => {
        return deg > 0 ? deg / 15 : (deg + 360) / 15
    },
    xydistance: (a,b) => {
        var x1,x2,y1,y2;
        x1 = a[0];
        x2 = b[0];
        y1 = a[1];
        y2 = b[1];
        return Math.sqrt(Math.pow((x2-x1), 2) + Math.pow((y2-y1), 2));
    },
}

export default helpers


