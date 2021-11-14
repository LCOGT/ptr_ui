<template>
    <div class="logo-container" :style="fontSizeStyle">
        <span class="logo pt">PT</span>
        <span class="logo r">R</span>
        <span v-if="withLambda" class="lambda"><img src="/img/logos/PTR-lambda.png" /></span>
    </div>
</template>

<script>
export default {
    name: "PTR",
    props: {
        withLambda: {
            type: Boolean,
            default: false,
        },
        fontSize: {
            type: String,
            default: () => "38px"
        },
    },
    computed: {
        fontSizeStyle() {
            return `font-size: ${this.fontSize};`
        }
    },
}
</script>

<style lang="scss" scoped>
@import '@/style/_variables.scss';
@import url('https://fonts.googleapis.com/css2?family=Unica+One&display=swap');

.logo-container {
    line-height: 55px;
}
.logo {
    font-family: 'Unica One';
    font-size: 1em;
}
.pt {
    color: $logo-red;
}
.r {
    color: $logo-blue;
}
.lambda img {
    height: 0.65em;
    margin-left: 0.2em;
}
</style>
