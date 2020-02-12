
<template>
    <div class="wrapper">
        <b-collapse class="card" :open="true">
            <div
            slot="trigger" 
            slot-scope="props"
            class="card-header"
            role="button" >
                <p class="card-header-title"> Site Info </p>
                <a class="card-header-icon">
                    <b-icon :icon="props.open ? 'menu-down' : 'menu-up'"/>
                </a>
            </div>

            <div class="menu-label">users online:</div>


        </b-collapse>
    </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
    name: "SiteTopInfoPanel",
    props: [ "sitecode" ],
    data() {
        return {
            onlineUsers: [
                "Tim",
                "Wayne"
            ],
            
        }
    },
    methods: {
    },
    computed: {
    }
}
</script>

<style scoped>
.wrapper {
    margin-bottom: 2em;
}
</style>
