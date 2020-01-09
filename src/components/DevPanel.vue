<template>
    <div class="hero">
        <div class="hero-body nopadding">
        <div class="container">
            <div class="devpanel">
                <p class="has-text-grey-lighter has-text-weight-light is-family-monospace is-size-7">dev tools: </p>
                <b-switch 
                style="margin-left: 1em;"
                v-model="active_api"
                true-value='ptr-api-local'
                false-value='ptr-api'
                size="is-small"
                type="is-warning">
                local API is {{ active_api=="ptr-api-local" ? "on" : "off"}}
                </b-switch>
                <div class="divider" />
                <button class="button is-small is-dark" @click="clearConsole">clear console</button>
                <div class="divider" />
                <button class="button is-small is-dark" @click="userInfo">user info</button>
                <div v-if="$auth.loading" class="divider" />
                <button v-if="$auth.loading" class="button is-small is-danger" style="background-color: red;">auth is loading</button>
            </div>
        </div>
        </div>
    </div>
</template>

<script>

export default {
    name: "DevPanel",
    methods: {
        clearConsole(){console.clear()},
        userInfo(){console.log(this.$auth.user)}
    },
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
.devpanel{
    display: flex;
    flex-direction: row;
    align-items: center;
}
.divider { 
    border-left: 1px solid #aaa;
    height: 20px;
    margin-left: 1em;
    padding-right: 1em;
}
.nopadding {
    padding:0;
    padding-top: 5px;
    padding-bottom: 3px;
}
</style>



