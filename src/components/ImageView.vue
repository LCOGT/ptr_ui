<template>
    <div class="columns">
        <div class="column">
            <canvas id="img-canvas" width="716" height="716"> </canvas>
            <p>ra: {{mouseCoords[0]}}, dec: {{mouseCoords[1]}}</p>
        </div>
        <div class="column controls">
            <div class="field">
                <b-switch type="is-info" v-model="isSelectable" >
                    {{ isSelectable ? "Selectable" : "Not Selectable" }}
                </b-switch>
            </div>
            <br>
            <button class="button" @click="getAngle">get angle</button>
            <button class="button" @click="getDimensions">get dimensions</button>
            <br>
            <button class="button" @click="zoomToFillWindow">zoom to fill window</button>
            <br>
            <button class="button" @click="resetCanvas">reset canvas</button>
            <button class="button" @click="resetImage">reset image</button>
            <button class="button" @click="resetAll">reset</button>
        </div>
    </div>
</template>

<script>
import { API, Auth } from 'aws-amplify'
import { fabric } from 'fabric'
import wcs from '@/utils/pix2wcs'


export default {
    name: 'ImageView',
    data() {
        return {
            cur_img: '',
            isSelectable: false,
            canvas: {
                canvas: '',
                image: '',
                crosshairX: '',
                crosshairY: '',
            },
            mouseCoords: [],
            mouseRa: 0,
            mouseDec: 0,
        }
    },
    beforeMount() {
        API.post('LambdaNoAuth', '/getimage').then(response => {
            this.cur_img = response.image_url
            console.log(this.cur_img)
            this.initCanvas()
        }).catch(error => {
            console.log(error.response)
            console.log('error with getting image url')
        });
    },
    methods: {
        initCanvas() {
            var canvas_config = {
                backgroundColor: '#555'
            }


            this.canvas.canvas = new fabric.Canvas('img-canvas', canvas_config)
            
            this.initImage(this.cur_img)

            let that = this
            this.canvas.canvas.on('mouse:move', function(e) {
                that.getMousePos(e)
            })


            // Element to detect right clicks. Not part of native fabric.js functionality.
            var upper_canvas_class = document.getElementsByClassName('upper-canvas')
            var upper_canvas = upper_canvas_class[0]

            var startPan = function(event) {
                console.log(event)

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
            this.initImage(this.cur_img)
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
       isSelectable: function (val) {
           this.setSelectable()
       }, 
    },
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
</style>