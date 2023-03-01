<template>
  <json-viewer
    :value="displayed_config"
    theme="jv-dark"
    expanded
    sort
  />
</template>

<script>

export default {
  name: 'SiteConfigViewer',
  props: {
    // Specify a site to load when the component loads
    init_site: {
      type: String,
      default: () => 'all'
    }
  },
  data () {
    return {
      loading: false,
      selected_site: this.init_site
    }
  },
  computed: {
    displayed_config () {
      const global_config = this.$store.state.site_config.global_config
      if (this.init_site == 'all') {
        return global_config
      } else if (Object.keys(global_config).includes(this.init_site)) {
        return global_config[this.init_site]
      } else {
        return {}
      }
    }
  }
}
</script>

<style scoped>
.container {
  margin-top: 3em;
}
</style>
<style lang="scss">

.jv-code.open {
    padding-top: 5px !important;
}

// values are default one from jv-light template
.jv-dark {
  //background: #fff;
  white-space: nowrap;
  color: #b8b8b8;
  font-size: 14px;
  font-family: Consolas, Menlo, Courier, monospace;

  .jv-ellipsis {
    color: #444;
    //background-color: #eee;
    display: inline-block;
    line-height: 0.9;
    font-size: 0.9em;
    padding: 0px 4px 2px 4px;
    border-radius: 3px;
    vertical-align: 2px;
    cursor: pointer;
    user-select: none;
  }
  .jv-button { color: #49b3ff }
  //.jv-key { color: #111111 }
  .jv-item {
    //&.jv-array { color: #111111 }
    &.jv-boolean { color: #ff4287 }
    &.jv-function { color: #067bca }
    &.jv-number { color: #fd5593 }
    &.jv-number-float { color: #fc1e70 }
    &.jv-number-integer { color: #fc1e70 }
    //&.jv-object { color: #111111 }
    &.jv-undefined { color: #ec9345 }
    &.jv-string {
      color: #20c078;
      word-break: break-word;
      white-space: normal;
    }
  }
  .jv-code {
    .jv-toggle {
      &:before {
        padding: 0px 2px;
        border-radius: 2px;
      }
      &:hover {
        &:before {
          background: #eee;
        }
      }
    }
  }
}
</style>
