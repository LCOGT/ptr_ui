<template>
    <div>
        <b-collapse class="card" :open="true">
            <div
            slot="trigger" 
            slot-scope="props"
            class="card-header"
            role="button" >
                <p class="card-header-title"> JS9 Devtools </p>
                <a class="card-header-icon">
                    <b-icon :icon="props.open ? 'menu-down' : 'menu-up'"/>
                </a>
            </div>
            <div class="js9-dev-buttons">
                <div class="server-tasks">
                    <div :disabled="!js9IsVisible" class="button" @click="JS9.RunAnalysis('macros')">Show Macros</div>
                    <div :disabled="!js9IsVisible" class="button is-warning" @click="JS9.RunAnalysis('update')">Update server scripts</div>
                    <div :disabled="!js9IsVisible" class="button" @click="runMyAnalysis('script2')">Plot profile</div>
                </div>
                <div id="js9-plot-1" style="height: 100px;"></div>
            </div>
        </b-collapse>
    </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
    name: "Js9Devtools",
    components: {
    },
    data() {
        return {
            JS9: JS9, // grab the global variable for use in our component
            plot1: "",
        }
    },
    methods: {

        // run ananlysis on current image, defining a function to display results
        runMyAnalysis: function(aname){
            JS9.RunAnalysis(aname, null, this.displayMyAnalysis);
        },

        // display function passed to JS9.RunAnalysis and JS9.SubmitAnalysis
        // when the analysis task is complete, this callback displays results
        displayMyAnalysis: function(stdout, stderr, errcode, a) {
            var rdiv = document.getElementById("js9-plot-1") 
            if( stderr ){
                alert(stderr);
            } else {
                // remove previous contents
                //rdiv.empty();
                while (rdiv.firstChild) {
                    rdiv.removeChild(rdiv.firstChild);
                }
                // we must destroy previous plot, or else some bindings will remain
                if( this.plot1 ){
                    this.plot1.destroy();
                    this.plot1 = null;
                }
                switch(a.rtype){
                    case "text":
                        // text can just get shoved into the div
                        rdiv.html("<pre>" + stdout + "<\/pre>");
                        break;
                    case "plot":
                        // plot can make use of the already-loaded flot routines
                        // ( and JS9.plotOpts is defined in js9-version.js)
                        try{ 
                            // retrieve plot object (should contain a data object)
                            let pobj = JSON.parse(stdout);
                            if( pobj && pobj.data ){
                            // plot the data
                                this.plot1 = $.plot(rdiv, [pobj], JS9.plotOpts);
                            } else {
                                alert("no analysis data returned");
                            }
                        }
                        catch(e){ alert("can't plot data: "+e+" "+stdout)};
                        break;
                }
            }
        }
    
    },
    computed: {
        js9IsVisible: {
            get() { return this.$store.getters['js9/instanceIsVisible']},
            set(val) { this.$store.commit('js9/instanceIsVisible', val)},
        },
    }
}
</script>

<style scoped>
.js9-dev-buttons {
    padding: 1.25em;
    display: flex;
    flex-direction: column;
}
.server-tasks {
    display: flex;
    flex-direction: column;
}
.server-tasks > * {
    margin-bottom: 0.5em;
}
</style>
