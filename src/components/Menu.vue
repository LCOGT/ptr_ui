<template>
    <nav class="navbar is-dark is-fixed-top" role="navigation" aria-label="main navigation">

        <div class="navbar-brand">
            <router-link class="navbar-item" to="/">
                <img src="https://bulma.io/images/bulma-logo.png" width="112" height="28">
            </router-link>
            <router-link class=navbar-item to="/">photon ranch</router-link>

            <a role="button" class="navbar-burger burger" aria-label="menu" aria-expanded="false" data-target="navbarBasicExample">
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
            </a>
        </div>

        <div id="navbarBasicExample" class="navbar-menu">
            <div class="navbar-start">
            <router-link class="navbar-item" to="/"> Home </router-link>

            <router-link class="navbar-item" to="/test"> Test </router-link>

            <div class="navbar-item has-dropdown is-hoverable">
                <a class="navbar-link"> Sites </a>

                <div class="navbar-dropdown">
                    <router-link class="navbar-item" to="/site/wmd"> Santa Barbara - WMD  </router-link>
                    <router-link class="navbar-item" to="/site/saf"> Santa Fe - SAF  </router-link>
                    <hr class="navbar-divider">
                    <router-link class="navbar-item" to="/about"> Report an issue </router-link>
                </div>
            </div>
            </div>

            <div class="navbar-end">

            <div v-if="isLoggedIn" class="navbar-item has-dropdown is-hoverable">
                <a class="navbar-link">Hello, {{username}} </a>

                <div class="navbar-dropdown">
                    <router-link to="/profile" class="navbar-item">Profile</router-link>
                    <hr class="navbar-divider">
                    <a v-on:click="signOut" class="navbar-item has-link">Log out</a>
                </div>
            </div>

            <div v-if="!isLoggedIn" class="navbar-item">
                <div class="buttons">
                    <router-link to="/register" tag="button" class="button is-primary">Sign up</router-link>
                    <router-link to="/login" tag="button" class="button is-light">Log in</router-link>
                </div>
            </div>
            </div>
        </div>

    </nav>
</template>

<script>
import { Auth } from 'aws-amplify';
export default {
    name: 'Menu',
    mounted() {
        let navbar = document.querySelector('.navbar-burger');
        navbar.addEventListener('click', function() {
            let target = navbar.dataset.target;
            let $target = document.getElementById(target);
            navbar.classList.toggle('is-active');
            $target.classList.toggle('is-active');
        });
    },
    methods: {
        signOut() {
            Auth.signOut({ global: true })
                .then(data => {
                    console.log(data)
                    this.$store.commit('setUser', '')
                    })
                .catch(err => console.log(err));
        },
    },
    computed: {
        isLoggedIn() {
            return (this.$store.getters.user == '') ? false : true;
        },
        username() {
            return(this.$store.getters.user.username);
        }
    }

}
</script>

<style scoped>
</style>
