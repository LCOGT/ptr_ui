<template>
  <section>
    <div class="status-heading">
      <p>{{ device_type }} Status: </p>
      <b-tag type="is-light">
        {{ device_name }}
      </b-tag>
    </div>
    <table>
      <tr
        v-for="(value,name) in device_status"
        :key="name"
      >
        <td>  {{ name }}:  </td>
        <td
          v-if="typeof value == 'boolean'"
          style="text-transform: capitalize;"
        >
          {{ value }}
        </td>
        <td v-else>
          {{ value }}
        </td>
      </tr>
    </table>
  </section>
</template>

<script>
export default {
  name: 'SimpleDeviceStatus',
  props: {
    device_status: Object,
    device_type: String,
    device_name: String
  }
}
</script>

<style scoped>
.tag {
    font-size: .85em;
}
.status-heading {
    display:flex;
}
</style>
