<template>
    <div>
        <div id="celestial-map">
            <interaction-canvas 
                v-if="skychartCreated" 
                ref="interaction"
                :width="celestial_canvas_width"
                :height="celestial_canvas_height"
                :user_crosshairs="user_crosshairs"
                :telescope_crosshairs="telescope_crosshairs"
                :mouse_in_sky="mouse_in_sky"
                @i_mousedown="handle_mousedown"
                @i_mouseup="handle_mouseup"
                @i_mousemove="handle_mousemove"
                @i_mouseover="handle_mouseover"
            />
        </div>
    </div>
</template>

<script>
import InteractionCanvas from "@/components/celestialmap/InteractionCanvas"
import celestial from 'd3-celestial'
import add_custom_data from '@/components/celestialmap/add_custom_data'
import { base_config, default_object_styles } from '@/components/celestialmap/skymap_config'
import helpers from '@/utils/helpers'
import { status_mixin } from '@/mixins/status_mixin'
import { mapGetters } from 'vuex'

let Celestial = celestial.Celestial()

export default {
    name: 'TheSkyChart',
    components: { InteractionCanvas },
    props: {
        width: {
            type: Number,
            default: 200,
        },
        height: {
            type: Number,
            default: 200,
        },
    },
    mixins: [status_mixin],
    data () {
        return {
            // Used to make sure the interaction layer starts up after the main sky chart is loaded
            skychartCreated: false,

            // These values are used to keep the interaction canvas size identical
            celestial_canvas_width: 200,
            celestial_canvas_height: 200,

            // These are the pixel coordinate values for drawing to the interaction canvas
            user_crosshairs: [-1, -1],
            telescope_crosshairs: [-1, -1],

            // Whether or not the mouse is hovering over the sky part of the map.
            mouse_in_sky: false,
        }
    },
    mounted() {

        let config = base_config

        // Set the map config to show the sky for the selected observatory site
        config.center = [
            helpers.hour2degree(helpers.siderealTime(parseFloat(this.site_longitude))), 
            parseFloat(this.site_latitude)
        ]
        config.follow = "center"

        // Add custom data to display on the map
        const custom_data_path = "/data/all_objects.json"
        add_custom_data(Celestial, config, custom_data_path);

        // Load the configuration and display the map
        Celestial.display(config)

        // This toggles the v-if in the interaction layer canvas.
        // We need to make sure the map canvas is loaded first, otherwise 
        // it will load using the interaction canvas element.
        this.skychartCreated = true

        // Get the d3-celestial canvas element. To distinguish from our interaction canvas,
        // get the canvas without an ID.
        let canvas_list = document.getElementById('celestial-map').querySelectorAll('canvas')
        let celestial_canvas = Array.from(canvas_list).find( e => e.id == '') 

        // Update the values that are fed into the interaction layer to match the sky chart
        this.celestial_canvas_width = celestial_canvas.width
        this.celestial_canvas_height = celestial_canvas.height

        // Add a resize observer to the skychart to keep the interaction layer size synced
        this.resize_observer = new ResizeObserver(elements => {
            for (let element of elements) {
                const content_rect = element.contentRect
                this.celestial_canvas_width = content_rect.width
                this.celestial_canvas_height = content_rect.height
                this.redraw_interaction_layer()
            }
        })
        this.resize_observer.observe(celestial_canvas)

        // Update the crosshairs in the interaction layer whenever the underlying map is redrawn
        Celestial.addCallback(this.update_telescope_crosshairs)
        Celestial.addCallback(this.update_user_crosshairs)

        // Set the interaction layer to show the various crosshairs
        this.update_telescope_crosshairs()
        this.update_user_crosshairs()


        // Update the center of the map every minute
        this.updateMapCenterInterval = setInterval(this.rotate, 6000)
    },

    beforeDestroy() {
        this.resize_observer.disconnect()
        clearInterval(this.updateMapCenterInterval)
    },

    methods: {

        /** The following few handler methods deal with data coming from the interaction layer */
        handle_mousedown(e) {
            let map_coords = Celestial.mapProjection.invert(e)

            // If the click fell within the visible horizon (not outside the map)
            if (Celestial.clip(map_coords)) { 
                this.user_crosshairs = this.pix_to_relative(e) // update the visible interaction layer
                // Save the selected ra/dec
                map_coords[0] = helpers.degree2hour(map_coords[0])
                this.$store.commit('command_params/mount_ra', map_coords[0].toFixed(4)) 
                this.$store.commit('command_params/mount_dec', map_coords[1].toFixed(4)) 
            }
        },
        handle_mouseup(e) { },
        handle_mousemove(e) { },
        handle_mouseover(e) {  // Determine whether the mouse is inside the map or not
            let map_coords = Celestial.mapProjection.invert(e)
            this.mouse_in_sky = !!Celestial.clip(map_coords)  // !! converts 0 or 1 to boolean
        },

        rotate() {
            const a = helpers.hour2degree(helpers.siderealTime(this.site_longitude))
            const b = this.site_latitude
            // make sure we dont' get an infinite loop due to bad params
            if (!a && !b) {
                console.warn('bad skymap rotate parameters: ', a, b)
                return;
            }
            Celestial.rotate({center:[a, b, 0], follow: "center", transform: "equatorial"})
            Celestial.redraw()
        },

        // Transform x,y array in raw pixels to relative coordinates (vals in [0,1])
        // For example: in a 200px square, this function transforms [40, 50] to [0.2, 0.25].
        // Used when sending click coordinates (pixels) to the interaction canvas (relative).
        pix_to_relative(raw_xy_array) {
            return [ raw_xy_array[0] / this.celestial_canvas_width,
                     raw_xy_array[1] / this.celestial_canvas_height ]
        },

        // If the interaction layer has mounted, call its 'redraw' method.
        // This updates the crosshairs displayed on the map
        redraw_interaction_layer() {
            if (Object.keys(this.$refs).includes('interaction')) {
                this.$refs.interaction.redraw_all()
            }
        },

        // Update the telescope crosshair position
        update_telescope_crosshairs() {
            let t_coords = [helpers.hour2degree(this.mount_pointing_ra), this.mount_pointing_dec]; // from status mixin
            if (Celestial.clip(t_coords)) {
                this.telescope_crosshairs = this.pix_to_relative(Celestial.mapProjection(t_coords))
            } else {  // don't render if not in visible map
                this.telescope_crosshairs = [-1, -1]
            }
            this.redraw_interaction_layer()
        },

        // Update the user crosshair position 
        update_user_crosshairs() {
            let user_coords = ([helpers.hour2degree(this.ra_user_input), this.dec_user_input]);
            let pixel_coords = Celestial.mapProjection(user_coords)
            if (Celestial.clip(user_coords)) {
                this.user_crosshairs = this.pix_to_relative(pixel_coords)
            } else {
                this.user_crosshairs = [-1, -1]
            }
            this.redraw_interaction_layer()
        }

    },

    watch: {
        // Update the chart if the mount pointing has changed
        mount_pointing_ra() {  this.update_telescope_crosshairs() },
        mount_pointing_dec() { this.update_telescope_crosshairs() },

        // Update the chart if the mount command coordinates are changed
        ra_user_input() { this.update_user_crosshairs() },
        dec_user_input() { this.update_user_crosshairs() },

        site_latitude() { this.rotate() },
        site_longitude() { this.rotate() },
    },

    computed: {
        ...mapGetters('site_config', [
            'site_latitude',
            'site_longitude',
        ]),

        // Mount pointing status (from the status mixin), but with clearer names
        ...mapGetters('sitestatus', {
            mount_pointing_ra: 'ra',
            mount_pointing_dec: 'dec',
        }),

        // User-provided coordinates that would be sent in a telescope goto command.
        // They can be typed into the command field, or updated by clicking on the sky chart or aladin.
        ...mapGetters('command_params', {
            ra_user_input: 'mount_ra',
            dec_user_input: 'mount_dec'
        })
    },
}
</script>
