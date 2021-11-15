
<template>
    <div :style="fontSizeStyle">
        <span v-if="text" style="margin-left: -5px;">
            <span class="logo photon">PHOTON</span>
            <span class="logo ranch">&nbsp;&nbsp;RANCH</span> 
            <span v-if="atLco" class="at">&nbsp;@</span> 
            <span v-if="atLco" class="logo lco">&nbsp;LCO</span>
        </span>
        <span v-else>
            <img src="/img/logos/PTR-logo-photonranch.png" alt="photon ranch observatory" >
        </span>
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
            default: () => "38px"
        },
        atLco: {
            type: Boolean,
            default: false
        },
        withLambda: {
            type: Boolean,
            default: false,
        },
        text: {
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
@import url('https://fonts.googleapis.com/css2?family=Unica+One&display=swap');
.logo {
    font-family: 'Unica One';
    letter-spacing: -2px;
}
.photon {
    color: $logo-red;
}
.ranch {
    color: $logo-blue;
}
.at {
    font-family: 'Unica One';
    color: $logo-blue;
    font-size: 0.8em;
}
.lco {
    color: $logo-blue;
}
.lambda img {
    height: 0.8em;
    margin-left: 0.45em;
}
</style>

