<template>
    <a 
        class="button" 
        v-on:click="handleClick" 
        v-bind:class="{ 'is-loading': isLoading, 'is-admin': admin }"
        :disabled="isDisabled"
        >
        <slot name="title"> {{ data.name }} </slot>
    </a>
</template>

<script>
import axios from 'axios'
import { mapGetters } from 'vuex'

export default {
    props: {
        'data': Object,
        'isDisabled': {
            type: Boolean,
            default: false,
        },
        'admin': {
            type: Boolean,
        },
    },
    data () {
        return {
            isLoading: false,
        }
    },
    methods: {

        async getAuthHeader() {
            let token, configWithAuth;
            try {
                token = await this.$auth.getTokenSilently(); 
            } catch(err) {
                console.error(err)
                console.warn('Did not acquire the needed token. Stopping request.')
                
                // small popup notification
                this.$buefy.toast.open({
                    duration: 5000,
                    message: "Oops! You need to be logged in to do that.",
                    position: 'is-bottom',
                    type: 'is-danger' ,
                })
                //return {}
            }

            return {
                'headers': {
                    'Content-Type': 'application/json;charset=UTF-8',
                    'Access-Control-Allow-Origin': '*',
                    'Authorization': `Bearer ${token}`
                }
            }
        },

        handleNotAuthorizedResponse(error) {
            if (error.response) {
                // Request made and server responded
                console.log("error message", error.response.data);
                console.log("error status", error.response.status);
                console.log("error headers", error.response.headers);
                // small popup notification describing error
                this.$buefy.toast.open({
                    duration: 5000,
                    message: `${error.response.status} error: ${error.response.data}`,
                    position: 'is-bottom',
                    type: 'is-danger' ,
                })
            } else if (error.request) {
                // The request was made but no response was received
                console.warn("The request was made but no response was received.")
                console.log(error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.warn("Something happened in setting up the request that triggered an error.")
                console.log('Error', error.message);
            }
        },

        async handleClick () {

            this.isLoading = true

            if (this.data.site == ''|| this.data.mount == '') {
                console.log('No site and/or mount specified for the command. Command has been cancelled.')
                this.isLoading = false
                return
            }

            this.data.form.site=this.data.site
            this.data.form.mount=this.data.mount
            this.data.form.timestamp = parseInt(Date.now() / 1000)

            const url = `${this.$store.state.dev.jobs_api}/newjob?site=${this.data.site}`
            const options = await this.getAuthHeader()
            axios.post(url, this.data.form, options).then(response => {
                this.isLoading = false
                console.log("command response: ",response.data)
                this.$emit('jobPost', response.data)
            }).catch(error => {
                this.isLoading = false;
                this.handleNotAuthorizedResponse(error)
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

.is-admin {
    background-color: rgba(68, 0, 255, 0.164);
    border-color: rgba(76, 0, 255, 0.541);
}
</style>