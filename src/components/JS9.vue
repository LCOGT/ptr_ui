<template>

<div class="Analysis">
    <p>Analyze your image below:</p>
    <div class="JS9Menubar" style="visibility: visible;"></div>
    <div class="JS9Toolbar" style="visibility: visible;"></div>
    <div class="JS9" id="JS9" data-width="256px" data-height="256px" style="visibility: visible;"></div>
</div>
        
</template>

<script>
import { fabric } from 'fabric'
import { API } from 'aws-amplify'


export default {
    name: 'JS9',
    data() {
        return {
            cur_img: '',
            isSelectable: true,
        }
    },
    beforeMount() {
        // API.post('ptr-api', '/latest_images/1').then(response => {
        //     this.cur_img = response.image_url
        //     console.log(this.cur_img)
        // }).catch(error => {
        //     console.log(error.response)
        // });
    },
    methods: {
       

    }
}
</script>

<style scoped>
.columns {
    border: 1px white solid;
}
.controls {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}
.button {
    margin-top: 5px;
    width: auto;
    
}
</style>