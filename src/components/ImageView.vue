<template>
    <div class="columns">
        <div class="column">

            <div id="svg_container"></div>
            <svg id='image_svg'>
                <image  style="width: 768px; height: 768px;" :href="latest_image_url"></image>
            </svg>

            <div style="display: flex; justify-content: space-between;">
                <p>mouseX: {{mouseX}}, mouseY: {{mouseY}}</p>
                <p> {{latest_image_name}} </p>
            </div>
        </div>

        <div class="column is-narrow recent_images">

            <div 
                class="recent_image" 
                style="display: flex;"
                v-for="(item, index) in recent_images" 
                v-bind:key="index"
            >
                <img 
                    style="width: 60px; height: 60px;"
                    v-bind:src="item.url"
                    v-bind:title="item.filename"
                    @click="setActiveImage(item)"
                >
                <p style="padding-left: 5px;">{{item.filename.slice(-13)}}</p>
            </div>
                
        </div>

        <div class="column controls">
            <button class="button" @click="getImageURL">refresh images</button>
            <b-field horizontal label="crosshairs">
                <b-switch type="is-info" v-model="show_crosshairs" v-on:input="toggleCrosshairs"></b-switch>
            </b-field>
        </div>

        <ul id="context-menu" class="menu">
            <li class="svg" id="svg-id">SVG Item</li>
            <li class="circle" id="action-circle-1">Circle item 1</li>
            <li class="rect" id="action-rect-1">Rect item 1</li>
            <li class="rect" id="action-rect-2">Rect item 2</li>
            <li class="circle" id="circle-2">Circle item 2</li>
            <li class="rect circle svg" id="action-color-select">Color: 
                <ul>
                    <li class="color color-1"></li>
                    <li class="color color-2"></li>
                </ul>
            </li>
        </ul>

    </div>
</template>

<script>
import { API, Auth } from 'aws-amplify'
import wcs from '@/utils/pix2wcs'
import { mapGetters } from 'vuex'
import * as d3 from 'd3'
import { commands_mixin } from '../mixins/commands_mixin'

export default {
    name: 'ImageView',
    mixins: [commands_mixin],
    data() {
        return {
            latest_image_url: '',
            latest_image_name: '',

            // The image that is selected and visible in the main viewer.
            active_image: '',

            image_length: 768,
            image_element: '#image_svg',

            mouseX: 0,
            mouseY: 0,

            mouseRa: 0,
            mouseDec: 0,

            show_crosshairs: false,

            // Timer to clear the right click marker after a few seconds.
            context_marker_timer: '',
            // Time that right click events stay on the screen.
            right_click_ttl: 5000,




        }
    },
    beforeMount() {
        this.active_site = 'WMD'
        this.active_mount = 'mnt1'
        this.$store.dispatch('images/refresh_latest_images')
        this.getImageURL();
    },
    mounted() {

        // Track mouse coordinates 
        let that = this
        d3.select(this.image_element)
            .on('mouseover', function(d,i) {
                d3.select(this).on('mousemove', function(d,i) {
                let coords = d3.mouse(this)
                that.mouseX = coords[0]
                that.mouseY = coords[1]
            })
        })
        // Respond to right clicks
        d3.select(this.image_element).on("contextmenu", function(data, index) {
            let position = d3.mouse(this);
            console.log("right click!")
            that.draw_marker(position[0], position[1])
            that.$snackbar.open({
                    duration: that.right_click_ttl,
                    message: 'Center telescope here? <br>Note: <em>telescope will move and take another exposure.</em>.',
                    type: 'is-warning',
                    position: 'is-bottom-left',
                    actionText: 'Slew',
                    queue: false,
                    onAction: () => {
                        console.log('slew to '+position[0]+', '+position[1])
                        that.send_pixels_center_command(position)
                    }
                })
            d3.event.preventDefault();
        });
    },

    methods: {

        send_pixels_center_command(pixels) {
            let req_params = {
                x_from_left: pixels[0],
                y_from_top: pixels[1], 
            }
            let opt_params = {}
            let basecommand = this.base_command('mount', 'center_on_pixels', 'center_on_pixels', req_params, opt_params)
            let apiName = 'ptr-api'
            let url = basecommand.url
            let body = {
                "body": basecommand.form,
            }
            API.post(apiName, url, body).then(response => {
                console.log("sent pixel center command")
                console.log(response)
                console.log(basecommand.form)
            }).catch(error => {
                console.log("error with pixel centercommand")
                console.log(error)
            })
        },

        draw_marker(pixelX, pixelY) {

            // Make sure a previous timer doesn't wipe our current right-click marker
            clearTimeout(this.context_marker_timer)

            // Remove any other right click markers on the screen.
            this.remove_context_marker();

            // Draw a small cross where user clicks.
            d3.select(this.image_element).append("line")
                .attr('class', 'context-marker')
                .attr('x1', pixelX-7)
                .attr('y1', pixelY)
                .attr('x2', pixelX+7)
                .attr('y2', pixelY)
                .attr('stroke','red')
                .attr('stroke-width', 2)
                .style('fill', 'none')
            d3.select(this.image_element).append("line")
                .attr('class', 'context-marker')
                .attr('x1', pixelX)
                .attr('y1', pixelY-7)
                .attr('x2', pixelX)
                .attr('y2', pixelY+7)
                .attr('stroke','red')
                .attr('stroke-width', 2)
                .style('fill', 'none')

            // Set a timer to clear the marker in a few seconds.
            this.context_marker_timer = setTimeout(this.remove_context_marker, this.right_click_ttl);
            
        },
        remove_context_marker() {
            d3.select(this.image_element).selectAll('.context-marker').remove()
        },

        toggleCrosshairs() {
            console.log("toggle crosshairs")

            let elem = this.image_element

            if (this.show_crosshairs) {
                d3.select(elem).append('line')
                    .attr('x1', this.image_length/2)
                    .attr('y1', 0)
                    .attr('x2', this.image_length/2)
                    .attr('y2', this.image_length)
                    .attr('id', 'crosshair_vertical')
                    .attr('stroke', 'orange')
                d3.select(elem).append('line')
                    .attr('y1', this.image_length/2)
                    .attr('x1', 0)
                    .attr('y2', this.image_length/2)
                    .attr('x2', this.image_length)
                    .attr('id', 'crosshair_horizontal')
                    .attr('stroke', 'orange')
            } else {
                d3.select(elem).selectAll('line').remove()
            }
        },


        setActiveImage(image) {
            this.latest_image_url = image.url
            this.latest_image_name = image.filename
            this.active_image = image.filename
            this.initCanvas()
        },


        /**
         * Get the most recent image and set `latest_image` to a 
         * string url to the image.
         */
        getImageURL() {
            let apiName = 'ptr-api';
            let url = `/${this.active_site}/latest_image/`;
            this.$store.dispatch('images/refresh_latest_images')

            API.get(apiName, url).then(response => {
                this.latest_image_url= response[0].url
                this.latest_image_name= response[0].filename
                this.initCanvas()
            }).catch(error => {
                console.log(error.response)
            });
        },
    },
    computed: {

        active_site: {
            get() { return this.$store.getters['device_selection/site'] },
            set(value) { this.$store.commit('device_selection/setActiveSite', value) }
        },

        ...mapGetters('images', {
            recent_images: 'recent_images',
            current_image: 'current_image',
        }) 
    }
}
</script>

<style scoped>
.columns {
    border: 1px white solid;
}
.controls {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}
.controls > * {
    margin-bottom: 1em;
}
.button {
    margin-top: 5px;
    width: auto;
    
}

.recent_images {
    display: flex;
    flex-direction: column;
}
.recent_image {
    height: 60px;
    margin: 5px;
    cursor: pointer;
}

#image_svg {
    width: 768px;
    height: 768px;
}


</style>