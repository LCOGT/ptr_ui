<template>
  <div class="target-card">
    <div class="tcard">
      <img :src="`${target.image}`"/>
      <div class="target-name">
        <h2>{{ target.name }}</h2>
      </div>
        <h3 class="target-type">{{ target.type }}</h3>
    </div>
  </div>
</template>
<script>

export default {
  props: [
    'target',
  ],
  computed: {
    targetImage() {
      return {
        '--target-image': this.target.image,
      };
    },
  },
};
</script>
<style lang="scss">
  .tcard {
    position: relative;
    height: 250px;
    width: 250px;
    margin: 10px;
  }
  img {
    position: relative;
    object-fit: fill;
  }
  .target-name {
    font-size: x-large;
    color: white;
    position: absolute;
    top:5%;
    left:5%;

  }
  .target-type {
    font-size: x-large;
    color: white;
    position: absolute;
    top:80%;
    left:5%;
  }
</style>
