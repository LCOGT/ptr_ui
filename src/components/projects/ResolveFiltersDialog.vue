<template>
  <div>
    <div
      class="filter-substitution-row"
    >
      <div class="exposure-rows">
        {{ exposures_index }}
        <div
          v-for="n in 1"
          :key="n"
          class="exposure-row"
        >
          <b-field
            :label="n==1 ? '  ' : ' '"
          >
            <b-checkbox v-model="exposures[n-1].active" />
          </b-field>
          <b-field
            size="is-small"
            :label="n==1 ? 'Imtype' : ''"
          >
            <b-select
              v-model="exposures[n-1].imtype"
              size="is-small"
              :disabled="!exposures[n-1].active"
            >
              <option value="light">
                light
              </option>
              <option value="dark">
                dark
              </option>
              <option value="skyflat">
                skyflat
              </option>
              <option value="screenflat">
                screenflat
              </option>
              <option value="bias">
                bias
              </option>
              <option value="autofocus">
                autofocus
              </option>
            </b-select>
          </b-field>
          <b-field
            :label="n==1 ? 'Count' : ''"
            style="width: 80px;"
          >
            <b-input
              v-model="exposures[n-1].count"
              size="is-small"
              :disabled="!exposures[n-1].active"
              type="number"
              min="1"
              max="100000"
            />
          </b-field>
          <b-field
            :label="n==1 ? 'Exp [s]' : ''"
            style="max-width: 80px;"
          >
            <b-input
              v-model="exposures[n-1].exposure"
              size="is-small"
              :disabled="!exposures[n-1].active"
              type="number"
              min="0"
              max="100000"
            />
          </b-field>
          <b-field
            :label="n==1 ? 'Filter' : ''"
          >
            <b-select
              v-model="exposures[n-1].filter"
              size="is-small"
              :disabled="!exposures[n-1].active"
              style="width: 80px;"
            >
              <option
                v-if="availableSiteFilters && availableSiteFilters.length>0"
                disabled
                value="------"
              >
                ---- Site Filters ----
              </option>
              <option
                v-for="filter in availableSiteFilters"
                :key="filter"
                :value="filter"
              >
                {{ filter }}
              </option>
              <option
                disabled
                value="------"
              >
                ---- Generic Filters ----
              </option>
              <option
                v-for="filter in availableGenericFilters"
                :key="filter"
                :value="filter"
              >
                {{ filter }}
              </option>
            </b-select>
          </b-field>
          <b-field
            :label="n==1 ? 'Resolution' : ''"
          >
            <b-select
              v-model="exposures[n-1].bin"
              size="is-small"
              :disabled="!exposures[n-1].active"
            >
              <option value="optimal">
                Optimal
              </option>
              <option value="coarse">
                Coarse
              </option>
              <option value="fine">
                Fine
              </option>
            </b-select>
          </b-field>
          <b-field
            :label="n==1 ? 'Area' : ''"
          >
            <b-select
              v-model="exposures[n-1].area"
              size="is-small"
              disabled
            >
            </b-select>
          </b-field>
          <div />
        </div>
        <div />
      </div>

      <!-- Problem filter -->
      <b-field>
        <b-select>
          <option>
            old filter
          </option>
          <b-select />
        </b-select>
      </b-field>
    </div>

    <button>Discard changes and clear form</button>
    <button>Go back to previous site</button>
    <button>Apply filter substitutions</button>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
const mapStateToComputed = (vuexModule, propertyNames) => {
  return propertyNames.reduce((acc, propertyName) => {
    return {
      ...acc,
      [propertyName]: {
        get () { return this.$store.state[vuexModule][propertyName] },
        set (val) { this.$store.commit(`${vuexModule}/${propertyName}`, val) }
      }
    }
  }, {})
}

export default {
  name: 'ResolveFiltersDialog',
  props: {
    filterMismatchIndices: {
      type: Array,
      requried: true
    },
    availableSiteFilters: {
      type: Array,
      required: true
    },
    availableGenericFilters: {
      type: Array,
      required: true
    },

  },
  data () {
    return {
      // Copy the project exposures so we can update them on the fly without losing the 'before' state
      //incomingProjectExposures: []
    }
  },
  created () {
    //this.incomingProjectExposures = JSON.parse(JSON.stringify(this.exposures))
  },
  watch: {
    //projectExposures () {
      //this.incomingProjectExposures = JSON.parse(JSON.stringify(this.exposures))
    //}
  },

  computed: {
    // This provides the getter/setter pattern for each item
    // e.g.
    // proejct_name: {
    //   get() { return this.$store.state.project_params.project_name },
    //   set(val) { return this.$store.commit['project_params/project_name', val]}
    // }
    ...mapStateToComputed('project_params', [
      //'exposures_index',
      'exposures'
    ]),
    exposures_index: {
      get () { return this.$store.state.project_params.exposures_index },
      set (val) { return this.$store.commit['project_params/project_name', val]}
    },
    ...mapGetters('project_params', ['project_constraints', 'projectToSend']),

  }
}
