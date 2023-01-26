<template>
  <div>
    <!--{{selectedShapeType}}
    {{subframeFromShape}}-->
    <b-field grouped>
        <b-field>
        <b-button 
            :disabled="selectedShape=='none'" 
            @click="click_inspect('inspect1')" >
            inspect 1
        </b-button>
        </b-field>
        <b-field>
        <b-button 
            :disabled="selectedShape=='none'" 
            @click="click_inspect('inspect2')" >
            inspect 2
        </b-button>
        </b-field>
    </b-field>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { commands_mixin } from '../../mixins/commands_mixin'
export default {
  name: 'Inspect',
  mixins: [commands_mixin],
  data () {
    return {
        inspection_type: 'test'
      
    }
  },
  methods: {
    inspect_command() {
      return this.base_command(
        'sequencer',
        'inspect',
        '',
        {
          subframe: this.subframeFromShape,
          shape: this.selectedShapeType,
          filename: this.subframeDefinedWithFile,
          inspection_type: this.inspection_type
          
        }
      )
    },

    click_inspect(type) {
      this.inspection_type = type;
      this.postCommand(this.inspect_command)

    },
  },
  computed: {

    ...mapGetters('images', [
      'recent_images',
      'current_image'
    ]),

    ...mapState('drawshapes', [
      'shapes',
      'lines',
      'rects',
      'circles',
      'points',
      'starmarkers'
    ]),


    // ID of the shape that is currently selected
    selectedShapeType: {
      get () { return this.$store.getters['drawshapes/selectedShapeType'] },
      set (val) { this.$store.commit('drawshapes/selectedShapeType', val) }
    },

    subframeFromShape: {
      get () { return this.$store.getters['drawshapes/subframeFromShape'] },
      set (val) { this.$store.commit('drawshapes/subframeFromShape', val) }
    },

    selectedShape: {
      get () { return this.$store.getters['drawshapes/selectedShape'] },
      set (val) { this.$store.commit('drawshapes/selectedShape', val) }
    },

    subframeDefinedWithFile: {
      get () { return this.$store.getters['command_params/subframeDefinedWithFile'] },
      set (val) { this.$store.commit('command_params/subframeDefinedWithFile', val) }
    },
  }
}
</script>