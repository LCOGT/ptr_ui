<template><div>

    <div class="level is-mobile">
        <div 
            class="level-item week-day"
            v-for="(date, index) in week"
            v-bind:key="index"
            v-bind:class="{'selected':selected_day==index}"
            @click="setSelectedDay(index)"
            > 
            {{ getDayStringShort(date.getDay()) }} 
            {{ date.getDate() }} 
            
        </div>
    </div>

    <div class="day-events">
        events 
    </div>



</div></template>


<script>

export default {
    name: "WeekOfEvents",
    props: ["sitecode"],
    components: { },
    data() {
        return {
            week: [],
            selected_day: '',

        }

    },
    beforeMount() {

        // Add one day to a js date object
        function addDays(date, days) {
            var result = new Date(date);
            result.setDate(result.getDate() + days);
            return result;
        }

        // Populate the array of the next seven days
        let today = new Date();
        for (let i=0; i<7; i++) {
            let another_day = addDays(today, i) 
            this.week.push(another_day)
        }

        // Initially, first day should be selected.
        this.selected_day = week[0]


    },
    methods: {

        getDayStringShort(intDay) {
            let days_of_the_week = [
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
            ]
            return days_of_the_week[intDay].slice(0,3)
        },

        setSelectedDay(day_index) {
            this.selected_day = day_index;
        },

    }

    
}

</script>

<style lang="scss" scoped>
@import "../style/_variables.scss";
.week-day {
    font-variant: small-caps; 
    border-radius: $radius-small;
    background-color: $primary;
    height: 80px;
}
.week-day:hover {
    background-color: darken($primary, 5);
}
.week-day.selected {
    background-color: darken($primary, 5);
}
.day-events {
    border-radius: $radius-small;
    background-color: $grey-darker;
    height: 200px;
}
</style>