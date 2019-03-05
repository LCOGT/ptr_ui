<template>
    <div>
        <amplify-sign-up v-bind:signUpConfig="signUpConfig"></amplify-sign-up>
        <amplify-confirm-sign-up></amplify-confirm-sign-up>
        <amplify-sign-in></amplify-sign-in>
    </div>
</template>

<script>
export default {

    data() {
        return {
            signUpConfig: {
                header: 'Welcome!',
                defaultCountryCode: '1',
                hideDefaults: true,
                signUpFields: [
                    {
                    label: 'Username',
                    key: 'username',
                    required: true,
                    displayOrder: 1,
                    type: 'string',
                    },
                    {
                    label: 'Password',
                    key: 'password',
                    required: true,
                    displayOrder: 2,
                    type: 'password',
                    },
                    {
                    label: 'Email',
                    key: 'email',
                    required: true,
                    displayOrder: 3,
                    type: 'email',
                    },
                ]
            }
        }
    }
}
</script>

<style scoped>
</style>
