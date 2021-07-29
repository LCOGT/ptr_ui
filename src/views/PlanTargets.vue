<template>
<section class="the-page">
  <div class="the-form">
    <form id="targform" @submit.prevent>
        <b-field label="Photon Ranch Location" class= "control is-expanded">
          <b-select id="localtime" v-model="user.localtime" @input="setLatLong">
            <option v-for="s in site_info"
            :key="s.name"
            :lat="s.latitude"
            :lon="s.longitude"
            :value="s.siteoffset"
            >{{s.name}}</option>
            <option lat="" lon="" value="X">Custom Latitude and Longitude</option>
          </b-select>
        </b-field>
        <div class="field has-addons">
          <p class="control is-expanded">
            <b-field label="Latitude">
              <b-input type="text" id="lat1" v-model="user.lat1" required :disabled="user.localtime!='X'"/>
            </b-field>
          </p>
          <p class="control is-expanded">
            <b-field label="Longitude">
              <b-input type="text" id="lon1" v-model="user.lon1" required :disabled="user.localtime!='X'"/>
            </b-field>
          </p>
        </div>
        <div class="field has-addons">
          <p class="control">
            <b-field label="Date/Time">
              <b-datetimepicker 
                id="dateobs" 
                v-model="user.dateobs"
                :timepicker="{ incrementMinutes:30 }"
                required 
                inline />
            </b-field>
          </p>
        </div>
      <b-field grouped>
        <div v-if="user.localtime !== 'X'">
          <b-radio name="tzinfo" id="tzinfo" native-value="my" v-model="user.tzinfo" required>My timezone</b-radio>
          <b-radio name="tzinfo" id="tzinfo" native-value="utc" v-model="user.tzinfo" required> UTC</b-radio>
          <b-radio name="tzinfo" id="tzinfo" native-value="lcl" v-model="user.tzinfo">Local timezone</b-radio>
        </div>
        <div v-else>
          <b-radio name="tzinfo" id="tzinfo" native-value="my" v-model="user.tzinfo" required>My timezone</b-radio>
          <b-radio name="tzinfo" id="tzinfo" native-value="utc" v-model="user.tzinfo" required> UTC</b-radio>
        </div>
      </b-field>
        <div class="the-button">
          <b-field class="buttons">
            <b-button @click="submitForm" type="submit">Find Easy Targets</b-button>
          </b-field>
        </div>
    </form>
  </div>
  <pre> {{ $data.user }} </pre>
  <pre> {{ site_info.mrc.name }} </pre>
  <div class="results" id="results">
    <div class="target-columns">
      <div v-for="target in targlist" :target="target" :key="target.name">
        <TargetCard :target="target" />
      </div>
    </div>
  </div>
</section>
</template>

<script>
import Vue from 'vue';
import axios from 'axios';
import moment from 'moment';
import TargetCard from '@/components/TargetCard.vue';
import list from '../../public/data/easytargets.json';
import helpers from '@/utils/helpers';

export default {
  name: 'PlanTargets',
  components: {
    TargetCard,
  },
  data() {
    return {
      site_info: {},
      easylist: list,
      target: {},
      targlist: '',
      user: {
        lat1: '',
        lon1: '',
        dateobs: '',
        tzinfo: 'my',
        offset: '',
        localtime: '',
        localoffset: '',
      },
    };
  },
  created: function() {
    const url = "https://api.photonranch.org/api/all/config"
    axios.get(url).then(response => {
      for (let site in response.data) {
        Vue.set(this.site_info, site, {
          latitude: response.data[site].latitude,
          longitude: response.data[site].longitude,
          name: response.data[site].name,
          siteoffset: response.data[site].TZ_database_name
        })
      }
      Vue.set(this.user, 'localtime', this.site_info.mrc.siteoffset)
      Vue.set(this.user, 'lat1', this.site_info.mrc.latitude)
      Vue.set(this.user, 'lon1', this.site_info.mrc.longitude)
      console.log(error)
    })
    .catch(error => {
      console.log(error)
    })
  },
  methods: {
    setLatLong() {
      const selectedOption = document.getElementById('localtime').options[document.getElementById('localtime').selectedIndex];
      this.user.lat1 = selectedOption.getAttribute('lat');
      this.user.lon1 = selectedOption.getAttribute('lon');
    },
    submitForm() {
      this.user.offset = new Date(this.user.dateobs).getTimezoneOffset();
      this.user.localoffset = moment.utc(this.user.dateobs).tz(this.user.localtime).utcOffset()

      var diclist = [];

      if (this.user.tzinfo == 'my') {
        var starttime=this.user.dateobs
      } else if (this.user.tzinfo == 'utc') {
        var starttime=moment(this.user.dateobs).subtract(this.user.offset, 'm').toDate()
      } else if (this.user.tzinfo == 'lcl') {
        var starttime=moment(this.user.dateobs).subtract(this.user.offset+this.user.localoffset, 'm').toDate()
      }

      var endtime = moment(starttime).add(30, 'm').toDate();
      for (var i = 0; i < this.easylist.length; ++i) {
        var altstart = helpers.eq2altazWithDate(this.easylist[i].ra, this.easylist[i].dec, this.user.lat1, this.user.lon1, starttime)[0]
        var altend = helpers.eq2altazWithDate(this.easylist[i].ra, this.easylist[i].dec, this.user.lat1, this.user.lon1, endtime)[0]
        if (altstart>35 && altend>35) {
          diclist.push({
            "name": this.easylist[i].name, 
            "type": this.easylist[i].group, 
            "image": "/targs/DefaultTargetImages/"+this.easylist[i].name.replace(/ /g, "")+".jpg",
            "ra": this.easylist[i].ra,
            "dec": this.easylist[i].dec,
            "starttime": starttime,
            "altstart": altstart,
            "altend": altend
            })
        }
      }
      console.log(diclist)
      this.targlist=diclist;

      if (window.screen.availWidth<970) {
        setTimeout(function(){ document.getElementById("results").scrollIntoView({behavior: 'smooth'}); }, 30);}
    },
  },
};
</script>

<style lang="css" scoped>
  .target-columns {
    display: flex;
    flex-wrap: wrap;
    justify-content:center;
  }
  .the-form {
    max-width: 326px;
    margin-left: 8%;
    margin-bottom: 4%;
  }
  .the-page{
    margin-top:2%;
    display:flex;
  }
  .the-button{
    display:flex;
    justify-content:center;
  }

  @media(max-width:970px){
    .the-form {
    max-width: 326px;
    margin-left: 0px;
    }
    .the-page{
      flex-direction:column;
      align-items:center;
    }
    .results{
      justify-content:center;
      align-items:center;
    }
  }

</style>
