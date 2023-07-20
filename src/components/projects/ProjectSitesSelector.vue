<template>
  <!-- Multi-select dropdown, choose which sites a project can be scheduled at -->
  <!-- Default selection is current site. Currently, there is no "generic site" option -->
  <b-field>
    <template #label>
      Sites
      <b-tooltip
        type="is-dark"
        position="is-right"
        label="Choose where the project can run. This affects the available imaging filters."
      >
        <b-icon
          size="is-small"
          icon="help-circle-outline"
        />
      </b-tooltip>
    </template>

    <div>
      <b-dropdown
        v-model="project_sites"
        class="site-dropdown"
        multiple
        scrollable
      >
        <template #trigger>
          <b-button
            class="button"
            icon-right="menu-down"
          >
            <span
              v-for="(site, index) in project_sites"
              :key="site"
            >
              <span>{{ index > 0 ? ', ' : '' }}</span> <span>{{ site }}</span>
            </span>
          </b-button>
        </template>

        <div class="separator">
          <div class="line" />
          <p>ANY SITE</p>
          <div class="line" />
        </div>

        <b-dropdown-item
          key="common pool"
          class="item"
          value="common pool"
        >
          common pool
        </b-dropdown-item>

        <div class="separator">
          <div class="line" />
          <p>THIS SITE</p>
          <div class="line" />
        </div>

        <b-dropdown-item
          :key="obsId"
          class="item"
          :value="obsId"
        >
          {{ obsId }}
        </b-dropdown-item>

        <div class="separator">
          <div class="line" />
          <p>OTHER SITES</p>
          <div class="line" />
        </div>

        <b-dropdown-item
          v-for="site_real in available_sites_real.filter(site => site != obsId)"
          :key="site_real"
          class="item"
          :value="site_real"
          disabled
        >
          {{ site_real }}
        </b-dropdown-item>

        <div class="separator">
          <div class="line" />
          <p>SIMULATED SITES</p>
          <div class="line" />
        </div>

        <b-dropdown-item
          v-for="site_sim in available_sites_simulated.filter(site => site != obsId)"
          :key="site_sim"
          class="item"
          :value="site_sim"
          disabled
        >
          {{ site_sim }}
        </b-dropdown-item>
      </b-dropdown>
    </div>
  </b-field>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  props: {
    obsId: String
  },
  computed: {
    project_sites: {
      get () { return this.$store.state.project_params.project_sites },
      set (val) { this.$store.commit('project_params/project_sites', val) }
    },
    ...mapGetters('site_config', [
      'available_sites_real',
      'available_sites_simulated'
    ])
  }

}
</script>

<style lang="scss" scoped>
@import "@/style/buefy-styles.scss";

.site-dropdown {
    background-color: $body-background-color;
}
.site-dropdown .button {
    display: inline-block;
    background-color: $body-background-color;
}
.site-dropdown .item {
    font-size: 12px;
    background-color: $body-background-color;
}
.separator {
    display: flex;
    align-items: center;
    background-color: $body-background-color;
    opacity: 0.8;
}
.separator .line {
    height: 0.5px;
    flex: 1;
    background-color: silver;
    opacity: 0.8;
}
.separator p {
    padding: 0 1rem;
    font-size: 9px;
    color: silver;
}
</style>
