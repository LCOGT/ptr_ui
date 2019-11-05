<template>
  <div class="Analysis" id="js9parent" ref="js9parent">

    <!-- This is where we load the js9 DOM elements -->
    <div id="js9component" ref="js9component"></div>

  </div>
</template>

<script>
import { API } from "aws-amplify";
import { mapGetters } from "vuex";

export default {
  name: "JS9",
  props: [
    'initialWidth',
    'initialHeight',
  ],
  data() {
    return {
      cur_img: "",
      isSelectable: true,

      // HTML header elements
      js9supportcss: '',
      js9css: '',
      js9prefs: '',
      js9: '',
      js9plugins: '',

      js9content: '',
    };
  },
  beforeMount() {

    // Set the initial display size
    let resize_opts = {
      id: 'myJS9',
      width: this.initialWidth,
      height: this.initialHeight,
    }
    this.$store.dispatch('js9/resizeDisplay', resize_opts)

  },
  mounted() {

    // Move the js9 DOM elements into our visible component
    this.js9content = document.getElementById('js9content')
    var js9away = document.getElementById('js9component')
    js9away.appendChild(this.js9content);

    this.$store.dispatch("images/refresh_latest_images")
  },

  beforeDestroy() {

    // Don't destroy the js9 DOM elements; move them to a hidden parent element
    // (a div with ID='js9content'), so we avoid js9 reloading-related problems.
    let js9home = document.getElementById('js9home')
    js9home.appendChild(this.js9content);

    //let remove_elements = [
      //this.js9supportcss,
      //this.js9css,
      //this.js9prefs,
      //this.js9support,
      //this.js9,
      //this.js9plugins,
    //].map(element => element.parentNode.removeChild(element))
  },

  watch: {

    thewidth() {
      console.log("resizing: "+this.thewidth)
      JS9.ResizeDisplay("myJS9", this.thewidth,this.thewidth, );
    }
  },

  methods: {

    loadScripts() {
      var baseurl = "https://js9.photonranch.org/js9"

      this.js9prefs= document.createElement("script");
      this.js9prefs.src = `${baseurl}/js9prefs.js`
      this.js9prefs.async = false
      document.head.appendChild(this.js9prefs);

      this.js9support = document.createElement("script");
      this.js9support.src = `${baseurl}/js9support.js`
      this.js9support.async = false
      document.head.appendChild(this.js9support);

      this.js9 = document.createElement("script");
      this.js9.src = `${baseurl}/js9.js`
      this.js9.async = false
      document.head.appendChild(this.js9);

      this.js9plugins = document.createElement("script");
      this.js9plugins.src = `${baseurl}/js9plugins.js`
      this.js9plugins.async = false
      document.head.appendChild(this.js9plugins);

      //setTimeout(this.init_js9(), 5000)
      console.log("loading js9 scripts")
    },
    
    loadJS9Styles() {
      var baseurl = "https://js9.photonranch.org/js9"

      this.js9supportcss= document.createElement("script");
      this.js9supportcss.href = `${baseurl}/js9.css`
      this.js9supportcss.rel = `stylesheet`
      this.js9supportcss.async = false
      document.head.appendChild(this.js9supportcss);

      this.js9css= document.createElement("script");
      this.js9css.href = `${baseurl}/js9support.css`
      this.js9css.rel = `stylesheet`
      this.js9css.async = false
      document.head.appendChild(this.js9css);
    },

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


    loadImage(base_filename) {
      let apiName = this.$store.getters['dev/api'];
      let path = `/fits13_url/${base_filename.slice(0,3)}/${base_filename}/`;
      console.log(path)

      let fitsURL = API.get(apiName, path, {}).then(response => {
        console.log(response)
        JS9.Load(response, {"display": "myJS9"}, "light")
      })
    }
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