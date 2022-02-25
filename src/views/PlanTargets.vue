<template>
<div>
<SiteNavbar />
<section class="the-page">
  <div class="the-form">
    <form id="targform" @submit.prevent>
        <b-field label="Photon Ranch Location" class= "control is-expanded">
          <b-select id="observatorytime" v-model="observatorytime" @input="setLatLong">
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
              <b-input type="text" id="lat1" v-model="lat1" required :disabled="observatorytime!=='X'"/>
            </b-field>
          </p>
          <p class="control is-expanded">
            <b-field label="Longitude">
              <b-input type="text" id="lon1" v-model="lon1" required :disabled="observatorytime!=='X'"/>
            </b-field>
          </p>
        </div>
        <div v-if="observatorytime =='X'" class="field">
          <p class="control is-expanded">
            <b-field label="Observatory UTC Offset (in hours)">
              <b-numberinput v-model="customobservatoryoffset" step=0.01 :controls="false" :required = "tzinfo == 'lcl'"></b-numberinput>
            </b-field>
          </p>
        </div>
        <div class="field has-addons">
          <p class="control">
            <b-field label="Date/Time">
              <b-datetimepicker 
                id="dateobs" 
                v-model="dateobs"
                :timepicker="{ incrementMinutes:15, hourFormat:timeformat}"
                :datetime-parser="(d) => {new Date(d)}"
                required 
                inline 
                @input="changeDate"/>
            </b-field>
          </p>
        </div>
      <div v-if="observatorytime !=='X' || customobservatoryoffset !== ''" class="field">
        <b-field grouped>
          <b-radio name="tzinfo" id="tzinfo" native-value="my" v-model="tzinfo" required @input="changeTimeFormat">My time</b-radio>
          <b-radio name="tzinfo" id="tzinfo" native-value="utc" v-model="tzinfo" required @input="changeTimeFormat"> UTC</b-radio>
          <b-radio name="tzinfo" id="tzinfo" native-value="lcl" v-model="tzinfo" @input="changeTimeFormat">Observatory time</b-radio>
        </b-field>
      </div>
      <div v-else class="field">
        <b-field grouped>
          <b-radio name="tzinfo" id="tzinfo" native-value="my" v-model="tzinfo" required @input="changeTimeFormat">My time</b-radio>
          <b-radio name="tzinfo" id="tzinfo" native-value="utc" v-model="tzinfo" required @input="changeTimeFormat"> UTC</b-radio>
        </b-field>
      </div>
        <div class="the-button">
          <b-field class="buttons">
            <b-button @click="submitForm" type="submit">Find Easy Targets</b-button>
          </b-field>
        </div>
    </form>
  </div>
  <div class="results" id="results">
    <div class="target-columns">
      <div v-for="target in targlist" :target="target" :key="target.name">
        <TargetCard :target="target" />
      </div>
    </div>
  </div>
</section>
</div>
</template>

<script>
import Vue from 'vue';
import axios from 'axios';
import moment from 'moment';
import TargetCard from '@/components/TargetCard';
import SiteNavbar from '@/components/SiteNavbar';
import list from '../../public/data/easytargets.json';
import helpers from '@/utils/helpers';

export default {
  name: 'PlanTargets',
  components: {
    TargetCard,
    SiteNavbar,
  },
  data() {
    return {
      site_info: {},
      easylist: list,
      target: {},
      targlist: '',
      lat1: '',
      lon1: '',
      customobservatoryoffset: new Date().getTimezoneOffset()/-60,
      dateobs: new Date(Math.round(new Date().getTime() / 1800000) * 1800000), //default to nearest half hour
      dateobsreal: new Date(Math.round(new Date().getTime() / 1800000) * 1800000), //default to nearest half hour,
      tzinfo: 'my',
      observatorytime: 'America/Los_Angeles',
      timeformat: undefined,
    };
  },
  computed: {
    offset() {
      return new Date(this.dateobsreal).getTimezoneOffset()
    },
    observatoryoffset() {
      if (this.observatorytime =='X') {
        return this.customobservatoryoffset*60
      } else {
        return moment.utc(this.dateobs).tz(this.observatorytime).utcOffset()
      }
    },
    dateobsutc() {
      return moment(this.dateobsreal).add(this.offset, 'm').toDate()
      //Start time of observation date in "UTC" (ignore timezone info in moment obj)
    },
    dateobsobs() {
      return moment(this.dateobsreal).add(this.offset+this.observatoryoffset, 'm').toDate()
      //Start time of observation date in "observatory time" (ignore timezone info in moment obj)
    },
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
      Vue.set(this, 'observatorytime', this.site_info.mrc.siteoffset)
      Vue.set(this, 'lat1', this.site_info.mrc.latitude)
      Vue.set(this, 'lon1', this.site_info.mrc.longitude)
    })
    .catch(error => {
      console.warn(error)
    })
  },
  methods: {
    setLatLong() {
      const selectedOption = document.getElementById('observatorytime').options[document.getElementById('observatorytime').selectedIndex];
      this.lat1 = selectedOption.getAttribute('lat');
      this.lon1 = selectedOption.getAttribute('lon');

    },
    changeDate() {
      if (this.tzinfo == 'my') {
        this.dateobsreal = this.dateobs
      } else if (this.tzinfo == 'utc') {
        this.dateobsreal = moment(this.dateobs).subtract(this.offset, 'm').toDate()
      } else if (this.tzinfo == 'lcl') {
        this.dateobsreal = moment(this.dateobs).subtract(this.offset+this.observatoryoffset, 'm').toDate()
      }
    },
    changeTimeFormat() {
      if (this.tzinfo == 'my') {
        this.timeformat = undefined; //undefined defaults to user's prefered time display
        this.dateobs = this.dateobsreal
      } else if (this.tzinfo == 'utc') {
        this.timeformat = '24';
        this.dateobs = this.dateobsutc
      } else if (this.tzinfo == 'lcl') {
        this.timeformat = undefined; //undefined defaults to user's prefered time display
        this.dateobs = this.dateobsobs
      }
    },
    submitForm() {
      var diclist = [];

      var endtime = moment(this.dateobsreal).add(30, 'm').toDate();
      for (var i = 0; i < this.easylist.length; ++i) {
        var altstart = helpers.eq2altazWithDate(this.easylist[i].ra, this.easylist[i].dec, this.lat1, this.lon1, this.dateobsreal)[0]
        var altend = helpers.eq2altazWithDate(this.easylist[i].ra, this.easylist[i].dec, this.lat1, this.lon1, endtime)[0]
        if (altstart>45 && altend>45) { //45 degree altitude for targets <1.6 airmass
          diclist.push({
            "name": this.easylist[i].name,
            "nickname": this.easylist[i].alt, 
            "type": this.easylist[i].group, 
            "image": "/targs/DefaultTargetImages/"+this.easylist[i].name.replace(/ /g, "")+".jpg",
            "ra": this.easylist[i].ra,
            "dec": this.easylist[i].dec,
            "starttime": this.dateobsreal,
            "altstart": altstart,
            "altend": altend
            })
        }
      }

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
    padding-top:2%;
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
