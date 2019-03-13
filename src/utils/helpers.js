
/* Useful general functions */

var helpers = {
    siderealTime: function() {
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


        /* NOTE: Temporary fix. Hardcoded lon val. Should get value from state. */
        lon = -119;



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


