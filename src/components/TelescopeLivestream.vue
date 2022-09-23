<template>
  <div>
    <div class="livestream">
      telescope livestream
    </div>
    <div class="soon">
      coming soon
    </div>
    <div class="tuned">
      stay tuned!
    </div>
  </div>
</template>

<script>
/* Note: this is a placeholder component until we get telescope video feeds working */
export default {
  name: 'TelescopeLivestream'
}
</script>

<style lang="scss" scoped>
* {
    text-align: center;
    color:gold;
}
.livestream {
    font-weight: bold;
}
.soon {
    font-style:italic;
}
.tuned {
}
</style>
