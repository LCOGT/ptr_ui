<template>
    <div class="level-item has-text-centered">
        <div class="status">
            <p class="heading"> {{ data.title }} </p>
            <p class="title"> {{ (value == null) ? '--' : value }} </p>
        </div>
    </div>
</template>

<script>

export default {
    name: "StatusItem",
    props: {
        data: Object,
        value: String
    },
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