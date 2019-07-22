<template><div>

    <the-dome-cam />
    <br>

    <div class="quick-status">
        quick telescope status/info 
    </div>
    <br>

    <div class="columns quick-image">
        <b-steps type="is-info">
            <b-step-item label="Choose a target"  clickable="true">step1</b-step-item>
            <b-step-item label="Take a picture"  clickable="true">step2</b-step-item>
            <b-step-item label="See the results"  clickable="true">step3</b-step-item>
        </b-steps> 
    </div>
    <br>

    <section>
        <b-field label="Search for a target">
            <b-field grouped>
                <b-input placeholder="target name or position"></b-input>
                <p class="control">
                    <button class="button is-primary">Search</button>
                </p>
            </b-field>
        </b-field>
    </section>
    <br>
    <the-device-selectors />

</div></template>


<script>
import TheDeviceSelectors from '@/components/TheDeviceSelectors'
import TheDomeCam from '@/components/TheDomeCam'
export default {
    name: "SubpageHome",
    props: ["sitecode"],
    components: {
        TheDeviceSelectors,
        TheDomeCam,
    },
    
    
}

</script>


<style scoped>

.quick-status {
    background-color: #232929;
    width: 100%;
    height: 5em;
    text-align: center;
    vertical-align: middle;
    padding-top: 1em;
}

</style>