<template>
    <div>
        <button class="button" v-on:click="authenticate">authenticate</button>
        <button class="button" v-on:click="currentSession">current session</button>
        <button class="button" v-on:click="currentUserInfo">current user info</button>
        <button class="button" v-on:click="signOut">sign out</button>
        <button class="button" v-on:click="signIn">sign in as timbeccue</button>
        <button class="button" v-on:click="getUser">getUser</button>
    </div>
</template>
    
<script>
import { Auth, Amplify } from 'aws-amplify';
import { AmplifyEventBus } from 'aws-amplify-vue';


export default {
    name: 'Test',
    data: function() {
        return {
            isTimLoggedIn:''
        }
    },
    methods: {
        authenticate() {
            Auth.currentAuthenticatedUser({
                bypassCache: false
            }).then(user => console.log(user))
            .catch(err => console.log(err));
        },
        currentSession() {
            Auth.currentSession()
                .then(data => console.log(data))
                .catch(err => console.log(err));
        },
        currentUserInfo() {
            Auth.currentUserInfo()
                .then(data => console.log(data))
                .catch(err => console.log(err));
        },
        signOut() {
            Auth.signOut({ global: true })
                .then(data => {
                    console.log(data)
                    this.$store.commit('setUser', '')
                    })
                .catch(err => console.log(err));
        },
        signIn() {
            Auth.signIn({username: 'timbeccue', password: 'Password1!'})
                .then(user => {
                    console.log(user);
                    this.$store.commit('setUser', user);
                    })
            .catch(err => console.log(err));
        },
        getUser() {
            let user = this.$store.getters.user
            console.log('user: ', user)
            console.log('username: ', user.username)
        },
    },
    watch: {
        setIsTimLoggedIn() {
            Auth.currentUserInfo()
                .then(user => {
                    console.log(user)
                    if (user == null) { this.isTimLoggedIn = false; console.log('is null') }
                    else { this.isTimLoggedIn = true}
                })
                .catch(err => console.log(err))
        }
    },
    mounted() {
        AmplifyEventBus.$on('authState', info => {
            console.log(`Here is the auth event that was just emitted by an Amplify component: ${info}`)
        });
    }
}
</script>

<style scoped>
</style>
