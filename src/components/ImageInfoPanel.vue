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
                            <td class="prop-col" align="right">capture time: </td>
                            <td>{{new Date(current_image.capture_date).toLocaleString()}}</td> 
                        </tr>
                        <tr> 
                            <td class="prop-col" align="right">site: </td>
                            <td>{{current_image.site}}</td> 
                        </tr>
                        <div class="blank-row" />

                        <tr> 
                            <td class="prop-col" align="right">exposure time: </td>
                            <td>{{current_image.exposure_time}}</td> 
                        </tr>
                        <tr> 
                            <td class="prop-col" align="right">filter_used: </td>
                            <td>{{current_image.filter_used}}</td> 
                        </tr>
                        <div class="blank-row" />

                        <tr> 
                            <td class="prop-col" align="right">right ascension: </td>
                            <td>{{current_image.right_ascension.toFixed(2)}}</td> 
                        </tr>
                        <tr> 
                            <td class="prop-col" align="right">declination: </td>
                            <td>{{current_image.declination.toFixed(2)}}</td> 
                        </tr>
                        <tr> 
                            <td class="prop-col" align="right">altitude: </td>
                            <td>{{current_image.altitude}}</td> 
                        </tr>
                        <tr> 
                            <td class="prop-col" align="right">azimuth: </td>
                            <td>{{current_image.azimuth}}</td> 
                        </tr>
                        <tr> 
                            <td class="prop-col" align="right">airmass: </td>
                            <td>{{current_image.airmass}}</td> 
                        </tr>
                    </table>
            </div>

        </b-collapse>
    </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
    name: "ImageInfoPanel",
    props: ["current_image"],
    methods: {
    },
    computed: {
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
