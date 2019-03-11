<template>
    <span>
        <div class='information-tabs'>
            <b-tabs v-model="activeTab" size="is-small" type="is-toggle" position="is-centered">

                <b-tab-item>
                    <template slot="header">
                        <span> site </span>
                    </template>
                    <div> 
                        <dome-cam />
                        <div class="button-container">
                            <command-button :data="buttonData.park"></command-button>
                            <div style="width: 10px;"></div>
                            <command-button :data="buttonData.unpark"></command-button>
                        </div>
                    </div>
                </b-tab-item>

                <b-tab-item>
                    <template slot="header">
                        <span class="is-white"> sky chart </span>
                    </template>
                    <div> sky chart </div>
                </b-tab-item>

                <b-tab-item>
                    <template slot="header">
                        <span> weather </span>
                    </template>
                    <div>
                        <table id="weather-table">
                            <td id="wx-col1">
                                <tr><th>amb_temp C</th><td>{{this.temp}}</td></tr>
                                <tr><th>wind k/h</th><td>{{this.wind}}</td></tr>
                            </td>
                            <td id="wx-col2"></td>
                        </table>
                    </div>
                </b-tab-item>

                <b-tab-item>
                    <template slot="header">
                    <span> images </span>
                    </template>
                    <div> images </div>
                </b-tab-item>

            </b-tabs>
        </div>
    </span>
</template>

<script>
import DomeCam from '@/components/DomeCam'
import CommandButton from '@/components/CommandButton'
import { mapGetters } from 'vuex'

export default {
  name: 'InformationTabs',
  components: {
      DomeCam,
      CommandButton
  },
  data () {
    return {
      activeTab: 0,
      buttonData: {
          park: {
              'name': 'Park',
              'url': '/commands/park',
              'form': {'command': 'park'},
          },
          unpark: {
              'name': 'Unpark',
              'url': '/commands/park',
              'form': {'command': 'unpark'},
          },
      }
    }
  },
  computed: {
      ...mapGetters('observatory', {
          wx: 'wx',
          temp: 'amb_temp_C',
          wind: 'wind',

      })
  }
}
</script>

<style scoped>
.information-tabs {
    margin: 2em;
}
.button-container {
    display: flex;
}
#weather-table {
    flex: 1 1 auto;
    margin-top: 20px;
}
#weather-table td {
    height: 30px;
}
#weather-table th {
    width: 150px;
    text-align: right;
    padding-right: 20px;
}

</style>
