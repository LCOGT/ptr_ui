<template>
    <div class="hero">
        <div class="hero-body nopadding">
        <div class="container">
            <div class="devpanell">
                <div class="field" style="margin-left: 0.5em;">
                    <b-switch 
                    v-model="active_api"
                    true-value='ptr-api-local'
                    false-value='ptr-api'
                    size="is-small"
                    type="is-warning">
                    local API is {{ active_api=="ptr-api-local" ? "on" : "off"}}
                    </b-switch>
                </div>
            </div>
        </div>
        </div>
    </div>
</template>

<script>

export default {
    name: "DevPanel",
    computed: {
        // Toggle whether to use localhost:5000 or api.photonranch.org api for api calls. 
        active_api: {
            get() { return this.$store.getters['dev/api'] },
            set(val) { this.$store.dispatch('dev/set_active_api', val) }
        }
    } 
}
</script>

<style lang="scss" scoped>
.devpanell{
    display: flex;
    flex-direction: row;
    align-items: center;
}
.nopadding {
    padding:0;
    padding-top: 5px;
    padding-bottom: 3px;
}
</style>



