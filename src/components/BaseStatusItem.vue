<template>
    <span class="level-item has-text-centered">
        <div class="status">
            <p class="heading"> {{ data.title }} </p>
            <p class="title"> {{ ( isNaN(parseFloat(value)) || value == "") ? '--' : value }} </p>
        </div>
    </span>
</template>

<script>

export default {
    name: "BaseStatusItem",
    props: {
        data: Object,
        value: String
    },
    mounted () {
    }
}
</script>

<style scoped>
.level-item {
    margin-right: 1em;
}
.status {
  background-color: #181818;
  padding: 1em 1.5em;
  min-width: 100px;
  cursor: grab;
}
.heading {
  color: #ff9900;
  font: 1em 'Share Tech Mono', monospace;
}
.title {
  color: #ff9900;
  font-family: 'Share Tech Mono', monospace;
}
hr {
    display: block;
    height: 1px;
    border: 0;
    border-top: 1px solid #888;
    margin: 0.5em 0;
    padding: 0;
}
</style>