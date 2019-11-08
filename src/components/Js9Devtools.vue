<template>
    <div>
        <b-collapse class="card" :open="true">
            <div
            slot="trigger" 
            slot-scope="props"
            class="card-header"
            role="button" >
                <p class="card-header-title"> JS9 Devtools </p>
                <a class="card-header-icon">
                    <b-icon :icon="props.open ? 'menu-down' : 'menu-up'"/>
                </a>
            </div>
            <div class="content">
                <div class="button" @click="JS9.RunAnalysis('macros')">Show Macros</div>
            </div>
        </b-collapse>
    </div>
</template>

<script>

export default {
  name: "Js9Devtools",
  components: {
  },
  data() {
      return {
          JS9: JS9, // grab the global variable for use in our component
      }
  },

  methods: {
      js9Task(task){JS9.RunAnalysis("macros")},
  }
};
</script>

<style scoped>
.content {
    padding: 1.25em;
}
</style>
