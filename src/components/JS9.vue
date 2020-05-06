<template>
  <div id="js9parent" ref="js9parent">

    <!-- This is where we load the js9 DOM elements -->
    <div id="js9component" ref="js9component"></div>

  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex";

export default {
  name: "JS9",
  props: [
    "initialWidth",
    "initialHeight",
    "includeMenu",
  ],
  data() {
    return {
      JS9: JS9, // grab the global variable for use in our component
      cur_img: "",
      isSelectable: true,

      js9content: '',
      js9menu: '',
    };
  },
  beforeMount() {

    console.log(this.JS9)
    // Set the initial display size
    let resize_opts = {
      id: 'myJS9',
      width: this.initialWidth,
      height: this.initialHeight,
    }
    //this.$store.dispatch('js9/resizeDisplay', resize_opts)

  },
  mounted() {

    // Mark js9 as visible
    this.$store.commit('js9/instanceIsVisible', true)

    // Move the js9 DOM elements into our visible component
    this.js9content = document.getElementById('js9content')
    var js9away = document.getElementById('js9component')
    js9away.appendChild(this.js9content);

    // Determine whether or not the menu is included
    this.js9menu = document.getElementById('myJS9Menubar')
    this.js9menu.style.display= this.includeMenu ? "block" : "none";

    this.$store.dispatch("images/refresh_latest_images")
  },

  beforeDestroy() {

    // Mark js9 as no longer visible
    this.$store.commit('js9/instanceIsVisible',false)

    // Don't destroy the js9 DOM elements; move them to a hidden parent element
    // (a div with ID='js9content'), so we avoid js9 reloading-related problems.
    let js9home = document.getElementById('js9home')
    js9home.appendChild(this.js9content);

  },


  watch: {

    current_image: function(newVal, oldVal) {
      let loadOptions = {
        base_filename: newVal.base_filename,
        site: newVal.site,
        zoom: 'toFit',
        //flip: 'y'
      }
      this.$store.dispatch('js9/loadImage', loadOptions)
    },

  },

  methods: {
    
    init_js9() {
      JS9.init()
    },
    
    new_js9() {
      function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
      }
      //var js9ID = "js9-"+getRandomInt(99).toString()
      //console.log("js9ID: "+js9ID)
      //var anewjs9 = document.createElement("div");
      //anewjs9.class ="JS9"
      //anewjs9.id=js9ID
      //this.$refs.js9parent.appendChild(this.anewjs9);
      JS9.AddDivs('myJS9')
    },

    addDiv() {
      JS9.AddDivs("myJS9");
    },

  },
  computed: {

    ...mapGetters("images", [
      "recent_images",
      "current_image"
    ]),

  }

};
</script>

<style scoped>
@import url("https://js9.photonranch.org/js9/js9.css");
@import url("https://js9.photonranch.org/js9/js9support.css");

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