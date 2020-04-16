<template>
    <div>
        <div id="aladin-lite-div"></div>
    </div>
</template>

<script>
export default {

    mounted() {

        // Initialize Aladin
        var aladin = A.aladin('#aladin-lite-div', {
            survey: "P/DSS2/color", 
            fov:1, 
            target: "M 33", 
            cooFrame: "ICRSd", 
            showFullscreenControl: false, 
            showGotoControl: false, 
            showSimbadPointerControl: true
        });
    },

    
}
</script>

<style scoped>
@import "https://aladin.u-strasbg.fr/AladinLite/api/v2/latest/aladin.min.css";

#aladin-lite-div {
    min-height:450px;
    width:100%;
}

</style>