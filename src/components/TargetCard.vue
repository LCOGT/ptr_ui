<template>
  <div class="target-card">
    <div class="card">
      <img :src="`${target.image}`"/>
        <h2 class="target-name">{{ target.name }}</h2>
        <h4 class="target-nickname">{{ target.nickname }}</h4>
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
<style lang="scss" scoped>
  .card {
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
    top:15px;
    left:5%;
  }
  .target-nickname {
    font-size: medium;
    color: white;
    position: absolute;
    top:18%;
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
