<template>
    <div class="columns">
        <div class="column">
            <canvas id="img-canvas" width="716" height="716"> </canvas>
            <div style="display: flex; justify-content: space-between;">
                <!--p>ra: {{mouseCoords[0]}}, dec: {{mouseCoords[1]}}</p-->
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
            <div class="field">
                <b-switch type="is-info" v-model="isSelectable" >
                    {{ isSelectable ? "Selectable" : "Not Selectable" }}
                </b-switch>
            </div>
            <button class="button" @click="getImageURL">refresh image</button>
            <!--br-->
            <!--button class="button" @click="getAngle">get angle</button-->
            <!--button class="button" @click="getDimensions">get dimensions</button-->
            <!--br-->
            <!--button class="button" @click="zoomToFillWindow">zoom to fill window</button-->
            <!--br-->
            <!--button class="button" @click="resetCanvas">reset canvas</button-->
            <!--button class="button" @click="resetImage">reset image</button-->
            <!--button class="button" @click="resetAll">reset</button-->
        </div>
    </div>
</template>

<script>
import { API, Auth } from 'aws-amplify'
import { fabric } from 'fabric'
import wcs from '@/utils/pix2wcs'
import { mapGetters } from 'vuex'


export default {
    name: 'ImageView',
    data() {
        return {
            latest_image_url: '',
            latest_image_name: '',

            // The image that is selected and visible in the main viewer.
            active_image: '',

            isSelectable: false,
            canvas: {
                canvas: '',
                image: '',
                crosshairX: '',
                crosshairY: '',
            },
            mouseCoords: [],
            mouseX: 0,
            mouseY: 0,
            mouseRa: 0,
            mouseDec: 0,
        }
    },
    beforeMount() {
        this.active_site = 'WMD'
        this.$store.dispatch('images/refresh_latest_images')
        this.getImageURL();
        /*
        API.post('LambdaNoAuth', '/getimage').then(response => {
            this.latest_image_url= response.image_url
            console.log(this.latest_image_url)
            this.initCanvas()
        }).catch(error => {
            console.log(error.response)
            console.log('error with getting image url')
        });
        */
    },
    methods: {

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
        initCanvas() {
            var canvas_config = {
                backgroundColor: '#555'
            }


            this.canvas.canvas = new fabric.Canvas('img-canvas', canvas_config)
            
            this.initImage(this.latest_image_url)

            let that = this
            this.canvas.canvas.on('mouse:move', function(e) {
                that.getMousePos(e)
            })


            // Element to detect right clicks. Not part of native fabric.js functionality.
            var upper_canvas_class = document.getElementsByClassName('upper-canvas')
            var upper_canvas = upper_canvas_class[0]

            var startPan = function(event) {

                // No right-click menu
                event.preventDefault();

                // Right click only
                if (event.button != 2) {
                    return
                }

                // Get mouse coordinates
                var x0 = event.screenX
                var y0 = event.screenY

                function continuePan(event) {
                    var x = event.screenX
                    var y = event.screenY
                    that.canvas.canvas.relativePan({ x: x-x0, y: y-y0 })
                    x0 = x
                    y0 = y
                }

                function stopPan(event) {
                    window.removeEventListener('mousemove', continuePan)
                    window.removeEventListener('mouseup', stopPan)
                }

                window.addEventListener('mousemove', continuePan)
                window.addEventListener('mouseup', stopPan)

            }

            upper_canvas.addEventListener('contextmenu', startPan)
        },
        initImage(image_url) {
            let that = this
            fabric.Image.fromURL(image_url, function(img) {
                that.canvas.image = img
                that.canvas.image.set('selectable', that.isSelectable)
                that.canvas.canvas.add(that.canvas.image)
                console.log('natural width: '+img.width)
            })
        },
        getMousePos(event) {
            let mouse = this.canvas.canvas.getPointer(event)
            this.mouseX = mouse.x
            this.mouseY = mouse.y
            let res = wcs.pix2wcs(mouse.x, mouse.y)
            this.mouseCoords = res.map(function(each_element) {
                return Number(each_element).toFixed(3)
            })
        },
        setSelectable() {
            this.canvas.image.set({
                selectable: this.isSelectable,
                hoverCursor: 'default',
            })
            this.canvas.canvas
                .discardActiveObject()
                .renderAll()
        },
        getDimensions() {
            let width = this.canvas.image.getScaledWidth()
            let height = this.canvas.image.getScaledHeight()
            this.$toast.open({
                message: 'w: '+width+', h: '+height,
                queue: false,
            })
            console.log('natural width: '+this.canvas.image.width)
        },
        getAngle() {
            let angle = this.canvas.image.get('angle')
            this.$toast.open({
                message: 'Angle: '+parseFloat(angle).toFixed(1)+' degrees',
                queue: false,
            })
        },
        scaleImage100() {
            this.canvas.image.scale(1)
            this.canvas.canvas.renderAll()
        },
        setZoom() {
            let img_width = this.canvas.image.width
            let canvas_width = this.canvas.canvas.width
            this.canvas.canvas.setZoom(canvas_width/img_width)
        },
        zoomToFillWindow() {
            this.resetAll()
            let naturalWidth = this.canvas.image.width
            let naturalHeight = this.canvas.image.height
            this.canvas.image.set({
                angle: 0,
                top: 0,
                left: 0,
            })
            this.canvas.image.scale(1)
            this.canvas.canvas.setZoom(this.canvas.canvas.width / this.canvas.image.width)
            this.canvas.canvas.renderAll()
        },
        resetCanvas() {
            this.canvas.canvas.setZoom(1)
            this.canvas.canvas.relativePan({ x: 0, y: 0 })
        },
        resetImage() {
            this.canvas.canvas.remove(this.canvas.image)
            this.initImage(this.latest_image_url)
        },
        resetAll() {
            this.resetImage()
            this.resetCanvas()
            this.$toast.open({
                message: 'reset all',
                queue: false,
            })
        },
    },
    watch: {
        /*
       isSelectable: function (val) {
           this.setSelectable()
       }, 
       */
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
</style>