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
            :style="customStyle(item)"
            :class="{'spacer': item.val=='spacer', 'is-stale': item.is_stale}"
            >
                <ra-display v-if="item.name == 'Ra'" :ra_hours_decimal="parseFloat(item.val)" :can_copy="false"/>
                <dec-display v-else-if="item.name == 'Dec'" :dec_deg_decimal="parseFloat(item.val)" :can_copy="false"/>
                <span v-else> {{item.val}} </span>
            </div>
    </div>
</template>

<script>
import RaDisplay from "@/components/display/RaDisplay"
import DecDisplay from "@/components/display/DecDisplay"
import StatusValue from "@/components/status/StatusValue"
export default {
    components: {
        RaDisplay,
        DecDisplay,
        StatusValue,
    },
    props: {
        'statusList': {
            type: Array,
            default: () => [],
        },
        'isOffline': {
            type: Boolean,
            default: false,
        }
    },
    methods: {
        /**
         * Dynamically set color if the status element defines one. 
         */
        customStyle(item) {

            let style = ""

            // Check if the item is stale
            if (item.is_stale) {
                style += `color: grey;`
            }

            // Next check if the status has a color defined
            else if ("color" in item) {
                style += `color: ${item.color};`
            }

            // Check for general style overrides
            if ("custom_styles" in item) {
                style += item.custom_styles
            }

            return style
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
  background-color: $status-value-background-color;
  border: 1px solid lighten($grey-dark, 3);
  padding: 0 8px;
  white-space: nowrap;
  grid-column-start:2;
  width: 10ch;
}

.spacer {
    display: inline-block;
    height: 1em; 
    visibility: hidden;
}

.is-stale {
    background-color: rgba(0,0,0,0);
}
.is-stale > *{
    //color:grey;
    //color: pink;
}
</style>
