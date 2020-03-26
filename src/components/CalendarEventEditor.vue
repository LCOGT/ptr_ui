<template><section>
    <b-field horizontal >
        <p class="is-family-secondary is-size-2 has-text-weight-bold">Make a Reservation</p>
    </b-field>
    <b-field horizontal label="Owner">
        <p class="is-family-primary">{{eventDetails.creator}}</p>
    </b-field>

    <b-field horizontal label="Observatory">
        <p class="is-family-primary">{{eventDetails.resourceId}}</p>
    </b-field>
    
    <b-field horizontal label="Event Name">
        <b-input :default="eventDetails.title" v-model="title">{{title}}</b-input>
    </b-field>

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

export default {
    name: 'CalendarEventEditor',
    props: [
        'eventDetails', 
        'isNewEvent',
    ],
    data() {
        return {

            submitIsLoading: false,
            modifyIsLoading: false,
            deleteIsLoading: false,

            id: this.eventDetails.id,
            startStr: moment(this.eventDetails.startStr).format(),
            endStr: moment(this.eventDetails.endStr).format(),
            title: this.eventDetails.title,
            creator: this.eventDetails.creator,
            creator_id: this.eventDetails.creator_id,
            site: this.eventDetails.site,
            resourceId: this.eventDetails.resourceId,

        }
    },
    computed: {
        nightOf() {
            return moment(this.eventDetails.startStr).format('dddd, MMMM D, YYYY')
        },
        startTimeOptions() {
            let startTimes = [] 
            const selectedEndTime = moment(this.endStr)
            const interval = 5 // 5 minutes
            const range = 2 // hours

            // The value in the middle of our array
            let middleTime = moment(this.eventDetails.startStr)
            // The first time in the array. 
            let startOption = middleTime.subtract(range, 'h')

            for (let i=0; i<2*range*60/interval; i++) {
                // make sure the user can't select negative time intervals.
                if (startOption.isBefore(selectedEndTime)) {
                    startTimes.push({
                        sort: i,
                        iso:startOption.format(),
                        hhmm:startOption.format('HH:mm')
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
            let middleTime = moment(this.eventDetails.endStr)
            // The first time in the array. 
            let endOption = middleTime.subtract(range, 'h')

            for (let i=0; i<2*range*60/interval; i++) {
                // make sure the user can't select negative time intervals.
                if (endOption.isAfter(selectedStartTime)) { 
                    endTimes.push({
                        sort: i,
                        iso: endOption.format(),
                        hhmm: endOption.format('HH:mm')
                    })
                }
                // Increment the time for the next loop.
                endOption.add(interval, 'm')
            }
            return endTimes
        },
        eventDuration() {
            let start = moment(this.startStr)
            let end = moment(this.endStr)
            let duration = moment.duration(end.diff(start))
            return `(${duration.hours()}h, ${duration.minutes()}m)`
        },
        modifiedEvent() {
            return {
                id: this.id,
                startStr: this.startStr,
                endStr: this.endStr,
                title: this.title,
                creator: this.creator,
                creator_id: this.creator_id,
                site: this.site,
                resourceId: this.resourceId,
            }
        }
    },
    methods: {
        handleSubmit() {
            this.submitIsLoading = true;
            this.$emit('submit', this.modifiedEvent)
        },
        handleModify() {
            this.modifyIsLoading = true;
            const body = {
                modifiedEvent: this.modifiedEvent,
                initialEvent: this.eventDetails,
            }
            this.$emit('modify', body)
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