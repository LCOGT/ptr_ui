<template>
    <div class="columns">
        <div class="column">
            <div class="JS9"></div>
        </div>
        <div class="column controls">
            <div class="field">
                <b-switch type="is-info" v-model="isSelectable" >
                    {{ isSelectable ? "Selectable" : "Not Selectable" }}
                </b-switch>
            </div>
        </div>
    </div>
</template>

<script>
import { fabric } from 'fabric'

export default {
    name: 'JS9',
    data() {
        return {
            cur_img: '',
            isSelectable: true,
        }
    },
    beforeMount() {
        API.post('LambdaTest', '/getimage').then(response => {
            this.cur_img = response.image_url
            console.log(this.cur_img)
        }).catch(error => {
            console.log(error.response)
        });
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