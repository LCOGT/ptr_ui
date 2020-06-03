<template>
<div>
    <h1 class="title">Create a project</h1>

    <div class="columns">
    <section class="column">
        <b-field 
            label="Project Name" 
            :type="{'is-danger': warn.project_name}"
            >
            <b-input class="project-input" v-model="project_name"></b-input>
        </b-field>

        <b-field    
            label="Run during these reserved events:"
            >
            <b-dropdown
                v-model="project_events"
                multiple
                aria-role="list">

                <button class="button is-light" type="button" slot="trigger">
                    <span>Selected Events ({{ project_events.length }})</span>
                    <b-icon icon="menu-down"></b-icon>
                </button>

                <b-dropdown-item disabled> events with no project</b-dropdown-item>
                <b-dropdown-item separator />
                <b-dropdown-item 
                    v-for="(event, index) in user_events_with_projects" 
                    :key="`with-project-${index}`"
                    :value="event" 
                    aria-role="listitem">
                        <span> {{event.title}} </span>
                </b-dropdown-item>
                <b-dropdown-item separator />
                <b-dropdown-item disabled> events with existing projects (will be replaced)</b-dropdown-item>
                <b-dropdown-item separator />
                <b-dropdown-item 
                    v-for="(event, index) in user_events_without_projects" 
                    :key="`without-project-${index}`"
                    :value="event" 
                    aria-role="listitem">
                        <span> {{`${event.title} (${event.project_id.split('#')[0]})`}} </span>
                </b-dropdown-item>

            </b-dropdown>
        </b-field>
        <br>

        <b-field 
            horizontal
            label="Object" 
            :type="{'is-danger': warn.object}"
            >
            <b-field>
            <b-input 
                style="max-width: 100px;"
                class="project-input" 
                v-model="object"></b-input>
            <p class="control">
                <b-button class="button" type="is-text" outlined @click="getCoordinatesFromObject">Get Coordinates</b-button>
            </p>
        </b-field>
        </b-field>
        <b-field 
            horizontal
            label="RA" 
            :type="{'is-danger': warn.ra}"
            >
            <b-input 
                class="project-input" 
                style="max-width: 100px;"
                v-model="ra"></b-input>
        </b-field>
        <b-field 
            horizontal
            label="Dec" 
            :type="{'is-danger': warn.dec}"
            >
            <b-input 
            style="max-width: 100px;"
                class="project-input" 
                v-model="dec"></b-input>
        </b-field>

        <br>

        <b-field 
            v-if="showAdvancedInputs"
            label="Position Angle" 
            :type="{'is-danger': warn.pa}"
            >
            <b-input class="project-input" type="number" min="-360" max="360" v-model="pa"/>
        </b-field>
        <b-field 
            v-if="showAdvancedInputs"
            label="Autofocus">
            <b-checkbox v-model="frequent_autofocus">focus more frequently</b-checkbox>
        </b-field>
        <b-field 
            v-if="showAdvancedInputs"
            label="Dither">
            <b-checkbox v-model="dither"></b-checkbox>
        </b-field>
        <b-field 
            v-if="showAdvancedInputs"
            label="User Diffuser">
            <b-checkbox v-model="use_diffuser"></b-checkbox>
        </b-field>
        <b-field 
            v-if="showAdvancedInputs"
            label="Prefer Bessel">
            <b-checkbox v-model="prefer_bessel"></b-checkbox>
        </b-field>
        <b-field 
            v-if="showAdvancedInputs"
            label="Min Lunar Dist." 
            :type="{'is-danger': warn.lunar_dist_min}"
            >
            <b-input class="project-input" v-model="lunar_dist_min"></b-input>
        </b-field>
        <b-field 
            v-if="showAdvancedInputs"
            label="Max Lunar Phase" 
            :type="{'is-danger': warn.lunar_phase_max}"
            >
            <b-input class="project-input" v-model="lunar_phase_max"></b-input>
        </b-field>
        <button 
            class="button is-text"
            @click="showAdvancedInputs = !showAdvancedInputs"
            style="margin-bottom: 15px;"
            >
            {{showAdvancedInputs ? "hide" : "show"}} advanced
        </button>

    </section>

    <section class="column">

        <div v-for="n in exposures_index" v-bind:key="n" class="exposure-row">
            <b-field label=" ">
                <b-checkbox v-model="exposures[n-1].active"></b-checkbox>
            </b-field>
            <b-field :label="n==1 ? 'Count' : ''" style="width: 130px;">
                <b-input :disabled="!exposures[n-1].active" type="number" min="1" v-model="exposures[n-1].count"/>
            </b-field>
            <b-field :label="n==1 ? 'Exposure [s]' : ''">
                <b-input :disabled="!exposures[n-1].active" type="number" min="0" v-model="exposures[n-1].exposure"/>
            </b-field>
            <b-field :label="n==1 ? 'Filter' : ''">
                <b-select :disabled="!exposures[n-1].active" v-model="exposures[n-1].filter">
                    <option value="air"> air </option>
                    <option value="dark"> dark </option>
                    <option value="L"> L </option>
                    <option value="R"> R </option>
                    <option value="G"> G </option>
                    <option value="B"> B </option>
                    <option value="O3"> O3 </option>
                    <option value="Ha"> Ha </option>
                    <option value="N2"> N2 </option>
                    <option value="S2"> S2 </option>
                    <option value="CR"> CR </option>
                </b-select>
            </b-field>
            <b-field :label="n==1 ? 'Bin' : ''">
                <b-select :disabled="!exposures[n-1].active" v-model="exposures[n-1].bin">
                    <option value="1"> 1 </option>
                    <option value="2"> 2 </option>
                    <option value="3"> 3 </option>
                    <option value="4"> 4 </option>
                </b-select>
            </b-field>
            <div></div>
        </div>
        <button class="button" @click="newExposureRow">add row</button>
        <div/>



    </section>
    </div>

    <b-tooltip :label="!$auth.isAuthenticated ? 'You must be logged in to create a project.' : ''">
    <button 
        class="button is-success is-outlined"
        @click="saveNewProject"
        :disabled="!$auth.isAuthenticated"
        >Create Project</button>
    </b-tooltip>


</div>
</template>

<script>
import {mapGetters, mapState} from 'vuex'
import axios from 'axios'
import moment from 'moment'

export default {
    name: "CreateProjectForm",
    props: ["sitecode"],
    components: { 
    },
    data() {
        return {

            projects_api_url: 'https://a85vsflfd2.execute-api.us-east-1.amazonaws.com/dev',
            showAdvancedInputs: false,

            project_name: '',
            project_events: [],

            object: '',
            ra: '', 
            dec: '',
            pa: 0,

            exposures_index: 1,
            exposures: [
                {
                    active: true,
                    count: 1,
                    exposure: 0,
                    filter: 'L',
                    bin: 1,
                },
            ],

            frequent_autofocus: false,

            dither: false,
            use_diffuser: false,
            prefer_bessel: false,
            lunar_dist_min: 0,
            lunar_phase_max: 1,

            site: this.sitecode,

            warn: {
                project_name: false,
                object: false,
                ra: false,
                dec: false,
                pa: false,
                dither: false,
                user_diffuser: false,
                prefer_bessel: false,
                lunar_dist_min: false,
                lunar_phase_max: false,
            },

            calendarBaseUrl: 'https://m1vw4uqnpd.execute-api.us-east-1.amazonaws.com/dev',

        }
    },
    methods: {

        async getAuthRequestHeader() {
            let token, configWithAuth;
            try {
                token = await this.$auth.getTokenSilently(); 
            } catch(err) {
                console.error(err)
                console.warn('Did not acquire the needed token. Stopping request.')
                
                // small popup notification
                this.$buefy.toast.open({
                    duration: 5000,
                    message: "Oops! You aren't authorized to do that.",
                    position: 'is-bottom',
                    type: 'is-danger' ,
                })
            }

            return {
                'headers': {
                'Content-Type': 'application/json;charset=UTF-8',
                'Access-Control-Allow-Origin': '*',
                'Authorization': `Bearer ${token}`
                }
            }
        },

        getCoordinatesFromObject() {
            console.log(`This function should get coordinates for ${this.object}`)
            let query_script = `query id ${this.object}\\nhd 100`
            let url = "https://cdsweb.u-strasbg.fr/cgi-bin/nph-sesame.jsonp?object=" + encodeURIComponent(this.object);

            axios.get(url).then( response => {
                let result = JSON.parse(response.data.slice(10,-3))
                console.log(result)
                if (!result.Target.Resolver || !result.Target.Resolver.jradeg || !result.Target.Resolver.jdedeg) {
                    console.log('failed')
                    this.$buefy.toast.open({
                        message: "Could not resolve object with name "+this.object,
                        type: "is-danger"
                    })
                }
                this.ra = (result.Target.Resolver.jradeg / 15).toFixed(4) // degrees to decimal hours
                this.dec = result.Target.Resolver.jdedeg.toFixed(4)
                this.object = result.Target.Resolver.oname
            })
        },

        newExposureRow() {

            // Add another object to the list of exposures
            // Do this first to keep reactivity.
            this.exposures.push({
                active: true,
                count: 1,
                exposure: 0, 
                filter: 'L',
                bin: 1,
            })

            // Show one additional row
            this.exposures_index += 1;
        },

        verifyForm() {
            if (this.project_name === '') { this.warn.project_name = true }
            if (this.project_name.includes('#')) {
                this.warn.project_name = true;
                this.$buefy.toast.open({
                    message: "Please avoid '#' in the project name",
                    type: "is-danger"
                })
            }
            if (this.object === '') { this.warn.object = true }
            if (this.ra === '') { this.warn.ra = true }
            if (this.dec === '') { this.warn.dec = true }
            if (this.pa === '') { this.warn.pa = true }
            //if (this.dither == '') { this.warn.dither = true }
            //if (this.lunar_dist_min == '') { this.warn.lunar_dist_min = true }
            //if (this.lunar_phase_max == '') { this.warn.lunar_phase_max = true }
        },

        resetInputWarnings() {
            Object.keys(this.warn).forEach(k => this.warn[k] = false)
        },

        async addProjectToCalendarEvents(project_id, project_events) {
            console.log(`Adding ${project_id} to project events: `, project_events)
            let url = this.calendarBaseUrl + '/add-projects-to-events'
            let body = {
                "project_id": project_id,
                "events": project_events.map(e => ({"event_id": e.event_id, "start": e.start})),
            }
            console.log(body)
            let header = await this.getAuthRequestHeader()

            axios.post(url, body, header).then(response => {
                console.log(response)
            }).catch(err => {
                console.log('error: ',err)
            })

        },

        saveNewProject() {


            this.resetInputWarnings()
            this.verifyForm()

            let url = this.projects_api_url+'/new-project'

            // project_id is format: <project_name>#<utc_milliseconds>
            let project_id = `${this.project_name}#${moment().valueOf()}`

            let project = {
                project_id: project_id,
                created: moment().valueOf(),
                user_id: this.user.sub,
                object: {
                    name: this.object,
                    ra: this.ra,
                    dec: this.dec,
                },
                settings: {
                    position_angle: this.pa,
                    autofocus: this.autofocus,
                    dither: this.dither,
                    use_diffucser: this.use_diffuser,
                    prefer_bessel: this.prefer_bessel,
                },
                completed: [],
                remaining: this.exposures.filter(e => e.active),
            }

            // Make sure all warnings are false, otherwise don't create the project.
            if (Object.values(this.warn).every(x => !x)) {
                axios.post(url, project).then(console.log)
                this.addProjectToCalendarEvents(project_id, this.project_events)
                this.project_events = []

                setTimeout(this.getUserProjects,3000)
                setTimeout(this.getUserEvents,3000)
            }
        },

        getUserProjects() {
            this.$store.dispatch('user_data/fetchUserProjects', this.user.sub)
        },
        getUserEvents() {
            this.$store.dispatch('user_data/fetchUserEvents', this.user.sub)
        },
    },
    watch: {
    },
    computed: {
        ...mapGetters('site_config', [
            'site_config',
            'global_config',
        ]), 
        ...mapState('user_data', [
            'user_events',
            'user_projects',
        ]),
        user_events_with_projects() {
            return this.user_events.filter(event => event.project_id == "none")
        },
        user_events_without_projects() {
            return this.user_events.filter(event => event.project_id != "none")
        },
        user() {
            return this.$auth.user
        },
    },
}
</script>

<style scoped>
.project-input {
    max-width: 200px;
}
.exposure-row {
    display: flex;
    flex-direction: row;
    align-items:center;
}
.exposure-row > * {
    margin-right: 8px;
}
</style>