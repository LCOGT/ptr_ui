<template>
    <a 
        class="button" 
        v-on:click="handleClick(data.url, data.form)" 
        v-bind:class="{ 'is-loading': isLoading }"
        :disabled="isDisabled"
        >{{ data.name }}
    </a>
</template>

<script>
import axios from 'axios'
import { mapGetters } from 'vuex'

export default {
    name: 'BaseCommandButton',
    props: {
        'data': Object,
        'isDisabled': {
            type: Boolean,
            default: false,
        },
    },
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