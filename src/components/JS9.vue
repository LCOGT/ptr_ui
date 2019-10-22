<template>

<div class="Analysis">
    <div class="JS9Menubar" data-width="768px"></div>
    <div class="JS9Toolbar" data-width="768px"></div>
    <div class="JS9" data-width="768px" data-height="768px"></div>
</div>
        
</template>

<script>
import { fabric } from "fabric";
import { API } from "aws-amplify";

export default {
  name: "JS9",
  data() {
    return {
      cur_img: "",
      isSelectable: true
    };
  },
  beforeMount() {
    let js9SupportCSS = document.createElement("script");
    js9SupportCSS.setAttribute(
      "src",
      "https://cdn.lco.global/js9/js9support.css"
    );
    document.head.appendChild(js9SupportCSS);

    let js9CSS = document.createElement("script");
    js9CSS.setAttribute("src", "https://cdn.lco.global/js9/js9.css");
    document.head.appendChild(js9CSS);

    let js9PrefsJS = document.createElement("script");
    js9PrefsJS.setAttribute("src", "https://cdn.lco.global/js9/js9prefs.js");
    document.head.appendChild(js9PrefsJS);

    let js9SupportMinJS = document.createElement("script");
    js9SupportMinJS.setAttribute(
      "src",
      "https://cdn.lco.global/js9/js9support.min.js"
    );
    document.head.appendChild(js9SupportMinJS);

    let js9MinJS = document.createElement("script");
    js9MinJS.setAttribute("src", "https://cdn.lco.global/js9/js9.min.js");
    document.head.appendChild(js9MinJS);

    let js9PluginsJS = document.createElement("script");
    js9PluginsJS.setAttribute(
      "src",
      "https://cdn.lco.global/js9/js9plugins.js"
    );
    document.head.appendChild(js9PluginsJS);
  },

  methods: {}
};
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