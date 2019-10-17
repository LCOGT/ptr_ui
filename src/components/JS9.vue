<template>

<div class="Analysis">
  <p>js9</p>
    <button class="button" @click="loadImage(current_image.base_filename)">load</button>
    <div class="JS9Menubar" data-width="768px"></div>
    <div class="JS9Toolbar" data-width="768px"></div>
    <div class="JS9" data-width="768px" data-height="768px"></div>
</div>
        
</template>

<script>
import { API } from "aws-amplify";
import $ from 'jquery'
import { fabric } from "fabric";
import { mapGetters } from "vuex";

export default {
  name: "JS9",
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
    };
  },
  beforeMount() {
    //let js9SupportCSS = document.createElement("script");
    //js9SupportCSS.setAttribute(
      //"src",
      //"https://cdn.lco.global/js9/js9support.css"
    //);
    //document.head.appendChild(js9SupportCSS);

    //let js9CSS = document.createElement("script");
    //js9CSS.setAttribute("src", "https://cdn.lco.global/js9/js9.css");
    //document.head.appendChild(js9CSS);

    //let js9PrefsJS = document.createElement("script");
    //js9PrefsJS.setAttribute("src", "https://cdn.lco.global/js9/js9prefs.js");
    //document.head.appendChild(js9PrefsJS);

    //let js9SupportMinJS = document.createElement("script");
    //js9SupportMinJS.setAttribute(
      //"src",
      //"https://cdn.lco.global/js9/js9support.min.js"
    //);
    //document.head.appendChild(js9SupportMinJS);

    //let js9MinJS = document.createElement("script");
    //js9MinJS.setAttribute("src", "https://cdn.lco.global/js9/js9.min.js");
    //document.head.appendChild(js9MinJS);

    //let js9PluginsJS = document.createElement("script");
    //js9PluginsJS.setAttribute(
      //"src",
      //"https://cdn.lco.global/js9/js9plugins.js"
    //);
    //document.head.appendChild(js9PluginsJS);

    //this.loadScript('https://ptr-js9.s3.amazonaws.com/js9prefs.js')
    
  },
  mounted() {
    //var baseurl = "http://ec2-52-201-236-65.compute-1.amazonaws.com/js9"
    //var baseurl = "http://ec2-34-201-76-221.compute-1.amazonaws.com/js9"
    var baseurl = "https://js9.photonranch.org/js9"

    this.js9supportcss = document.createElement("link");
    this.js9supportcss.rel = "stylesheet"
    this.js9supportcss.class= "js9css"
    this.js9supportcss.type = "text/css"
    this.js9supportcss.href = `${baseurl}/js9support.css`
    this.js9supportcss.async = false
    document.head.appendChild(this.js9supportcss);

    this.js9css = document.createElement("link");
    this.js9css.rel = "stylesheet"
    this.js9css.class= "js9css"
    this.js9css.type = "text/css"
    this.js9css.href = `${baseurl}/js9.css`
    this.js9css.async = false
    document.head.appendChild(this.js9css);

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

  },

  beforeDestroy() {
    //function removeHeadItem(element) {
      //element.parentNode.removeChild(element)
    //}
    let remove_elements = [
      //this.js9supportcss,
      //this.js9css,
      this.js9prefs,
      this.js9support,
      this.js9,
      this.js9plugins,
    ].map(element => element.parentNode.removeChild(element))
  },

  methods: {

    loadImage(base_filename) {
      let apiName = this.$store.getters['dev/api'];
      let path = `/fits13_url/${base_filename.slice(0,3)}/${base_filename}/`;
      console.log(path)

      let fitsURL = API.get(apiName, path, {}).then(response => {
        console.log(response)
        JS9.Load(response)
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
/*
@import url("http://ec2-52-201-236-65.compute-1.amazonaws.com/js9/js9.css");
@import url("http://ec2-52-201-236-65.compute-1.amazonaws.com/js9/js9support.css");
*/

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