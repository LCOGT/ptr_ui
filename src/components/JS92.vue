<template><div>
  <!--meta name="viewport" content="width=device-width, initial-scale=1">
  <link type="image/x-icon" rel="shortcut icon" href="./favicon.ico">
  <script type="text/javascript" src="js9prefs.js"></script>
  <script type="text/javascript" src="js9support.min.js"></script>
  <script type="text/javascript" src="js9.min.js"></script>
  <script type="text/javascript" src="js9plugins.js"></script-->

<div class="Analysis">
    <p>Hello from js9!</p>
    <div class="JS9Menubar" data-width="768px"></div>
    <div class="JS9Toolbar" data-width="768px"></div>
    <div class="JS9" data-width="768px" data-height="768px"></div>
</div>
        
</div>
</template>

<script>
//import js9prefs from '@/../js9webdir/js9prefs.js'
//import js9support from '@/../js9webdir/js9support.min.js'
//import js9 from '@/../js9webdir/js9.min.js'
//import js9plugins from '@/../js9webdir/js9plugins.js'
//let js9 = require('js9');

export default {
  name: "JS92",
  data() {
    return {
    };
  },
  created() {

    //this.$loadScript("js9webdir/")
    //.then(() => {
      //console.log('loaded js9webdir')
    //})
    //.catch(() => {
      //console.log('failed to load js9webdir')
    //})

    this.$loadScript("/js9webdir/js9prefs.js")
    .then(() => {
      console.log('successfully loaded script')
      this.$loadScript("/js9webdir/js9support.js")
      .then(() => {
        console.log('successfully loaded script')
        this.$loadScript("/js9webdir/js9.js")
        .then(() => {
          console.log('successfully loaded script')
          this.$loadScript("/js9webdir/js9plugins.js")
          .then(() => {
            console.log('successfully loaded script')
          })
          .catch(() => {
            console.log('failed to load script')
          });

        })
        .catch(() => {
          console.log('failed to load script')
        });

      })
      .catch(() => {
        console.log('failed to load script')
      });
    })
    .catch(() => {
      console.log('failed to load script')
    });

    


  },
  methods: {}
};
</script>

<style scoped>
  @import '/js9webdir/js9support.css';
  @import '/js9webdir/js9.css';
/*
  @import 'https://cdn.lco.global/js9/js9support.css';
  @import 'https://cdn.lco.global/js9/js9.css';
  */
</style>