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
    </div>
</template>

<script>
import { API, Auth } from 'aws-amplify'
import wcs from '@/utils/pix2wcs'
import { mapGetters } from 'vuex'
import * as d3 from 'd3'

export default {
    name: 'ImageView',
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




        }
    },
    beforeMount() {
        this.active_site = 'WMD'
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
    },

    methods: {

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
                    .attr('stroke', 'lightblue')
                d3.select(elem).append('line')
                    .attr('y1', this.image_length/2)
                    .attr('x1', 0)
                    .attr('y2', this.image_length/2)
                    .attr('x2', this.image_length)
                    .attr('id', 'crosshair_horizontal')
                    .attr('stroke', 'lightblue')
            } else {
                d3.select(elem).selectAll('line').remove()
            }
        },

        context_menu() {

            let elem = this.image_element

            d3.select(elem).append('div')
                .style('position', 'absolute')
                .style('top', this.mouseY)
                .style('left', this.mouseX)
                .style('border', '2px solid green')
                .style('width', '50px')
                .style('height', '50px')

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