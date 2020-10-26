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
        <b-tab-item label="Target">
                <div v-for="n in targets_index" v-bind:key="n" class="target-row">
                    
                    <!-- we decided to only allow one target per project -->
                    <!--b-field :label="' '">
                        <b-checkbox v-model="targets[n-1].active"></b-checkbox>
                    </b-field-->

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

                <b-field label="Project Note" style="max-width: 345px;">
                    <b-input 
                        :maxlength="max_fits_header_length"
                        v-model="project_note" ></b-input>
                </b-field>

                <!-- we decided to only allow one target per project -->
                <!--button class="button" @click="newTargetRow">add another target</button-->
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
                            <option
                                v-for="(filter, index) in project_filter_list"
                                v-bind:value="filter"
                                v-bind:selected="index === 0"
                                v-bind:key="index"
                                >
                                {{filter}}
                            </option>
                        </b-select>
                    </b-field>
                    <b-field :label="n==1 ? 'Bin' : ''">
                        <b-select :disabled="!exposures[n-1].active" v-model="exposures[n-1].bin">
                            <option value="1, 1"> 1, 1 </option>
                            <option value="2, 2"> 2, 2 </option>
                            <option value="3, 3"> 3, 3 </option>
                            <option value="4, 4"> 4, 4 </option>
                        </b-select>
                    </b-field>
                    <b-field :label="n==1 ? 'Area' : ''">
                        <b-select :disabled="!exposures[n-1].active" v-model="exposures[n-1].area">
                            <option value="600%"> 600% </option>
                            <option value="300%"> 300% </option>
                            <option value="220%"> 220% </option>
                            <option value="150%"> 150% </option>
                            <option value="FULL"> FULL </option>
                            <option value="SQUARE"> SQUARE </option>
                            <option value="71%"> 71% </option>
                            <option value="50%"> 50% </option>
                            <option value="35%"> 35% </option>
                            <option value="25%"> 25% </option>
                            <option value="12%"> 12% </option>
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
                    style="margin: 15px 0;"
                    >
                    {{showAdvancedInputs ? "hide" : "show"}} advanced
                </button>

                <br>

                <b-field 
                    v-if="showAdvancedInputs"
                    label="Meridian Flip">
                    <b-field
                    type="is-light"
                    >
                        <b-radio-button v-model="meridian_flip"
                            native-value="east_only">
                            <b-icon icon="close"></b-icon>
                            <span>East Only</span>
                        </b-radio-button>

                        <b-radio-button v-model="meridian_flip"
                            native-value="west_only">
                            <b-icon icon="check"></b-icon>
                            <span>West Only</span>
                        </b-radio-button>

                        <b-radio-button v-model="meridian_flip"
                            native-value="flip_ok">
                            Flip OK
                        </b-radio-button>

                        <b-radio-button v-model="meridian_flip"
                            native-value="no_flip">
                            No Flip
                        </b-radio-button>
                    </b-field>
                </b-field>
                
                <b-field grouped v-if="showAdvancedInputs">
                    <b-field 
                        v-if="showAdvancedInputs"
                        label="Ra offset" 
                        >
                        <b-input class="project-input" v-model="ra_offset"></b-input>
                        <b-select v-model="ra_offset_units">
                            <option value="deg">deg</option>
                            <option value="min">minutes</option>
                            <option value="asec">arcsec</option>
                        </b-select>
                    </b-field>
                    <b-field 
                        v-if="showAdvancedInputs"
                        label="Dec offset" 
                        >
                        <b-input class="project-input" v-model="dec_offset"></b-input>
                        <b-select v-model="dec_offset_units">
                            <option value="deg">deg</option>
                            <option value="asec">arcsec</option>
                        </b-select>
                    </b-field>
                </b-field>

                <b-field 
                    v-if="showAdvancedInputs"
                    label="Position Angle" 
                    :type="{'is-danger': warn.pa}"
                    >
                    <b-input class="project-input" type="number" min="-360" max="360" v-model="pa"/>
                    <b-select value="deg">
                        <option value="deg">deg</option>
                    </b-select>
                </b-field>


                <b-field 
                    v-if="showAdvancedInputs"
                    label="Max HA (decimal hours, absolute value)" 
                    :type="{'is-danger': warn.max_ha}" >
                    <b-numberinput 
                        step="0.5" 
                        type="is-light"
                        max="12" 
                        controls-position="compact" 
                        class="project-input" 
                        v-model="max_ha"></b-numberinput>
                </b-field>
                <b-field 
                    v-if="showAdvancedInputs"
                    label="Max Airmass" 
                    :type="{'is-danger': warn.max_airmass}"
                    >
                    <b-input class="project-input" v-model="max_airmass"></b-input>
                </b-field>

                <b-field grouped v-if="showAdvancedInputs">
                    <b-field 
                        v-if="showAdvancedInputs"
                        label="Min Lunar Dist. [deg]" 
                        :type="{'is-danger': warn.lunar_dist_min}"
                        >
                        <b-input class="project-input" v-model="lunar_dist_min"></b-input>
                    </b-field>
                    <b-field 
                        v-if="showAdvancedInputs"
                        label="Max Lunar Phase %" 
                        :type="{'is-danger': warn.lunar_phase_max}"
                        >
                        <b-input class="project-input" v-model="lunar_phase_max"></b-input>
                    </b-field>
                </b-field>

                <b-field v-if="showAdvancedInputs">
                    <b-checkbox v-model="frequent_autofocus">Autofocus: focus more frequently</b-checkbox>
                </b-field>
                <b-field v-if="showAdvancedInputs">
                    <b-checkbox v-model="near_tycho_star">Autofocus: Use Near Tycho Star</b-checkbox>
                </b-field>
                <b-field v-if="showAdvancedInputs">
                    <b-checkbox v-model="prefer_bessell">Prefer Bessel</b-checkbox>
                </b-field>
                <b-field v-if="showAdvancedInputs">
                    <b-checkbox v-model="enhance_photometry">Enhance Photometry</b-checkbox>
                </b-field>

            </section>


        </b-tab-item>
        <b-tab-item label="Scheduling">
                <b-field    
                    label="Add to your exising calendar events:"
                    message="note: this will apply only after you click 'create project'."
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
                        <b-dropdown-item disabled> events with existing projects (existing projects will be replaced)</b-dropdown-item>
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


    <b-tooltip 
        :active="!$auth.isAuthenticated" 
        label="You must be logged in to create a project." >
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
    created() {
        console.log(this.filter_wheel_options.map(x => x[0]))
        console.log(this.generic_filter_list)
    },
    data() {
        return {

            projects_api_url: 'https://projects.photonranch.org/dev',
            showAdvancedInputs: false,

            // Max length for a fits header string value. 
            // Pos 10 to 80, including two single quotes containing the value
            max_fits_header_length: 68, 

            generic_filter_list: [
                "Lum",
                "Red",
                "Green",
                "Blue",
                "NIR",
                "O3",
                "Ha",
                "N2",
                "S2",
                "air",
                "w",
                "clear",
                "silica",
                "up",
                "gp",
                "rp",
                "ip",
                "zs",
                "zp",
                "Y",
                "U",
                "B",
                "V",
                "Rc",
                "Ic",
            ],
                

            /*************************************************/
            /************* Project Default Values ************/
            /*************************************************/
            project_name: '',
            project_events: [],

            target_type: 'single',

            object: '',
            ra: '', 
            dec: '',
            pa: 0,

            project_note: '',

            exposures_index: 1,
            exposures: [
                {
                    active: true,
                    count: 1,
                    imtype: "light",
                    exposure: 1,
                    filter: 'Lum',
                    area: 'FULL',
                    bin: '2, 2',
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

            meridian_flip: 'flip_ok', // can be ['flip_ok', 'no_flip', 'east_only', 'west_only']
            ra_offset: 0.0,
            ra_offset_units: 'deg',
            dec_offset: 0.0,
            dec_offset_units: 'deg',

            max_ha: 4, // decimal hours
            max_airmass: 2.0,

            lunar_dist_min: 30, // deg
            lunar_phase_max: 60, // % 

            frequent_autofocus: false,
            near_tycho_star: false,
            prefer_bessell: false,
            enhance_photometry: false,

            /*************************************************/
            /*********** End Project Default Values **********/
            /*************************************************/

            site: this.sitecode,

            warn: {
                project_name: false,
                object: false,
                ra: false,
                dec: false,
                pa: false,
                user_diffuser: false,
                prefer_bessell: false,
                max_ha: false,
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

            // Add another object to the list of exposures (but it is not visible yet)
            // Do this before rendering it to preserve reactivity.
            // It should also be a copy of the previous row. 
            this.exposures.push( {...this.exposures[this.exposures.length - 1]} )

            // Show the additional row
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
                project_note: this.project_note,
                project_constraints: {
                    ra_offset: this.ra_offset,
                    ra_offset_units: this.ra_offset_units,
                    dec_offset: this.dec_offset,
                    dec_offset_units: this.dec_offset_units,
                    max_ha: this.max_ha,
                    max_airmass: this.max_airmass,
                    prefer_bessell: this.prefer_bessell,
                    lunar_dist_min: this.lunar_dist_min,
                    lunar_phase_max: this.lunar_phase_max,
                    enhance_photometry: this.enhance_photometry,
                    meridian_flip: this.meridian_flip,
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
                        // check that the row is active, then discard that key.
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

        // Append any new filters from the site config to the generic filters list.
        project_filter_list() {
            let generics = this.generic_filter_list
            let config_filters = this.filter_wheel_options.map(x => x[0])
            var combined_filters = generics.concat(
                    config_filters.filter((item) => generics.indexOf(item) < 0)
                )
            return combined_filters
        },

        ...mapGetters('site_config', [
            'site_config',
            'global_config',
            'filter_wheel_options'
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
