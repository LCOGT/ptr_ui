<template>
  <div class="site-preview-wrapper">
    <div style="display: flex; gap: 1em">
      <router-link
        tag="button"
        title="view this site"
        class="button"
        :to="{ path: '/site/' + site + '/' + active_subpage }"
        @click.native="$emit('view-site-clicked')"
        >view observatory</router-link
      >
      <b-button
        @click="open_control_room(site)"
        class="is-success is-outlined"
        icon-right="launch"
        title="enter control room"
      >
        enter control room &nbsp;</b-button
      >
    </div>
    <div class="latest-site-image">
      <img class="the-image" :src="image_url" title="latest-site-image" />
    </div>
    <div class="status-row">
      <div style="display: flex; flex-direction: column">
        <div class="detailed-status-label">Weather Status:</div>
        <div class="detailed-status-wrapper" :title="`weather is ${weather}`">
          <div class="status-dot" :class="status_color_class(weather)"></div>
          <p class="status-text" :class="status_color_class(weather)">
            {{ weather }}
          </p>
        </div>
      </div>
      <div style="display: flex; flex-direction: column">
        <div class="detailed-status-label">Site Operation:</div>
        <div
          class="detailed-status-wrapper"
          :title="`site operation status: ${operation}`"
        >
          <div class="status-dot" :class="status_color_class(operation)"></div>
          <p class="status-text" :class="status_color_class(operation)">
            {{ operation }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    site: String,
    image_url: String,
    weather: String,
    operation: String,
  },
  computed: {
    active_subpage: {
      get() { return this.$store.state.user_interface.selected_subpage },
      set(value) { this.$store.commit('user_interface/setActiveSubpage', value) }
    },
  },

  methods: {
    open_control_room(site) {
      let url = `https://rooms.remotehq.com/photon-ranch/control-room-${site}`;
      window.open(url);
    },
    status_color_class(status) {
      const color_dict = {
        operational: "is-green",
        ok: "is-green",
        "technical difficulty": "is-yellow",
        offline: "is-grey",
      };
      return color_dict?.[status] ?? "is-grey";
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/style/_variables.scss";
.site-preview-wrapper {
  display: flex;
  flex-direction: column;
}
.site-name {
  grid-area: name;
  font-size: 20px;
  text-transform: uppercase;
  font-weight: bold;
}
.latest-site-image {
  flex-grow: 1;
  display: block;
  width: 100%;
  padding: 1em 0;
}
.the-image {
  display: block;
  max-height: 180px;
  //height: 100%;
  width: 100%;
  object-fit: cover;
}
.status-row {
  display: flex;
  justify-content: space-between;
}
.status-row > * {
  width: 50%;
}

/* For the colored status indicators in the bottom row: */
.is-green {
  background-color: $ptr-green;
  color: $ptr-green;
}
.is-yellow {
  background-color: $ptr-yellow;
  color: $ptr-yellow;
}
.is-red {
  background-color: $ptr-red;
  color: $ptr-red;
}
.is-grey {
  background-color: $ptr-grey;
  color: $ptr-grey;
}

.detailed-status-wrapper {
  display: flex;
  align-items: center;
}
.detailed-status-label {
}
.status-text {
  font-weight: bold;
  background-color: unset;
}
.status-dot {
  /* Center the content */
  align-items: center;
  display: flex;
  justify-content: center;
  margin-right: 10px;

  /* Rounded border */
  border-radius: 9999px;
  height: 12px;
  width: 12px;
}
</style>
