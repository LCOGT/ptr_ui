<template>
  <div
    ref="tabs_container"
    class="tabs__dark"
    :style="css_props"
  >
    <ul class="tabs__header">
      <li
        v-for="(tab, index) in tabs"
        :key="tab.title"
        ref="tab_labels"
        :class="[{&quot;tab__selected&quot;: (index == selectedIndex)}, instance_class] "
        @click="select_tab(index)"
      >
        {{ tab.title }}
      </li>
    </ul>
    <slot />
  </div>
</template>

<script>
function uuidv4 () {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}
export default {
  data () {
    const unique_class = uuidv4()
    return {
      selectedIndex: 0, // the index of the selected tab,
      tabs: [], // all of the tabs
      instance_class: unique_class // since refs don't play nice with $children, make component-specific class
    }
  },
  props: {
    tab_index: {
      type: Number,
      default: 0
    }
  },
  created () {
    // this.instance_class = uuidv4

    this.tabs = this.$children
  },
  mounted () {
    // this.set_lengths()
    this.select_tab(this.tab_index)
  },
  methods: {
    select_tab (clicked_tab_index) {
      // provide parent component with selected tab index
      this.$emit('selected-index', clicked_tab_index)

      this.selectedIndex = clicked_tab_index

      // loop over all the tabs
      this.tabs.forEach((tab, index) => {
        tab.manualIsActive = (index === clicked_tab_index)
      })
    },

    set_lengths () {
      const choices = document.getElementsByClassName(this.instance_class)
      let max_width = 50
      for (let i = 0; i < choices.length; ++i) {
        max_width = Math.max(max_width, choices[i].offsetWidth)
      }
      return max_width
    }
  },
  watch: {

    tab_index () {
      this.select_tab(this.tab_index)
    },
    tabs () {
      this.set_lengths()
    }
  },
  computed: {
    max_tab_width () {
      const choices = document.getElementsByClassName(this.instance_class)
      let max_width = 50
      for (let i = 0; i < choices.length; ++i) {
        max_width = Math.max(max_width, choices[i].offsetWidth)
      }
      return max_width
    },

    css_props () {
      return {
        '--number-of-tabs': this.tabs.length,
        // '--max-tab-width-px': this.set_lengths() + 'px'
        '--max-tab-width-px': this.max_tab_width + 'px'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/style/buefy-styles.scss";
@import "@/style/_responsive.scss";

.testgrid{
    display: grid;
    //flex-wrap: wrap;
    //grid-auto-columns: 1fr;
    grid-template-columns: repeat(auto-fill, minmax(var(--max-tab-width-px),1fr));

}
.testitem {
    //grid-row: 1;
    //display: table-cell;
    border: 1px solid white;
    //width: max-content;
    //flex-grow: 0;
    //flex-basis: max-content;
}

.tabs__dark {
  background-color: $grey-darker;
  width: 100%;
}

ul.tabs__header {
  background-color: $body-background-color;
  display: flex;
  flex-wrap: wrap;
  color: $grey-lighter;
  //margin-bottom: 1em;
}

ul.tabs__header > li {
    display: inline-block;
    cursor: pointer;
    padding: 5px 8px;
    border-right: 1px solid lighten($grey-dark, 4);
    background-color: $body-background-color;
    border-top: 3px solid transparent;
    flex-grow: 1;
}

/*
ul.tabs__header {
  background-color: $body-background-color;
  display:grid;
  //grid-template-columns: repeat(var(--number-of-tabs), auto);
  //grid-template-columns: repeat(auto-fill, minmax(min-content, auto));
    grid-template-columns: repeat(auto-fill, minmax(var(--max-tab-width-px),1fr));
  color: $grey-lighter;
  //margin-bottom: 1em;
}

ul.tabs__header > li {
    border: 1px solid white;
    //width: max-content;

    display: inline-block;
    cursor: pointer;
    width: max-content;
    padding: 5px 8px;
    border-right: 1px solid lighten($grey-dark, 4);
    background-color: $body-background-color;
    border-top: 3px solid transparent;
}
*/

ul.tabs__header > li.tab__selected {
    border-top: 3px solid silver;
    background-color: $grey-darker;
    font-weight: bold;
}

.tab {
    display: inline-block;
    height: max-content;
}
</style>
