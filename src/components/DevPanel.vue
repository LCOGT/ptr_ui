<template>
    <div class="hero">
        <div class="hero-body nopadding">
        <div class="container">
            <div class="devpanell">
                <div class="field">
                    <b-switch 
                    @input="api_toggle"
                    v-model="local_api_is_on"
                    size="is-small"
                    type="is-warning">
                        local API is {{ local_api_is_on ? "on" : "off"}}
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
    data() {
        return {
            local_api_is_on: false,
        }
    },
    methods: {
        api_toggle() {
            if (this.local_api_is_on) {
                this.$store.dispatch('dev/use_local_api')
            }
            else {
                this.$store.dispatch('dev/use_production_api')
            }
        },
    },
    computed: {

        // Toggle whether to use localhost:5000 or api.photonranch.org api for api calls. 
        active_api: {
            get() { return this.$store.getters['dev/api'] },
            set(val) {
                if (val) {
                    this.$store.dispatch('dev/use_local_api')
                }
                else {
                    this.$store.dispatch('dev/use_production_api')
                }
            }
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



