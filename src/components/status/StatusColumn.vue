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
            :class="{'spacer': item.val=='spacer'}"
            >
                <StatusVal :status-item="item" />
            </div>

    </div>
</template>

<script>
import StatusVal from "@/components/status/StatusVal"
export default {
    components: {
        StatusVal,
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
}
</script>

<style lang="scss" scoped>
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
.spacer {
    display: inline-block;
    height: 1em; 
    visibility: hidden;
}
.is-stale {
    background-color: rgba(0,0,0,0);
}
</style>
