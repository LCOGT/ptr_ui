<template>

            <div class="status-grid" >
                <div 
                    v-for="(item,key) in statusList"
                    v-bind:key="`k-${key}`"
                    class="key"
                    :class="{'spacer': item.val=='spacer'}"
                    >{{item.name}}</div>
                <div 
                    v-for="(item,key) in statusList"
                    v-bind:key="`v-${key}`"
                    class="val"
                    :class="{'spacer': item.val=='spacer'}"
                    :style="customStyle(item)"
                    >{{item.val}}</div>
            </div>
</template>

<script>
export default {
    props: {
        'statusList': Array,
    },
    methods: {
        /**
         * Dynamically set color if the status element defines one. 
         */
        customStyle(item) {
            if ("color" in item) {
                return `color: ${item.color};`
            }
        },
    }
}
</script>

<style scoped>
.status-grid {
    font-size: 14px;
    display:grid;
    grid-auto-flow:column;
    grid-template-columns: max-content max-content;
    padding: 1em;
    grid-row-gap: 3px;
    width: 100%;
    overflow: hidden;
}
.key {
  color:silver;
  padding: 0 8px;
  white-space: nowrap;
  text-align: right;
  grid-column-start: 1;
}
.val{
  color: greenyellow;
  background-color: black;
  padding: 0 8px;
  white-space: nowrap;
  grid-column-start:2;
}

.spacer {
    display: inline-block;
    height: 1em; 
    visibility: hidden;
}
</style>