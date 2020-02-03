<template><section>
              <b-field horizontal label="Owner">
                  <p class="is-family-primary">{{activeEvent.creator}}</p>
              </b-field>
              
              <b-field horizontal label="Event Name">
                  <b-input :default="activeEvent.title" v-model="activeEvent.title"></b-input>
              </b-field>

              <b-field horizontal label="Start Time">
                  <b-input v-model="activeEvent.startStr"></b-input>
              </b-field>

              <b-field horizontal label="End Time">
                  <b-input name="subject" v-model="activeEvent.endStr" autocomplete="off"></b-input>
              </b-field>

              <b-field horizontal>
                <b-field>

                <button 
                class="button is-info" 
                :disabled="!$auth.isAuthenticated"
                @click="$emit('submit', activeEvent)" 
                style="margin-right: 1em; background-color: #55f;">
                submit
                </button>

                <button 
                class="button is-grey" 
                @click="$emit('cancel')">
                cancel
                </button>

                <div style="width: 1em;" />

                <button 
                class="button is-danger" 
                :disabled="!$auth.isAuthenticated"
                @click="$emit('delete', activeEvent)">
                delete event
                </button>

                </b-field>
              </b-field>
</section></template>

<script>
export default {
    name: 'CalendarEventCreator',
    props: ['activeEvent', 'isNewEvent'],
    methods: {
        submitButtonClicked() {
            this.$emit('clicked', 'submit')
        },
    },
}
</script>

<style lang="scss" scoped>
.field-group {
    padding-right: 2em;
    padding-bottom: 1em;
}
</style>