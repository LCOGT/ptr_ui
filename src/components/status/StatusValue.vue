<template>
    <div 
        :class="classes"
        :@click="clickHandler"
        >
        {{ value }}
        {{ timestamp }}
    </div>
</template>

<script>
export default {
    name: "StatusValue",
    props: {
        value: {
            type: String,
            default: () => '-',
        },
        timestamp: {
            typye: Number,
            default: () => 0
        },
        clickHandler: {
            type: Function,
            default: null
        },


    },
    computed: {
        classes() {
            return ''
        },
        hasClickHandler() {
            return this.clickHandler
        }
    },
}
</script>

<style lang="scss" scoped>
</style>