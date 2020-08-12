<template>
<div>
    <h1 class="title">Create a project</h1>

                <b-field 
                    label="Project Name" 
                    :type="{'is-danger': warn.project_name}"
                    >
                    <b-input class="project-input" v-model="project_name"></b-input>
                </b-field>



     <b-tabs type="is-boxed">

        <b-tab-item label="Targets">
                <div v-for="n in targets_index" v-bind:key="n" class="target-row">

                    <b-field :label="' '">
                        <b-checkbox v-model="targets[n-1].active"></b-checkbox>
                    </b-field>

                    <b-field :label="n==1 ? 'Name' : ''" style="width: 130px;">
                        <b-field>
                            <b-input 
                                :disabled="!targets[n-1].active"
                                style="max-width: 150px;"
                                class="project-input" 
                                v-model="targets[n-1].name"></b-input>
                            <p class="control">
                                <b-button class="button" type="is-light" @click="getCoordinatesFromName(n-1)"><b-icon icon="magnify"/></b-button>
                            </p>
                        </b-field>
                    </b-field>

                    <b-field 
                        :type="{'is-danger': warn.ra}"
                        :label="n==1 ? 'RA' : ''"
                        style="width: 100px;"
                        >
                        <b-input 
                            :disabled="!targets[n-1].active" 
                            v-model="targets[n-1].ra"/>
                    </b-field>

                    <b-field 
                        :type="{'is-danger': warn.dec}"
                        :label="n==1 ? 'Dec' : ''"
                        style="width: 100px;"
                        >
                        <b-input 
                            :disabled="!targets[n-1].active" 
                            v-model="targets[n-1].dec"/>
                    </b-field>

                    <div></div>

                </div>
                <button class="button" @click="newTargetRow">add another target</button>
        </b-tab-item>
        <b-tab-item label="Settings">

                
            <section class="columnn">

                <div v-for="n in exposures_index" v-bind:key="n" class="exposure-row">
                    <b-field label=" ">
                        <b-checkbox v-model="exposures[n-1].active"></b-checkbox>
                    </b-field>
                    <b-field :label="n==1 ? 'Imtype' : ''">
                        <b-select :disabled="!exposures[n-1].active" v-model="exposures[n-1].imtype">
                            <option value="light"> light </option>
                            <option value="dark"> dark </option>
                            <option value="skyflat"> skyflat </option>
                            <option value="screenflat"> screenflat </option>
                            <option value="bias"> bias </option>
                            <option value="autofocus"> autofocus </option>
                        </b-select>
                    </b-field>
                    <b-field :label="n==1 ? 'Count' : ''" style="width: 130px;">
                        <b-input 
                            :disabled="!exposures[n-1].active" 
                            type="number" 
                            min="1" 
                            v-model="exposures[n-1].count"/>
                    </b-field>
                    <b-field :label="n==1 ? 'Exposure [s]' : ''">
                        <b-input 
                            :disabled="!exposures[n-1].active" 
                            type="number" 
                            min="0" 
                            v-model="exposures[n-1].exposure"/>
                    </b-field>
                    <b-field :label="n==1 ? 'Filter' : ''">
                        <b-select :disabled="!exposures[n-1].active" v-model="exposures[n-1].filter">
                            <option value="Lum"> Lum </option>
                            <option value="Red"> Red </option>
                            <option value="Green"> Green </option>
                            <option value="Blue"> Blue </option>
                            <option value="NIR"> NIR </option>
                            <option value="O3"> O3 </option>
                            <option value="Ha"> HA </option>
                            <option value="N2"> N2 </option>
                            <option value="S2"> S2 </option>
                            <option value="CR"> CR </option>
                            <option value="EXO"> EXO </option>
                            <option value="W"> W </option>
                            <option value="air"> air </option>
                            <option value="clear"> clear </option>
                            <option value="silica"> silica </option>
                            <option value="up"> u' </option>
                            <option value="gp"> g' </option>
                            <option value="rp"> r' </option>
                            <option value="ip"> i' </option>
                            <option value="zs"> zs </option>
                            <option value="zp"> z' </option>
                            <option value="Y"> Y </option>
                            <option value="U"> U </option>
                            <option value="B"> B </option>
                            <option value="V"> V </option>
                            <option value="Rc"> Rc </option>
                            <option value="Ic"> Ic </option>
                            <option value="dark"> dark </option>
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
                    <b-field :label="n==1 ? 'Dither' : ''">
                        <b-select :disabled="!exposures[n-1].active" v-model="exposures[n-1].dither">
                            <option value="yes"> yes </option>
                            <option value="no"> no </option>
                            <option v-for="i in 25" :key="i-1" :value="i-1"> {{i-1}}</option>
                        </b-select>
                    </b-field>
                    <b-field :label="n==1 ? 'Defocus' : ''">
                        <b-select :disabled="!exposures[n-1].active" v-model="exposures[n-1].defocus">
                            <option v-for="i in 6" :key="i-1" :value="i-1"> {{i-1}}</option>
                            <option value="diffuser"> diffuser </option>
                        </b-select>
                    </b-field>
                    <div></div>
                </div>
                <button class="button" @click="newExposureRow">add row</button>
                <div/>
            </section>
            <section class="columnn">
                <button 
                    class="button is-text"
                    @click="showAdvancedInputs = !showAdvancedInputs"
                    style="margin-bottom: 15px;"
                    >
                    {{showAdvancedInputs ? "hide" : "show"}} advanced
                </button>

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
                    label="Meridian Flip">
                    <b-checkbox v-model="noflip">No Flip</b-checkbox>
                </b-field>
                <b-field 
                    v-if="showAdvancedInputs"
                    label="Autofocus">
                    <b-checkbox v-model="frequent_autofocus">focus more frequently</b-checkbox>
                </b-field>
                <b-field 
                    v-if="showAdvancedInputs" >
                    <b-checkbox v-model="near_tycho_star">Use Near Tycho Star</b-checkbox>
                </b-field>
                <b-field 
                    v-if="showAdvancedInputs"
                    label="Prefer Bessell">
                    <b-checkbox v-model="prefer_bessell"></b-checkbox>
                </b-field>
                <b-field 
                    v-if="showAdvancedInputs"
                    label="Enhance Photometry">
                    <b-checkbox v-model="enhance_photometry"></b-checkbox>
                </b-field>
                <b-field 
                    v-if="showAdvancedInputs"
                    label="Max Airmass" 
                    :type="{'is-danger': warn.max_airmass}"
                    >
                    <b-input class="project-input" v-model="max_airmass"></b-input>
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

            </section>


        </b-tab-item>
        <b-tab-item label="Scheduling">
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
                                <span> {{event.title}} - {{event.site}} </span>
                        </b-dropdown-item>
                        <b-dropdown-item separator />
                        <b-dropdown-item disabled> events with existing projects (will be replaced)</b-dropdown-item>
                        <b-dropdown-item separator />
                        <b-dropdown-item 
                            v-for="(event, index) in user_events_without_projects" 
                            :key="`without-project-${index}`"
                            :value="event" 
                            aria-role="listitem">
                                <span> {{`${event.title} (${event.project_id.split('#')[0]}) - ${event.site}`}} </span>
                        </b-dropdown-item>

                    </b-dropdown>
                </b-field>
        </b-tab-item>
    </b-tabs>


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
import SideInfoPanel from '@/components/SideInfoPanel'
import TheSkyChart from '@/components/celestialmap/TheSkyChart'

export default {
    name: "CreateProjectForm",
    props: ["sitecode"],
    components: { 
        SideInfoPanel,
        TheSkyChart,
    },
    data() {
        return {

            //projects_api_url: 'https://a85vsflfd2.execute-api.us-east-1.amazonaws.com/dev',
            projects_api_url: 'https://projects.photonranch.org/dev',
            showAdvancedInputs: false,

            project_name: '',
            project_events: [],

            target_type: 'single',

            object: '',
            ra: '', 
            dec: '',
            pa: 0,

            exposures_index: 1,
            exposures: [
                {
                    active: true,
                    count: 1,
                    imtype: "light",
                    exposure: 0,
                    filter: 'Lum',
                    bin: 1,
                    dither: 'no',
                    defocus: 0,
                },
            ],

            targets_index: 1,
            targets: [
                {
                    active: true,
                    name: '',
                    ra: '',
                    dec: '',
                },
            ],

            noflip: false,
            frequent_autofocus: false,
            near_tycho_star: false,

            prefer_bessell: false,
            max_airmass: 2.0,
            enhance_photometry: false,
            lunar_dist_min: 0,
            lunar_phase_max: 1,

            site: this.sitecode,

            warn: {
                project_name: false,
                object: false,
                ra: false,
                dec: false,
                pa: false,
                user_diffuser: false,
                prefer_bessell: false,
                max_airmass: false,
                lunar_dist_min: false,
                lunar_phase_max: false,
            },

            calendarBaseUrl: 'https://calendar.photonranch.org/dev',

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

        getCoordinatesFromName(target_index) {
            console.log(`This function should get coordinates for ${this.targets[target_index].name}`)
            let query_script = `query id ${this.targets[target_index].name}\\nhd 100`
            let url = "https://cdsweb.u-strasbg.fr/cgi-bin/nph-sesame.jsonp?object=" + encodeURIComponent(this.targets[target_index].name);

            axios.get(url).then( response => {
                let result = JSON.parse(response.data.slice(10,-3))
                console.log(result)
                if (!result.Target.Resolver || !result.Target.Resolver.jradeg || !result.Target.Resolver.jdedeg) {
                    console.log('failed')
                    this.$buefy.toast.open({
                        message: "Could not resolve object with name "+this.targets[target_index].name,
                        type: "is-danger"
                    })
                }
                this.targets[target_index].ra = (result.Target.Resolver.jradeg / 15).toFixed(4) // degrees to decimal hours
                this.targets[target_index].dec = result.Target.Resolver.jdedeg.toFixed(4)
                this.targets[target_index].name= result.Target.Resolver.oname
            })
        },

        newExposureRow() {

            // Add another object to the list of exposures
            // Do this first to keep reactivity.
            this.exposures.push({
                active: true,
                count: 1,
                imtype: 'light',
                exposure: 0, 
                filter: 'Lum',
                bin: 1,
                dither: 'no',
                defocus: 0,
            })

            // Show one additional row
            this.exposures_index += 1;
        },
        newTargetRow() {

            // Add another object to the list of targets
            // Do this first to keep reactivity.
            this.targets.push({
                active: true,
                name: '',
                ra: '', 
                dec: '',
            })

            // Show one additional row
            this.targets_index += 1;
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
            //if (this.object === '') { this.warn.object = true }
            //if (this.ra === '') { this.warn.ra = true }
            //if (this.dec === '') { this.warn.dec = true }
            //if (this.pa === '') { this.warn.pa = true }
            //if (this.dither == '') { this.warn.dither = true }
            //if (this.lunar_dist_min == '') { this.warn.lunar_dist_min = true }
            //if (this.lunar_phase_max == '') { this.warn.lunar_phase_max = true }
        },

        resetInputWarnings() {
            Object.keys(this.warn).forEach(k => this.warn[k] = false)
        },

        async addProjectToCalendarEvents(project_name,created_at, project_events) {
            let url = this.calendarBaseUrl + '/add-projects-to-events'
            let body = {
                "project_id": `${project_name}#${created_at}`,
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

            let remaining = {}
            this.exposures.map(e => {
                let key = `bin${e.bin}#exposure${e.exposure}#filter${e.filter}`
                remaining[key] = e.count
            })
            console.log(remaining)

            let project = {
                project_name: this.project_name,
                created_at: moment().utc().format(),
                user_id: this.user.sub,
                project_constraints: {
                    max_airmass: this.max_airmass,
                    prefer_bessell: this.prefer_bessell,
                    lunar_dist_min: this.lunar_dist_min,
                    lunar_phase_max: this.lunar_phase_max,
                    enhance_photometry: this.enhance_photometry,
                    noflip: this.noflip,
                    frequent_autofocus: this.frequent_autofocus,
                    use_tycho_star: this.use_tycho_star,
                    pa: this.pa,
                    
                },

                // List of objects (targets in the project)
                project_targets: this.targets
                        .filter(t => t.active)
                        .map(({active, ...stuff_to_keep}) => stuff_to_keep),

                // List of objects (exposures to complete for each target).
                exposures: this.exposures
                        .filter(e => e.active)
                        .map(({active, ...stuff_to_keep}) => stuff_to_keep),

                // Nested arrays such that
                // remaining[target_index][exposure_index] = number of remaining exposures
                remaining: this.targets
                        .map(t => this.exposures.map(e => parseInt(e.count))),

                // Empty nested arrays such that
                // project_data[target_index][exposure_index] = [array of filenames]
                project_data: this.targets.map(t => this.exposures.map(e => [])),

                scheduled_with_events: this.project_events.map(e => ({id: e.event_id, name: e.title}))

            }

            console.log('project: ', project)

            // Make sure all warnings are false, otherwise don't create the project.
            if (Object.values(this.warn).every(x => !x)) {
                axios.post(url, project).then(console.log)
                this.addProjectToCalendarEvents(project.project_name, project.created_at, this.project_events)
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
.target-row {
    display: flex;
    flex-direction: row;
    align-items:center;
}
.target-row > * {
    margin-right: 8px;
}
</style>