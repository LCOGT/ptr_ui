<template>
    <div class="columns">
        <div class="column">
            <canvas id="img-canvas" width="716" height="716"> </canvas>
        </div>
        <div class="column controls">
            <div class="field">
                <b-switch type="is-info" v-model="isSelectable" >
                    {{ isSelectable ? "Selectable" : "Not Selectable" }}
                </b-switch>
            </div>
            <button class="button" @click="getDimensions">dimensions</button>
            <br>
            <button class="button" @click="resetImage">reset</button>
        </div>
    </div>
</template>

<script>
import { API, Auth } from 'aws-amplify'
import { fabric } from 'fabric'

export default {
    name: 'ImageView',
    data() {
        return {
            cur_img: '',
            isSelectable: true,
            canvas: {
                canvas: '',
                image: '',
                crosshairX: '',
                crosshairY: '',
            },
        }
    },
    beforeMount() {
        API.post('LambdaTest', '/getimage').then(response => {
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
        },
        initImage(image_url) {
            let that = this
            fabric.Image.fromURL(image_url, function(oImg) {
                that.canvas.image = oImg
                that.canvas.image.set('selectable', that.isSelectable)
                that.canvas.canvas.add(that.canvas.image)
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
        },
        resetImage() {
            this.canvas.canvas.remove(this.canvas.image)
            this.initImage(this.cur_img)
            this.$toast.open({
                message: 'image has been reset',
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
}
.button {
    margin-top: 5px;
}
</style>