<template><div>

    <the-calendar :calendarSite="sitecode" :fc_resources="listOfObservatories"/>

</div></template>


<script>
import TheCalendar from '@/components/TheCalendar';

export default {
    name: "SiteCalendar",
    props: ["sitecode"],
    components: { 
        TheCalendar,
    },
    data() {
        return {

            // Calendar Resources (Observatories) to feed into the calendar component
            listOfObservatories: [
                {
                    'id': 'wmd',
                    'title': 'West Mountain Drive',
                    'eventColor': '#7d12ff',
                    //'eventBackgroundColor': '#ab20fd',
                    'eventBorderColor': '#200589',
                    'eventTextColor': '#fbf8fd',
                    'eventClassNames': '',
                    'eventOverlap': false, // defines whether events are allowed to overlap
                    'eventConstraint': '',
                    'eventAllow': '',
                    'businessHours': '',
                    'children': '',
                    'parentId': '',
                    'anyOtherPropsHere': 'call from key extendedProps of this resource object',
                },
                {
                    'id': 'saf',
                    'title': 'Apache Ridge Observatory',
                    'eventColor': '#25662d',
                    //'eventBackgroundColor': '#ab20fd',
                    'eventBorderColor': '#25662d',
                    'eventTextColor': '#fbf8fd',
                    'eventClassNames': '',
                    'eventOverlap': false, // defines whether events are allowed to overlap
                    'eventConstraint': '',
                    'eventAllow': '',
                    'businessHours': '',
                    'children': '',
                    'parentId': '',
                    'anyOtherPropsHere': 'call from key extendedProps of this resource object',
                },
                {
                    'id': 'other',
                    'title': 'Another Observatory',
                    'eventColor': '#f6903d',
                    'eventBackgroundColor': '#f6903d',
                    'eventBorderColor': '#200589',
                    'eventTextColor': '#fbf8fd',
                    'eventClassNames': '',
                    'eventOverlap': false, // defines whether events are allowed to overlap
                    'eventConstraint': '',
                    'eventAllow': '',
                    'businessHours': '',
                    'children': '',
                    'parentId': '',
                    'anyOtherPropsHere': 'call from key extendedProps of this resource object',
                },
            ],
        }
    }
    
}

</script>


<style scoped>
</style>