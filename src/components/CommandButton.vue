<template>
    <a v-on:click="handleClick(data.url, data.form)" class="button is-dark" v-bind:class="{ 'is-loading': isLoading }">{{ data.name }}</a>
</template>

<script>
import axios from 'axios'
import { mapGetters } from 'vuex'

export default {
    name: 'CommandButton',
    props: ['data'],
    data () {
        return {
            isLoading: false,
        }
    },
    methods: {
        handleClick (url, form) {
            this.isLoading = true
            var vm = this

            let config = { headers: { "Authorization": this.token } }
            let fullUrl = 'http://localhost:5000'+url
            axios.post(fullUrl, form, config)
                .then(function (response) {
                    vm.isLoading = false;
                    console.log(response);
                })
                .catch(function(response) {
                    vm.isLoading = false
                    console.log(response)
                })
        },
    },
    computed: {
        ...mapGetters('auth', {
            token: 'getToken'
        })
    }
}
</script>

<style scoped>
</style>