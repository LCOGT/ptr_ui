<template>
  <div class="site-projects-wrapper">
    <create-project-form
      class="create-project-form"
      :sitecode="sitecode"
      :project_to_load="project_to_load"
    />
    <div style="height: 50px" />

    <div class="projects-events-tables">
      <user-projects-table 
        class="user-projects-table"
        :user="user" 
        @load_project_form="load_project_form" />

      <div class="user-events-table">
        <h1 class="subtitle">Reservations</h1>
        <user-events-table :user="user" />
      </div>
    </div>

  </div>
</template>

<script>
import UserEventsTable from "@/components/UserEventsTable";
import UserProjectsTable from "@/components/UserProjectsTable";
import CreateProjectForm from "@/components/CreateProjectForm";
import { mapGetters } from "vuex";
import axios from "axios";
import moment from "moment";

export default {
  name: "SiteProjects",
  props: ["sitecode"],
  components: {
    UserEventsTable,
    UserProjectsTable,
    CreateProjectForm,
  },
  data() {
    return {
      localTime: "-",
      siteTime: "-",
      utcTime: "-",

      project_to_load: "",

      // URL for the calendar backend api
      //backendUrl: 'https://m1vw4uqnpd.execute-api.us-east-1.amazonaws.com',
      backendUrl: "https://calendar.photonranch.org",
    };
  },
  created() {
    this.timeInterval = setInterval(this.updateTime, 1000);
    window.moment = moment; // use moment lib in browser devtools
  },
  destroyed() {
    clearInterval(this.timeInterval);
  },
  methods: {
    displayUtcTime(time) {
      return moment(time).utc().format("MMM D, kk:mm");
    },

    updateTime() {
      this.localTime = moment().format("MMM D, kk:mm");
      this.siteTime = moment().tz(this.timezone).format("MMM D, kk:mm");
      this.utcTime = moment().utc().format("MMM D, kk:mm");
    },

    load_project_form(project) {
      this.project_to_load = project;
    },
  },
  computed: {
    ...mapGetters("site_config", [ "timezone" ]),

    user() {
      return this.$auth.user;
    },
  },
};
</script>


<style scoped lang="scss">
@import "@/style/_responsive.scss";

.site-projects-wrapper {
  min-height: calc(100vh - #{$top-bottom-height});
  margin: 2em 5em;

  display: grid;
  grid-gap: 3em;
  grid-template-columns: 1fr;
  grid-template-rows: repeat(3, auto);
  grid-template-areas: 'project' 'tables';

  @include widescreen {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr auto;
    grid-template-areas: 'project' 'tables';
  }
  @include fullhd {
    grid-template-columns: 1fr auto;
    grid-template-rows: 1fr;
    grid-template-areas: 'project tables';
  }
}

.create-project-form {
  grid-area: project;
}
.projects-events-tables {
  grid-area: tables;
  display: flex;
  flex-direction: column;

  @include fullhd {
    margin-top: 4em;
  }
}



.time-display {
  font-size: 1.3em;
}
</style>