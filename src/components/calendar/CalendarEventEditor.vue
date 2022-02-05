<template><section>
    <b-field horizontal >
        <p class="is-family-secondary is-size-2 has-text-weight-bold">Make a Reservation</p>
    </b-field>
    <b-field horizontal label="User">
        <p class="is-family-primary">{{eventDetails.creator}}</p>
    </b-field>

    <b-field horizontal label="Observatory">
        <p class="is-family-primary">{{eventDetails.resourceId}}</p>
    </b-field>
    
    <b-field horizontal label="Event Name">
        <b-input 
            v-model="title"
            placeholder="Add a name for your reservation"
            required
            validation-message="Please include a title"
            ref="title_input"
        >{{title}}</b-input>
    </b-field>

    <hr>

    <b-tabs type="is-boxed" v-model="reservation_type_tabs">
        <b-tab-item label="Real Time Session" value="realtime">
            <b-field horizontal label="Night of">
                <p class="is-family-primary">{{nightOf}}</p>
            </b-field>
            <b-field horizontal label="Start Time">
                <b-select v-model="startStr">
                    <option
                    v-for="t in startTimeOptions"
                    :value="t.iso"
                    :key="t.sort">
                    {{t.hhmm}}
                    </option>
                </b-select>
            </b-field>
            <b-field horizontal label="Duration">
                <b-field>
                <b-radio-button v-model="real_time_session_duration"
                    type="is-primary is-outlined"
                    :focused="false"
                    :native-value="30">
                    30 min
                </b-radio-button>
                <b-radio-button v-model="real_time_session_duration"
                    type="is-primary is-outlined"
                    :focused="false"
                    :native-value="45">
                    45 min
                </b-radio-button>
                </b-field>
            </b-field>
        </b-tab-item>
        <b-tab-item label="Project Session" value="project">
            <b-field horizontal label="Night of">
                <p class="is-family-primary">{{nightOf}}</p>
            </b-field>
            <b-field horizontal label="Start Time">
                <b-select v-model="startStr">
                    <option
                    v-for="t in startTimeOptions"
                    :value="t.iso"
                    :key="t.sort">
                    {{t.hhmm}}
                    </option>
                </b-select>
            </b-field>

            <b-field horizontal label="End Time">
                <b-select v-model="endStr">
                    <option
                    v-for="t in endTimeOptions"
                    :value="t.iso"
                    :key="t.sort">
                    {{t.hhmm}}
                    </option>
                </b-select>
            </b-field>


            <b-field horizontal>
                {{eventDuration}}
            </b-field>

            <hr>

            <b-field horizontal label="Project">
                <div style="display:flex">
                    <b-select v-model="project_name_and_created">
                        <option value="none">none</option>
                        <option
                            v-for="(project, index) in displayedProjects" 
                            :key="index"
                            :value="`${project.project_name}#${project.created_at}`" 
                            aria-role="listitem">
                            <span>{{project.project_name}}</span>
                        </option>
                    </b-select>
                    <b-checkbox 
                        v-if="userIsAdmin" 
                        v-model="show_everyones_projects"
                        class="pl-3" 
                        style="color: #aaa; margin-left: auto;">
                        [admin] show everyone's projects
                    </b-checkbox>
                </div>
            </b-field>
            <b-field label="Note" horizontal >
                <b-input 
                    v-model="reservation_note" 
                    :maxlength="max_fits_header_length"
                    > </b-input>
            </b-field>
        </b-tab-item>

    </b-tabs>

    <hr>

    <b-field horizontal>
        <b-field>
        <div class="level">

        <div class="level-left">
            <button 
            class="button is-info r-margin" 
            :class="{ 'is-loading': submitIsLoading }"
            v-if="isNewEvent"
            :disabled="!$auth.isAuthenticated"
            @click="handleSubmit">
            submit
            </button>

            <button 
            class="button is-info r-margin" 
            :class="{ 'is-loading': modifyIsLoading }"
            v-if="!isNewEvent"
            :disabled="!$auth.isAuthenticated"
            @click="handleModify">
            modify event
            </button>

            <button 
            class="button is-grey r-margin" 
            @click="$emit('cancel')">
            cancel
            </button>
        </div>

        <div class="level-right">
            <button 
            class="button is-danger level-item" 
            :class="{ 'is-loading': deleteIsLoading }"
            v-if="!isNewEvent"
            :disabled="!$auth.isAuthenticated"
            @click="handleDelete">
            remove event
            </button>
        </div>

        </div>
        </b-field>
    </b-field>

    <b-field horizontal>
    <p class='login-warning' v-if="!$auth.isAuthenticated">
        Note: you must be authenticated to create and modify events.
    </p>
    <div/>
    </b-field>

</section>
</template>

<script>
import moment from 'moment';
import {mapState, mapGetters} from 'vuex'

export default {
    name: 'CalendarEventEditor',
    props: [
        'eventDetails', 
        'isNewEvent',
    ],
    data() {
        return {

            // Max length for a fits header string value. 
            // Pos 10 to 80, including two single quotes containing the value
            max_fits_header_length: 68, 

            real_time_session_duration: 30,
            reservation_type_tabs: 'realtime',

            no_title_warning:true,

            show_everyones_projects: false,

            submitIsLoading: false,
            modifyIsLoading: false,
            deleteIsLoading: false,

            id: this.eventDetails.id,
            startStr: moment(this.eventDetails.startStr).utc().format(),
            endStr: moment(this.eventDetails.endStr).utc().format(),
            title: this.eventDetails.title,
            creator: this.eventDetails.creator,
            creator_id: this.eventDetails.creator_id,
            site: this.eventDetails.site,
            resourceId: this.eventDetails.resourceId,
            project_name_and_created: this.eventDetails.project_id,
            reservation_note: this.eventDetails.reservation_note,

        }
    },
    mounted() {
        console.log(this.eventDetails)
        this.startStr = moment(this.eventDetails.startStr).tz(this.timezone).format()
        this.endStr = moment(this.eventDetails.endStr).tz(this.timezone).format()
        this.reservation_type_tabs = this.eventDetails.reservation_type

        // If an admin opens an event they didn't create, we want them to be able to see the associated project.
        // So we set 'show_everyones_projects' = true
        if (this.eventDetails.creator != this.$auth.user.name && this.userIsAdmin) {
            this.show_everyones_projects = true
        }
    },

    watch: {
        
        // Refresh the list of available projects if an admin wants to see everything
        show_everyones_projects: function () {
            if (this.show_everyones_projects) {
                this.$store.dispatch('user_data/fetchAllProjects')
            }
            else {
                this.$store.dispatch('user_data/fetchUserProjects', this.$auth.user.sub)
            }
        },

    },
    computed: {
        ...mapState('user_data', [
            'user_projects',
            'all_projects',
            'user_projects_is_loading',
            'all_projects_is_loading',
        ]),
        ...mapGetters('site_config', [
            'timezone',
        ]),
        displayedProjects() {
            if (this.show_everyones_projects) {
                return this.all_projects;
            }
            else {
                return this.user_projects;
            }
        },
        projectsIsLoading() {
            if (this.show_everyones_projects) {
                return this.all_projects_is_loading;
            }
            else {
                return this.user_projects_is_loading;
            }
        },
        nightOf() {
            return moment(this.eventDetails.startStr).tz(this.timezone).format('dddd, MMMM D, YYYY')
        },
        startTimeOptions() {
            let startTimes = [] 
            const selectedEndTime = moment(this.endStr)
            const interval = 5 // 5 minutes
            const range = 2 // hours

            // The value in the middle of our array
            let middleTime = moment(this.eventDetails.startStr).tz(this.timezone)
            // The first time in the array. 
            let startOption = middleTime.subtract(range, 'h')

            for (let i=0; i<2*range*60/interval; i++) {
                // make sure the user can't select negative time intervals.
                if (startOption.isBefore(selectedEndTime)) {
                    startTimes.push({
                        sort: i,
                        iso:startOption.format(),
                        hhmm:startOption.format('HH:mm'),
                        moment: startOption
                    })
                }
                // Increment the time for the next loop.
                startOption.add(interval, 'm')
            }
            return startTimes
        },
        endTimeOptions() {
            let endTimes = [] 
            const selectedStartTime = moment(this.startStr)
            const interval = 5 // 5 minutes
            const range = 2 // hours

            // The value in the middle of our array
            let middleTime = moment(this.eventDetails.endStr).tz(this.timezone)
            // The first time in the array. 
            let endOption = middleTime.subtract(range, 'h')

            for (let i=0; i<2*range*60/interval; i++) {
                // make sure the user can't select negative time intervals.
                if (endOption.isAfter(selectedStartTime)) { 
                    endTimes.push({
                        sort: i,
                        iso: endOption.format(),
                        hhmm: endOption.format('HH:mm'),
                        moment: endOption
                    })
                }
                // Increment the time for the next loop.
                endOption.add(interval, 'm')
            }
            return endTimes
        },
        // Compute an end string from the start time and duration
        realtime_end_string(){ 
            return moment(this.startStr)
                .add(this.real_time_session_duration, 'm')
                .tz(this.timezone)
                .format()
        },
        eventDuration() {
            let start = moment.tz(this.startStr, this.timezone)
            let end = moment.tz(this.endStr, this.timezone)
            let duration = moment.duration(end.diff(start))
            return `(${duration.hours()}h, ${duration.minutes()}m)`
        },
        modifiedEvent() {
            const end_string = this.reservation_type_tabs == "realtime" ? this.realtime_end_string : this.endStr
            let m_event = {
                id: this.id,
                startStr: this.startStr,
                endStr: end_string,
                title: this.title,
                reservation_type: this.reservation_type_tabs,
                creator: this.creator,
                creator_id: this.creator_id,
                site: this.site,
                resourceId: this.resourceId,
                reservation_note: this.reservation_note,
                project_id: this.project_name_and_created,
            }
            return m_event
        },
        userIsAdmin() {
            try {
                let user = this.$auth.user 
                let roles = user['https://photonranch.org/user_metadata'].roles
                return roles.includes('admin')
            } catch {
                return false
            }
        },
    },
    methods: {
        handleSubmit() {
            let valid_inputs = this.$refs.title_input.checkHtml5Validity()
            if (valid_inputs) {
                this.submitIsLoading = true;
                this.$emit('submit', this.modifiedEvent)
            }
        },
        handleModify() {
            let valid_inputs = this.$refs.title_input.checkHtml5Validity()
            if (valid_inputs) {
                this.modifyIsLoading = true;
                const body = {
                    modifiedEvent: this.modifiedEvent,
                    initialEvent: this.eventDetails,
                }
                this.$emit('modify', body)
            }
        },
        handleDelete() {
            this.deleteIsLoading = true;
            this.$emit('delete', this.modifiedEvent)
        },
    }
}
</script>

<style lang="scss" scoped>
.r-margin {
    margin-right: 1em;
}
.field-group {
    padding-right: 2em;
    padding-bottom: 1em;
}
.login-warning {
    color: #f1b70e;
}
</style>