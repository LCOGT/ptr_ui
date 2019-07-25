<template><div>

    <the-dome-cam />
    <br>

    <div class="quick-status">
        quick telescope status/info 
    </div>
    <br>

    <div style="height: 2em;" />


    <!-- TODO: make the 1-2-3 step view a tile with the layout:

        1111  3333
        1111  3333
              3333    
        2222  3333
        2222  3333        

        -->



    <div class="columns quick-image">
        <div class="column quick-image-column">  
            <p class="title is-4">1. Choose a target</p>
            <br>
            <b-field label="Search for a target">
                    <b-input placeholder="target name or position"></b-input>
            </b-field>
            <p class="control">
                <button class="button is-primary">Search</button>
            </p>
        </div>

        <!-- TODO: make these line dividers work responsively with columns -->
        <div class="line-divider"></div>

        <div class="column quick-image-column">  
            <p class="title is-4">2. Expose an image</p>
            <br>
            <b-field label="Expose">
                <b-field>
                    <b-input name="subject" value="5.0"></b-input>
                    <p class="control"> <span class="button is-static">seconds</span> </p>
                </b-field>
            </b-field>
            <b-field label="Filter">
                <b-select placeholder="Select filter">
                    <option value="Color (RGB)">color</option>
                    <option value="Luminance">luminance</option>
                    <option value="Red">red</option>
                    <option value="Green">green</option>
                    <option value="Blue">blue</option>
                </b-select>
            </b-field>

        </div>

        <div class="line-divider"></div>

        <div class="column quick-image-column">  
            <p class="title is-4">3. See the results!</p>
            <br>
            <div style="width:100%;height:0; padding-top:100%;position:relative; background:grey;">
                <!--img  src="<imgUrl>" style="position:absolute; top:0; left:0; width:100%;"-->
                <img
                    v-bind:src="current_image.url" 
                    @click="isImageModalActive = true" 
                    class="preview-image" />
            </div>

            <b-modal :active.sync="isImageModalActive" :width="800">
                <p class="image">
                    <!--img v-bind:src="current_image.url"-->
                    <image-view />
                </p>
            </b-modal>
            <div>Filename:</div>
            <div>{{current_image.filename}}</div>

        </div>
    </div>
    <br>

    <br>
    <!--the-device-selectors /-->

</div></template>


<script>
import TheDeviceSelectors from '@/components/TheDeviceSelectors'
import TheDomeCam from '@/components/TheDomeCam'
import { mapGetters } from 'vuex'
import { commands_mixin } from '../mixins/commands_mixin'
import ImageView from '@/components/ImageView'
export default {
    name: "SubpageHome",
    props: ["sitecode"],
    mixins: [commands_mixin],
    components: {
        TheDeviceSelectors,
        TheDomeCam,
        ImageView,
    },
    data () {
        return {
            isImageModalActive: false,
        }
    },
    computed: {
        ...mapGetters('images', [
        'current_image',
        ]),
    }
    
    
}

</script>


<style scoped>

.quick-status {
    background-color: #232929;
    width: 100%;
    height: 5em;
    text-align: center;
    vertical-align: middle;
    padding-top: 1em;
}

.line-divider {
    width: 1px;
    background: rgb(255,255,255,.0); 
    padding-top: 2em;
}

.preview-image {
    width: 100%; 
    background-color: grey; 
    cursor: pointer; 
    position: absolute; 
    top:0; 
    left:0;
}

.quick-image-column {
    margin: 2em;
}


</style>