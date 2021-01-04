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
        'isOffline': Boolean,
    },
    methods: {
        /**
         * Dynamically set color if the status element defines one. 
         */
        customStyle(item) {

            // Priority: if site is offline, all status is grey
            if (this.isOffline) {
                return `color: grey;`
            }

            // Next check if the status has a color defined
            if ("color" in item) {
                return `color: ${item.color};`
            }
        },
    }
}
</script>

<style lang="scss" scoped>
@import "~bulma/sass/utilities/_all";
@import "@/style/buefy-styles.scss";

$status-value-background-color: $input-background-color;
.status-grid {
    font-size: 14px;
    display:grid;
    grid-auto-flow:column;
    grid-template-columns: max-content max-content;
    grid-row-gap: 3px;
    width: 100%;
}
.key {
  color:rgb(131, 131, 131);
  padding: 0 8px;
  padding-top: 2px;
  white-space: nowrap;
  text-align: right;
  grid-column-start: 1;
  text-transform: uppercase;
  font-size: 12px;
  vertical-align: middle;
}
.val{
  color: lightgray;
  //background-color: $status-value-background-color;
  border: 1px solid lighten($grey-dark, 3);
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