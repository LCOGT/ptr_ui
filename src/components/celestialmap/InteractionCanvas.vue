<template>
    <canvas ref="canvas" 
        :id="canvas_id" 
        :width="width+'px'" :height="height+'px'" 
        :class="{ 'mouse-in-sky': mouse_in_sky }"
        class="interaction-layer-canvas"
        />
</template>

<script>
export default {
    name: "InteractionCanvas",
    props: {
        canvas_id: {
            type: String,
            default: "interaction-canvas"
        },
        width: {
            type: Number,
            default: 200
        },
        height: {
            type: Number,
            default: 200
        },
        user_crosshairs: {
            type: Array,
            default: () => [-1, -1], // render offscreen
            validator: val => {
                let correct_size = val.length == 2;
                let all_elements_are_numbers = val.every(i => {
                    return typeof i === "number"
                })
                return correct_size && all_elements_are_numbers;
            },
        },
        telescope_crosshairs: {
            type: Array,
            default: () => [-1, -1], // render offscreen
            validator: val => {
                let correct_size = val.length == 2;
                let all_elements_are_numbers = val.every(i => {
                    return typeof i === "number"
                })
                return correct_size && all_elements_are_numbers;
            },
        },
        // This changes the cursor style if the mouse is in the sky 'circle'. 
        mouse_in_sky: {
            type: Boolean,
            default: false
        }
    },

    mounted() {
        this.canvas = this.$refs.canvas
        this.ctx = this.canvas.getContext('2d')
        let that = this

        // Send click / drag events to parent component
        this.canvas.addEventListener('mousedown', function(e) {
            mousemove(e)
            this.addEventListener("mousemove", mousemove)
            this.addEventListener("mouseup", mouseup)
            function mousemove(e) {
                that.$emit('i_mousedown', [e.offsetX, e.offsetY])
            }
            function mouseup() {
                this.removeEventListener("mousemove",mousemove);
                this.removeEventListener("mouseup",mouseup);
            }
        })

        // Send mouse position to parent. 
        this.canvas.addEventListener('mouseover', function(e) {
            this.addEventListener("mousemove", mousemove)
            this.addEventListener("mouseout", mouseout)
            function mousemove(e) {
                that.$emit('i_mouseover', [e.offsetX, e.offsetY])
            }
            function mouseout() {
                this.removeEventListener("mousemove",mousemove);
                this.removeEventListener("mouseout",mouseout);
            }
        })

        this.redraw_all()
    },

    watch: {
        user_crosshairs() { 
            this.redraw_all() 
        },

        telescope_crosshairs() { 
            this.redraw_all() 
        },

        // Since map is fixed proportionally, no need to check height change
        width() {
            // Wait until the canvas has resized (and reset) before drawing
            this.$nextTick(this.redraw_all)  
        },
    },

    computed: {
        // Convert relative coordinates to raw pixel coordinates
        user_xy_pixels() {
            return [
                this.user_crosshairs[0] * this.width,
                this.user_crosshairs[1] * this.height,
            ]
        },

        // Convert relative coordinates to raw pixel coordinates
        telescope_xy_pixels() {
            return [
                this.telescope_crosshairs[0] * this.width,
                this.telescope_crosshairs[1] * this.height,
            ]
        },
    },

    methods: {
        redraw_all() {
            this.clear_canvas()
            this.draw_user_crosshairs()
            this.draw_telescope_crosshairs()
        },

        draw_user_crosshairs() {
            if (this.user_crosshairs.every( i => i == -1 )) { return }
            const [x, y] = this.user_xy_pixels
            const r = 18;
            const r2 = 4;
            this.ctx.strokeStyle = '#df2437'
            this.ctx.lineWidth = 1.5 
            this.ctx.beginPath();
            this.ctx.moveTo(x, y - r);
            this.ctx.lineTo(x, y - r2);
            this.ctx.moveTo(x, y + r);
            this.ctx.lineTo(x, y + r2);
            this.ctx.moveTo(x - r, y);
            this.ctx.lineTo(x - r2, y);
            this.ctx.moveTo(x + r, y);
            this.ctx.lineTo(x + r2, y);
            this.ctx.closePath();
            this.ctx.stroke();
        },

        draw_telescope_crosshairs() {
            if (this.telescope_crosshairs.every( i => i == -1 )) { return }
            const [x, y] = this.telescope_xy_pixels
            const size = 220
            const s = Math.sqrt(size)
            const r = s/2
            this.ctx.strokeStyle = 'greenyellow' 
            this.ctx.lineWidth = 1.5
            this.ctx.beginPath();
            this.ctx.moveTo(x, y-s);
            this.ctx.lineTo(x, y+s);
            this.ctx.moveTo(x-s, y);
            this.ctx.lineTo(x+s, y);
            this.ctx.closePath();
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.arc(x, y, r, 0, 2 * Math.PI);    
            this.ctx.closePath();
            this.ctx.stroke();
        },

        clear_canvas() {
            this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height)
        }
    }
}
</script>

<style lang="scss" scoped>

/* Lots of !important tags to override default d3-celestial styles */
.interaction-layer-canvas {
    position: absolute !important;
    top: 0;
    left: 0;
    z-index: 1 !important;
    cursor: unset !important;
}

.mouse-in-sky:hover {
    cursor: crosshair !important
}
</style>
