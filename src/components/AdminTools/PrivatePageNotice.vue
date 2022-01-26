<template>
    <div class="private-page-notice">
    <div class="container">
        <slot>
            ⚠This page (and its link in the menu) is only visible because 
            you are logged in as an admin. Regular users can't see it. ⚠
        </slot>
    </div> 
    </div> 
</template>

<script>
export default {
    name: "PrivatePageNotice" 
}
</script>

<style lang="scss" scoped>
.private-page-notice {
    width: 100%;
    color: rgb(255, 196, 0);
    margin: 1rem 0;
    padding: 0.5rem 0;
    background-color: rgba(255, 197, 72, 0.1);
    font-family: "Tahoma";
}
</style>