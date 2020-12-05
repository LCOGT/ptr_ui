<template>
    <div>{{lmst | decimal2hhmm}}</div>
</template>

<script>
export default {
    name: 'SiteSiderealTime',
    props: {
        longitude: Number,
    },
    data() {
        return {
            timer: '',
            lmst: '--',
        }
    },
    created() {
        this.siderealTime()
        this.timer = setInterval(this.siderealTime, 5000)
    },
    beforeDestroy() {
        clearInterval(this.timer)
    },

    watch: {
        longitude() {
            this.siderealTime()
        },
    },

    methods: {

        siderealTime() {
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

            lon = this.longitude


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

            this.lmst = lmst
        },
    },

    filters: {
        decimal2hhmm(hours) {

            if (isNaN(hours)) { return '--:--'}

            let h = Math.floor(hours)
            let m = Math.floor(60*(hours - h))
            
            if (h < 10) { 
                h = '0' + h
            }

            if (m < 10) {
                m = '0' + m
            }

            return h+':'+m
        }
    }
}
</script>
