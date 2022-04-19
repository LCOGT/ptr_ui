<template>
  <div class="tabs__dark" :style="css_props" ref="tabs_container">
    <ul class="tabs__header">
      <li
        v-for="(tab, index) in tabs"
        :key="tab.title"
        @click="select_tab(index)"
        :class='[{"tab__selected": (index == selectedIndex)}, instance_class] '
        ref="tab_labels"
      >
        {{ tab.title }}
      </li>
    </ul>
    <!--div class="testgrid">
        <div class="testitem">one</div>
        <div class="testitem">two</div>
        <div class="testitem">a long word</div>
        <div class="testitem">four</div>
        <div class="testitem">five</div>
        <div class="testitem">six</div>
        <div class="testitem">seven</div>
    </div-->
    <slot></slot>
  </div>
</template>

<script>
    function uuidv4() {
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }
  export default {
    data () {
        let unique_class = uuidv4()
      return {
            selectedIndex: 0, // the index of the selected tab,
            tabs: [],         // all of the tabs
            instance_class: unique_class, // since refs don't play nice with $children, make component-specific class
      }
    },
    created () {
        //this.instance_class = uuidv4

      this.tabs = this.$children
    },
    mounted () {
      //this.set_lengths()
      this.select_tab(0)
    },
    methods: {
      select_tab (i) {
        this.selectedIndex = i

        // loop over all the tabs
        this.tabs.forEach((tab, index) => {
          tab.isActive = (index === i)
        })
      },

        set_lengths() {
            let choices = document.getElementsByClassName(this.instance_class)
            //let choices = document.getElementsByClassName('testitem')
            //let choices = this.$refs.tab_labels
            let max_width = 50;
            console.log( 'labels: ', choices)
            console.log('length: ', choices.length)
            //console.log(this.$refs.tabs_container)
            //for (let i = 0; i < choices.length; ++i) {
                //choices[i].style.width = "max-content"
            //}
            for (let i = 0; i < choices.length; ++i) {
                max_width = Math.max(max_width, choices[i].offsetWidth)
                console.log(choices[i].offsetWidth)
                console.log(max_width)
            }
            console.log(max_width)
            return max_width
        }
    },
    watch: {
        tabs() {
            this.set_lengths()
        }
    },
    computed: {
        max_tab_width() {
            
            let choices = document.getElementsByClassName(this.instance_class)
            //let choices = document.getElementsByClassName('testitem')
            //let choices = this.$refs.tab_labels
            let max_width = 50;
            console.log( 'labels: ', choices)
            //console.log(this.$refs.tabs_container)
            //for (let i = 0; i < choices.length; ++i) {
                //choices[i].style.width = "max-content"
            //}
            for (let i = 0; i < choices.length; ++i) {
                max_width = Math.max(max_width, choices[i].offsetWidth)
                console.log(choices[i].offsetWidth)
                console.log(max_width)
            }
            console.log(max_width)
            return max_width
        },


        css_props() {
            return {
                '--number-of-tabs': this.tabs.length,
                //'--max-tab-width-px': this.set_lengths() + 'px'
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
