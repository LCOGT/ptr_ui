<template>
   <div class="target-card" @click="$emit('selected-target', target)" :class="(is_clicked)?'selected':''">
      <div class="target-img">
        <img :src="`${target.image}`"/>
      </div>
      <h2 class="target-name"><span class= "card-text">{{ target.name }}</span></h2>
      <h4 class="target-nickname"><span class= "card-text">{{ target.nickname }}</span></h4>
      <h3 class="target-type"><span class= "card-text">{{ target.type }}</span></h3>
     </div>
 </template>
 <script>

 export default {
   props: {
     target: Object,
     is_clicked: {
       type: Boolean,
       default: false,
     }
   }
 };
 </script>
 <style lang="scss" scoped>
   .target-card {
     position: relative;
     height: 250px;
     width: 250px;
     margin: 10px;
   }
   .target-name {
     font-size: x-large;
     position: absolute;
     top:15px;
     left:5%;
   }
   .target-nickname {
     font-size: medium;
     position: absolute;
     top:18%;
     left:5%;
   }
   .target-type {
     font-size: x-large;
     position: absolute;
     top:80%;
     left:5%;
   }
   .card-text {
     background-color: black;
     color: white;
   }
   .selected {
     border: 3px solid white;
   }
 </style>
 