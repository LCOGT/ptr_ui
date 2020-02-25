
<template>
    <div class="wrapper">
        <b-collapse class="card" :open="startOpen">
            <div
            slot="trigger" 
            slot-scope="props"
            class="card-header"
            role="button" >
                <p class="card-header-title"> <slot name="title">default title</slot> </p>
                <a class="card-header-icon">
                    <b-icon :icon="props.open ? 'menu-down' : 'menu-up'"/>
                </a>
            </div>

            <div class="content-slot">
            <slot>
                <div style="padding: 1em;display: flex; justify-content: center;">
                    <b-icon icon="cake" ></b-icon>
                </div>
            </slot>
            </div>

        </b-collapse>
    </div>
</template>

<script>
export default {
    name: "SideInfoPanel",
    props: [ "sitecode", "title", "startOpen" ],
}
</script>

<style scoped>
.wrapper {
    margin-bottom: 1em;
}
.content-slot {
    margin: 1em;
}
</style>
