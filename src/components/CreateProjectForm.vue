<template>
<div>
    <h1 class="title">Create a project</h1>

    <div class="project-form">
        <div class="target-row">
            <b-field 
                :type="{'is-warning': project_name_changed}"
                label="Project Name" >
                <template #message>
                    <div v-if="project_name_changed">Warning: if you change the name of an</div>
                    <div v-if="project_name_changed">existing project, you will have to </div>
                    <div v-if="project_name_changed">reconnect any associated calendar events.</div>
                </template>
                <b-input class="project-input" :lazy="false" v-model="project_name"></b-input>
            </b-field>

            <b-field 
                label="Project Note" 
                style="max-width: 345px;">
                <b-input 
                    :maxlength="max_fits_header_length"
                    v-model="project_note" ></b-input>
            </b-field>

        </div>

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
                        <b-button class="button" @click="getCoordinatesFromName(n-1)"><b-icon icon="magnify"/></b-button>
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

        <!-- we decided to only allow one target per project -->
        <!--button class="button" @click="newTargetRow">add another target</button-->
        <hr>

        <div class="exposure-rows">


            <div v-for="n in exposures_index" v-bind:key="n" class="exposure-row">


                <b-field :label="n==1 ? '  ' : ' '">
                    <b-checkbox v-model="exposures[n-1].active"></b-checkbox>
                </b-field>
                <b-field size="is-small" :label="n==1 ? 'Imtype' : ''">
                    <b-select size="is-small" :disabled="!exposures[n-1].active" v-model="exposures[n-1].imtype">
                        <option value="light"> light </option>
                        <option value="dark"> dark </option>
                        <option value="skyflat"> skyflat </option>
                        <option value="screenflat"> screenflat </option>
                        <option value="bias"> bias </option>
                        <option value="autofocus"> autofocus </option>
                    </b-select>
                </b-field>
                <b-field :label="n==1 ? 'Count' : ''" style="width: 100px;">
                    <b-input 
                        size="is-small"
                        :disabled="!exposures[n-1].active" 
                        min="1" 
                        v-model="exposures[n-1].count"/>
                </b-field>
                <b-field :label="n==1 ? 'Exposure [s]' : ''" style="max-width: 100px;">
                    <b-input 
                        size="is-small"
                        :disabled="!exposures[n-1].active" 
                        min="0" 
                        v-model="exposures[n-1].exposure"/>
                </b-field>
                <b-field :label="n==1 ? 'Filter' : ''">
                    <b-select size="is-small" :disabled="!exposures[n-1].active" v-model="exposures[n-1].filter">
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
                    <b-select size="is-small" :disabled="!exposures[n-1].active" v-model="exposures[n-1].bin">
                        <option value="1, 1"> 1, 1 </option>
                        <option value="2, 2"> 2, 2 </option>
                        <option value="3, 3"> 3, 3 </option>
                        <option value="4, 4"> 4, 4 </option>
                    </b-select>
                </b-field>
                <b-field :label="n==1 ? 'Area' : ''">
                    <b-select size="is-small" :disabled="!exposures[n-1].active" v-model="exposures[n-1].area">
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
                    <b-select size="is-small":disabled="!exposures[n-1].active" v-model="exposures[n-1].dither">
                        <option value="yes"> yes </option>
                        <option value="no"> no </option>
                        <option v-for="i in 25" :key="i-1" :value="i-1"> {{i-1}}</option>
                    </b-select>
                </b-field>
                <b-field :label="n==1 ? 'Photometry' : ''">
                    <b-select size="is-small" :disabled="!exposures[n-1].active" v-model="exposures[n-1].photometry">
                        <option value="-"> - </option>
                        <option value="target"> target </option>
                        <option value="comparison1"> Comparison 1 </option>
                        <option value="comparison2"> Comparison 2 </option>
                        <option value="check1"> Check 1 </option>
                        <option value="check2"> Check 2 </option>
                    </b-select>
                </b-field>
                <b-field :label="n==1 ? 'Defocus' : ''">
                    <b-select size="is-small" :disabled="!exposures[n-1].active" v-model="exposures[n-1].defocus">
                        <option v-for="i in 6" :key="i-1" :value="i-1"> {{i-1}}</option>
                        <option value="diffuser"> diffuser </option>
                    </b-select>
                </b-field>

                <div></div>
            </div>
            <div/>
        </div>

        <button style="margin-top: 1em;" class="button" @click="newExposureRow">
            <b-icon icon="plus" />
            <span>add row</span>
        </button>


        <div>
            <div
                class="toggle-advanced-settings"
                @click="showAdvancedInputs = !showAdvancedInputs"
                >
                {{showAdvancedInputs ? "hide" : "show"}} advanced
            </div>

            <br>

            <b-field 
                v-if="showAdvancedInputs"
                label="Meridian Flip">
                <b-field
                >
                    <b-radio-button v-model="project_constraints.meridian_flip"
                        type="is-light"
                        native-value="east_only">
                        <b-icon icon="close"></b-icon>
                        <span>East Only</span>
                    </b-radio-button>

                    <b-radio-button v-model="project_constraints.meridian_flip"
                        type="is-light"
                        native-value="west_only">
                        <b-icon icon="check"></b-icon>
                        <span>West Only</span>
                    </b-radio-button>

                    <b-radio-button v-model="project_constraints.meridian_flip"
                        type="is-light"
                        native-value="flip_ok">
                        Flip OK
                    </b-radio-button>

                    <b-radio-button v-model="project_constraints.meridian_flip"
                        type="is-light"
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
                    <b-input 
                        style="max-width: 100px"
                        class="project-input" 
                        v-model="project_constraints.ra_offset"></b-input>
                    <b-select v-model="project_constraints.ra_offset_units">
                        <option value="deg">deg</option>
                        <option value="min">minutes</option>
                        <option value="asec">arcsec</option>
                    </b-select>
                </b-field>
                <b-field 
                    v-if="showAdvancedInputs"
                    label="Dec offset" 
                    >
                    <b-input 
                        style="max-width: 100px"
                        class="project-input" 
                        v-model="project_constraints.dec_offset"></b-input>
                    <b-select v-model="project_constraints.dec_offset_units">
                        <option value="deg">deg</option>
                        <option value="asec">arcsec</option>
                    </b-select>
                </b-field>
            </b-field>

            <b-field 
                v-if="showAdvancedInputs"
                label="Position Angle" 
                :type="{'is-danger': warn.position_angle}"
                >
                <b-input class="project-input" type="number" min="-360" max="360" v-model="project_constraints.position_angle"/>
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
                    type="is-button"
                    max="12" 
                    controls-position="compact" 
                    class="project-input" 
                    v-model="project_constraints.max_ha"></b-numberinput>
            </b-field>
            <b-field 
                style="max-width: 150px;"
                v-if="showAdvancedInputs"
                label="Max Airmass" 
                :type="{'is-danger': warn.max_airmass}"
                >
                <b-input class="project-input" v-model="project_constraints.max_airmass"></b-input>
            </b-field>

            <b-field grouped v-if="showAdvancedInputs">
                <b-field 
                    v-if="showAdvancedInputs"
                    label="Min Lunar Dist. [deg]" 
                    :type="{'is-danger': warn.lunar_dist_min}"
                    >
                    <b-input class="project-input" v-model="project_constraints.lunar_dist_min"></b-input>
                </b-field>
                <b-field 
                    v-if="showAdvancedInputs"
                    label="Max Lunar Phase %" 
                    :type="{'is-danger': warn.lunar_phase_max}"
                    >
                    <b-input class="project-input" v-model="project_constraints.lunar_phase_max"></b-input>
                </b-field>
            </b-field>

            <div style="height: 5px;"/>
            <b-field v-if="showAdvancedInputs">
                <b-checkbox v-model="project_constraints.frequent_autofocus">Autofocus: focus more frequently</b-checkbox>
            </b-field>
            <b-field v-if="showAdvancedInputs">
                <b-checkbox v-model="project_constraints.near_tycho_star">Autofocus: Use Near Tycho Star</b-checkbox>
            </b-field>
            <b-field v-if="showAdvancedInputs">
                <b-checkbox v-model="project_constraints.prefer_bessell">Prefer Bessel</b-checkbox>
            </b-field>
            <b-field v-if="showAdvancedInputs">
                <b-checkbox v-model="project_constraints.enhance_photometry">Enhance Photometry</b-checkbox>
            </b-field>
            <b-field v-if="showAdvancedInputs">
                <b-checkbox v-model="project_constraints.close_on_block_completion">Close on block completion</b-checkbox>
            </b-field>
            <b-field v-if="showAdvancedInputs">
                <b-checkbox v-model="project_constraints.add_center_to_mosaic">Add center to mosaic</b-checkbox>
            </b-field>
            
            <section v-if="showAdvancedInputs" style="max-width: 50%;">
            <b-field label="Site tags">
                <b-taginput
                    v-model="project_constraints.site_tags"
                    type="is-light"
                    open-on-focus
                    autocomplete
                    :data="filtered_site_tags"
                    :allow-new="false"
                    @typing="getFilteredSiteTags"
                    ellipsis
                    icon="label"
                    placeholder="Add a site"
                    aria-close-label="Delete this tag">
                </b-taginput>
            </b-field>
            </section>

        </div>
        <hr>

        <b-tooltip 
            v-if="!this.project_is_loaded"
            :active="!$auth.isAuthenticated" 
            label="You must be logged in to create a project." >
            <button 
                class="button is-success mr-1"
                @click="saveNewProject"
                :disabled="!$auth.isAuthenticated"
                >Create Project</button>
        </b-tooltip>

        <b-tooltip 
            v-if="this.project_is_loaded"
            :active="!$auth.isAuthenticated" 
            label="You must be logged in to modify a project." >
            <button 
                class="button is-info mr-1"
                @click="modifyProject"
                :disabled="!$auth.isAuthenticated"
                >Modify Project</button>
        </b-tooltip>

        <button 
            class="button is-light is-outlined mr-1"
            @click="clearProjectForm"
            >Clear Form</button>
    </div>


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
    props: ["sitecode", "project_to_load"],
    components: { 
        SideInfoPanel,
        TheSkyChart,
    },
    created() {
        console.log(this.filter_wheel_options.map(x => x[0]))
        console.log(this.generic_filter_list)
    },

    watch: {
        project_to_load(project) {

            if (project == "") {
                this.clearProjectForm()
            }

            this.project_is_loaded = true
            this.loaded_project_name = project.project_name
            this.loaded_project_created_at = project.created_at
            this.loaded_site_tags = project.site_tags

            this.project_name = project.project_name
            this.project_events = project.scheduled_with_events
            this.targets = project.project_targets.map(target => ({...target, active: true}))
            this.targets_index = this.targets.length
            this.project_note = project.project_note
            this.exposures = project.exposures.map(exposure => ({...exposure, active: true}))
            this.exposures_index = this.exposures.length
            this.project_constraints = project.project_constraints

        }
    },
    data() {
        return {

            /*************************************************/
            /*************   Project Parameters   ************/
            /*************************************************/
            project_name: '',
            project_events: [],

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
                    photometry: '-',
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

            project_constraints: {
                site_tags: [],

                meridian_flip: 'flip_ok', // can be ['flip_ok', 'no_flip', 'east_only', 'west_only']
                ra_offset: 0.0,
                ra_offset_units: 'deg',
                dec_offset: 0.0,
                dec_offset_units: 'deg',
                position_angle: 0,

                max_ha: 4, // decimal hours
                max_airmass: 2.0,

                lunar_dist_min: 30, // deg
                lunar_phase_max: 60, // % 

                frequent_autofocus: false,
                near_tycho_star: false,
                prefer_bessell: false,
                enhance_photometry: false,
                close_on_block_completion: false,
                add_center_to_mosaic: false,
            },


            /*************************************************/
            /***********   End Project Parameters   **********/
            /*************************************************/

            project_is_loaded: false,
            loaded_project_name: '',
            loaded_project_created_at: '',

            filtered_site_tags: [], // List of autocomplete matches for site_tags

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
                "HA",
                "N2",
                "S2",
                "ME",
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
                

            site: this.sitecode,

            warn: {
                project_name: false,
                position_angle: false,
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

        // site_tags autocomplete helper
        getFilteredSiteTags(text) {
            this.filtered_site_tags = this.available_sites.filter((option) => {
                return option
                    .toString()
                    .toLowerCase()
                    .indexOf(text.toLowerCase()) >= 0
            })
        },

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

        clearProjectForm() {
            this.project_is_loaded = false
            this.loaded_project_name = ''
            this.loaded_project_created_at = ''

            this.project_name = ""
            this.project_events = []
            this.site_tags = []
            this.targets = [
                {
                    active: true,
                    name: '',
                    ra: '',
                    dec: '',
                },
            ]
            this.targets_index = 1
            this.project_note = ""
            this.exposures = [
                {
                    active: true,
                    count: 1,
                    imtype: "light",
                    exposure: 1,
                    filter: 'Lum',
                    area: 'FULL',
                    bin: '2, 2',
                    dither: 'no',
                    photometry: '-',
                    defocus: 0,
                },
            ]
            this.exposures_index = 1
            this.project_constraints = {
                site_tags: [],

                ra_offset: 0.0,
                ra_offset_units: 'deg',
                dec_offset: 0.0,
                dec_offset_units: 'deg',
                position_angle: 0,

                max_ha: 4, // decimal hours
                max_airmass: 2.0,

                lunar_dist_min: 30, // deg
                lunar_phase_max: 60, // % 

                frequent_autofocus: false,
                near_tycho_star: false,
                prefer_bessell: false,
                enhance_photometry: false,
                close_on_block_completion: false,
                add_center_to_mosaic: false,
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
                project_constraints: this.project_constraints,

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
                remaining:  this.exposures.map(e => parseInt(e.count)),

                // Empty nested arrays such that
                // project_data[exposure_index] = [array of filenames]
                project_data: this.exposures.map(e => []),

                scheduled_with_events: this.project_events
            }

            console.log('project: ', project)

            // Make sure all warnings are false, otherwise don't create the project.
            if (Object.values(this.warn).every(x => !x)) {
                axios.post(url, project).then( response => {
                    this.project_events = []
                    this.clearProjectForm()
                    this.$buefy.toast.open({
                        message: "Project has been created.",
                        type: "is-success"
                    })
                    this.addProjectToCalendarEvents(project.project_name, project.created_at, this.project_events)
                    this.getUserProjects()
                    this.getUserEvents()
                    this.clearProjectForm()
                }).catch(error => {
                    this.$buefy.toast.open({
                        message: "Failed to modify project",
                        type: "is-danger"
                    })
                    console.error(error)
                })
            }
        },

        modifyProject() {
            let url = this.projects_api_url+'/modify-project'
            let project = {
                project_name: this.project_name,
                created_at: moment().utc().format(),
                user_id: this.user.sub,
                project_note: this.project_note,
                project_constraints: this.project_constraints,

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
                remaining: this.exposures.map(e => parseInt(e.count)),

                // Empty nested arrays such that
                // project_data[target_index][exposure_index] = [array of filenames]
                project_data: this.exposures.map(e => []),

                scheduled_with_events: this.project_events
            }

            const request_body = {
                project_name: this.loaded_project_name,
                created_at: this.loaded_project_created_at,
                project_changes: project,
            }

            console.log('project: ', project)

            // Make sure all warnings are false, otherwise don't create the project.
            if (Object.values(this.warn).every(x => !x)) {
                axios.post(url, request_body).then( response => {
                    this.project_events = []
                    this.clearProjectForm()
                    this.$buefy.toast.open({
                        message: "Project has been modified.",
                        type: "is-success"
                    })
                    this.getUserProjects()
                    this.getUserEvents()
                }).catch(error => {
                    this.$buefy.toast.open({
                        message: "Failed to modify project",
                        type: "is-danger"
                    })
                    console.error(error)
                })
            }

        },

        getProject(project_name, created_at) {
            
            let request_params = {
                project_name: project_name,
                created_at: created_at,
            }
            let project_endpoint = this.$store.dev.state.projects_endpoint + '/get-project'
            axios.post(project_endpoint, request_params).then(response => {
                console.log(response)
            }).catch(err => {
                console.log(error)
            })
        },

        getUserProjects() {
            this.$store.dispatch('user_data/fetchUserProjects', this.user.sub)
        },
        getUserEvents() {
            this.$store.dispatch('user_data/fetchUserEvents', this.user.sub)
        },
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

        // True if we're modifying a project and the name is changed.
        project_name_changed() {
            if (
                this.project_is_loaded
                && this.loaded_project_name != this.project_name
            ) {
                return true
            } else {
                return false
            }
        },

        ...mapGetters('site_config', [
            'available_sites',
            'site_config',
            'global_config',
            'filter_wheel_options'
        ]), 
        ...mapState('user_data', [
            'user_events',
            'user_projects',
        ]),
        user_events_with_projects() {
            return this.user_events
                .filter(event => event.project_id == "none")
        },
        user_events_without_projects() {
            return this.user_events
                .filter(event => event.project_id != "none")
        },
        user() {
            return this.$auth.user
        },
    },
}
</script>

<style lang="scss" scoped>
@import "@/style/buefy-styles.scss";

.project-form {
    background-color: $background;
    padding: 1em;
}

.toggle-advanced-settings {
    width: 100%;
    border-bottom: $grey solid 1px;
    margin-top: 1em;
    text-align: center;
    background-color: darken($background, 3);
}
.toggle-advanced-settings:hover {
    cursor: pointer;
}

.exposure-rows {
    max-width: 959px;
    overflow-x:auto;
}
@media screen and (min-width: 768px) {
    .exposure-rows {
        max-width: 700px;
    }
}
@media screen and (min-width: 1024px) {
    .exposure-rows {
        max-width: 750px;
    }
}
@media screen and (min-width: 1408px) {
    .exposure-rows {
        max-width: 959px;
    }
}
.exposure-row {
    white-space: nowrap;
}
.exposure-row > * {
    margin-right: 8px;
    display: inline-block;
}
.target-row {
    display: flex;
    flex-direction: row;
    align-items:bottom;
}
.target-row > * {
    margin-right: 8px;
}

</style>
