<template>
    <span>
        <div class='information-tabs'>
            <b-tabs expanded v-model="activeTab" size="is-medium" position="is-centered">

                <b-tab-item>
                    <template slot="header">
                        <b-icon pack="fas" icon="globe"></b-icon>
                        <span> sky chart </span>
                    </template>
                    <div> sky chart </div>
                </b-tab-item>
                
                <b-tab-item>
                    <template slot="header">
                        <b-icon pack="fas" icon="cloud-moon-rain"></b-icon>
                        <span> weather </span>
                    </template>
                    <div> weather content </div>
                </b-tab-item>

                <b-tab-item>
                    <template slot="header">
                        <b-icon pack="fas" icon="map-marked"></b-icon>
                        <span> site </span>
                    </template>
                    <div> site content </div>
                </b-tab-item>

                <b-tab-item>
                    <template slot="header">
                        <b-icon pack="fas" icon="images"></b-icon>
                        <span> images <b-tag rounded> 1 </b-tag> </span>
                    </template>
                    <div> images </div>
                </b-tab-item>

            </b-tabs>
        </div>
    </span>
</template>


<script>
export default {
    name: 'InformationTabs',
    data() {
            return {
                activeTab: 0,
            }
        }
}
</script>

<style scoped>
.information-tabs {
    margin: 2em;
}
</style>
