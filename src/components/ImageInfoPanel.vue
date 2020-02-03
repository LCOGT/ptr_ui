<template>
    <div>
        <b-collapse class="card" :open="true">
            <div
            slot="trigger" 
            slot-scope="props"
            class="card-header"
            role="button" >
                <p class="card-header-title"> Image Info </p>
                <a class="card-header-icon">
                    <b-icon :icon="props.open ? 'menu-down' : 'menu-up'"/>
                </a>
            </div>

            <div style="margin: 1em;">
                    <table>
                        <tr> 
                            <td class="prop-col" align="right">capture date: </td>
                            <!--td>{{moment.utc(new Date(current_image.capture_date)).format('YYYY:MM:DD HH:MM') ||-- "---"}}</td--> 
                            <td>{{captureDate}}</td>
                        </tr>
                        <tr>
                            <td class="prop-col" align="right">capture time: </td>
                            <td>{{captureTime + " GMT"}}</td>
                        </tr>
                        <tr> 
                            <td class="prop-col" align="right">site: </td>
                            <td>{{current_image.site || "---"}}</td> 
                        </tr>
                        <div class="blank-row" />

                        <tr> 
                            <td class="prop-col" align="right">exposure time: </td>
                            <td>{{current_image.exposure_time || "---"}}</td> 
                        </tr>
                        <tr> 
                            <td class="prop-col" align="right">filter_used: </td>
                            <td>{{current_image.filter_used || "---"}}</td> 
                        </tr>
                        <div class="blank-row" />

                        <tr> 
                            <td class="prop-col" align="right">right ascension: </td>
                            <td>{{rightAscension}}</td> 
                        </tr>
                        <tr> 
                            <td class="prop-col" align="right">declination: </td>
                            <td>{{declination}}</td> 
                        </tr>

                        <tr> 
                            <td class="prop-col" align="right">altitude: </td>
                            <td>{{current_image.altitude || "---"}}</td> 
                        </tr>
                        <tr> 
                            <td class="prop-col" align="right">azimuth: </td>
                            <td>{{current_image.azimuth || "---"}}</td> 
                        </tr>
                        <tr> 
                            <td class="prop-col" align="right">airmass: </td>
                            <td>{{current_image.airmass || "---"}}</td> 
                        </tr>
                    </table>
            </div>

        </b-collapse>
    </div>
</template>

<script>
import moment from 'moment';
import { mapState } from 'vuex';
export default {
    name: "ImageInfoPanel",
    props: {
        current_image: { type: Object }
    },
    methods: {
    },
    computed: {
        captureDate() {
            return moment.utc(new Date(this.current_image.capture_date)).format('MMMM DD, YYYY')
        },
        captureTime() {
            return moment.utc(new Date(this.current_image.capture_date)).format('HH:mm:ss')
        },
        rightAscension() {
            if (this.current_image.right_ascension){
                return this.current_image.right_ascension.toFixed(2)
            }
            return "---"
        },
        declination() {
            if (this.current_image.declination) {
                return this.current_image.declination.toFixed(2)
            }
            return "---"
        },

        ...mapState('js9', [
            'js9Zoom',
            'crosshairActive'
        ]),
        crosshairIsActive: {
            get() { return this.crosshairActive },
            set(val) { this.$store.commit('js9/crosshairActive', val)},
        },
        js9IsVisible: {
            get() { return this.$store.getters['js9/instanceIsVisible']},
            set(val) { this.$store.commit('js9/instanceIsVisible', val)},
        },
    }
}
</script>

<style scoped>
table {
    color: #dbdee0;
}
.prop-col {
    font-weight: bold;
    padding-right: 1em;
    padding-bottom: 5px;
}
.blank-row {
    height: 1.5em;
}
</style>
