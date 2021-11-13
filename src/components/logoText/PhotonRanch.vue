
<template>
    <div :style="fontSizeStyle">
        <span class="logo photon">PHOTON</span>
        <span class="logo ranch">&nbsp;RANCH</span> 
        <span v-if="atLco" class="at">&nbsp;@</span> 
        <span v-if="atLco" class="logo lco">&nbsp;LCO</span>

        <span v-if="withLambda" class="lambda">
            <img src="/img/logos/PTR-lambda.png" alt="photon ranch observatory" >
        </span>
    </div>
</template>

<script>
export default {
    name: "PhotonRanch",
    props: {
        fontSize: {
            type: String,
            default: () => "50px"
        },
        atLco: {
            type: Boolean,
            default: false
        },
        withLambda: {
            type: Boolean,
            default: false,
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
//@import url('https://fonts.googleapis.com/css2?family=Unica+One&display=swap');
@import '/img/logos/fonts/unica_oneregular.css';
.logo {
    font-family: 'unica_oneregular';
    letter-spacing: -3px;
}
.photon {
    color: $logo-red;
}
.ranch {
    color: $logo-blue;
}
.at {
    font-family: 'unica_oneregular';
    color: $logo-blue;
    font-size: 0.8em;
}
.lco {
    color: $logo-blue;
}
.lambda img {
    height: 0.8em;
    margin-left: 0.3em;
}
</style>

