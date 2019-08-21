<template><section>
    <p class="heading">{{device_type}} <span class="tag is-light">{{device_name}}</span> Status: </p> 
    <table>
        <tr v-for="(value,name) in device_status" v-bind:key="name">
        <td class="is-size-7">  {{name}}:  </td><td class="is-size-7">{{value}}</td>
        </tr>
    </table>
</section></template>

<script>
export default {
    name: 'SimpleDeviceStatus',
    props: {
        'device_status': Object,
        'device_type': String,
        'device_name': String,
    },
}
</script>