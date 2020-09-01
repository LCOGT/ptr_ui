<template>

            <div class="status-row" >
                <div 
                    v-for="(item,key) in statusList"
                    v-bind:key="`k-${key}`"
                    :class="{'spacer': item.val=='spacer'}"
                    >
                    <div class="key">{{item.name}}</div>
                    <div class="val" :style="customStyle(item)">{{item.val}}</div>
                </div>
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
.status-row{
    font-size: 14px;
    display:flex;
    padding: 1em;
    width: 100%;
    overflow: hidden;
    overflow-x: auto;
}
.key {
  color:silver;
  background-color: #383f3f;
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
    width: 1em;
    visibility: hidden;
}
</style>