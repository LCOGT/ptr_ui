<template>
    <a 
        class="button" 
        v-on:click="handleClick(data.url, data.form, data.http_method)" 
        v-bind:class="{ 'is-loading': isLoading }"
        :disabled="isDisabled"
        >{{ data.name }}
    </a>
</template>

<script>
import axios from 'axios'
import { API } from 'aws-amplify'
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
        handleClick (url, form, http_method) {

            if (this.data.site == ''|| this.data.mount == '') {
                console.log('No site and/or mount specified for the command. Command has been cancelled.')
                console.log(`Site: ${this.data.site}`);
                console.log(`Mount: ${this.data.mount}`);
                // TODO: add UI notification here.
                return
            }
            this.isLoading = true
            var vm = this

            form.timestamp = parseInt(Date.now() / 1000)

            let apiName = this.$store.getters['dev/api'];
            let path = url;
            let myInit = {
                body: form,
            }

            switch (http_method.toString()) {
                case 'GET':
                    API.get(apiName, path, myInit).then(response => {
                        vm.isLoading = false;
                        console.log(response)
                    }).catch(error => {
                        console.log(error)
                    });
                    break;
                case 'POST': 
                    API.post(apiName, path, myInit).then(response => {
                        vm.isLoading = false;
                        console.log('SUCCESS')
                        console.log(response)
                        console.log(myInit)
                    }).catch(error => {
                        console.log('ERROR')
                        console.log(error)
                    });
                    break;
                case 'PUT':
                    API.put(apiName, path, myInit).then(response => {
                        vm.isLoading = false;
                        console.log(response)
                    }).catch(error => {
                        console.log(error)
                    });
                    break;
                default:
                    vm.isLoading = false;
                    console.log('bad http method: '+http_method+'.')
            }

            /*
            let config = { headers: { "Authorization": "Bearer " + this.token } }
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
            */
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