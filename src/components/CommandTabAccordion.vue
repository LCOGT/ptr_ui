
<template>
    <div>
      <b-collapse
        class="accordion"
        animation="no animation"
        v-for="(collapse, index) of [
                {
                    title: 'Enclosure',
                    text: 'Text 1'
                },
                {
                    title: 'Screen',
                    text: 'Text 2'
                },
                {
                    title: 'Telescope',
                    text: 'Text 2'
                },
                {
                    title: 'Rotator/Focuser',
                    text: 'Text 2'
                },
                {
                    title: 'Inst. Selector',
                    text: 'Text 2'
                },
                {
                    title: 'Camera',
                    text: 'Text 2'
                },
                {
                    title: 'Sequencer',
                    text: 'Text 2'
                },
                {
                    title: 'Settings',
                    text: 'Text 4'
                }
                ]"
        :key="index"
        :open="accordionIsOpen == index"
        @open="accordionIsOpen = index">

        <div
          slot="trigger"
          slot-scope="props"
          class="accordion-header"
          role="button">
          <p class="accordion-header-title">
            {{ collapse.title }}
          </p>
          <a class="accordion-header-icon">
            <b-icon
              :icon="props.open ? 'menu-down' : 'menu-up'">
            </b-icon>
          </a>
        </div>

        <div class="accordion-content">
          <div class="content">
            {{ collapse.text }}
          </div>
        </div>

    </b-collapse>
    </div>
</template>



<style lang="scss" scoped>
@import "@/style/buefy-styles.scss";

.accordion {
  padding-bottom: 0;
  border: 1px solid $grey-dark;
}
.accordion-header {
  padding-left: 5px;
  display:flex;
  background-color: $grey-darker;
  justify-content: space-between;
  border-bottom: 1px solid $grey;
}
.accordion-content {
  background-color: $grey;
  height: 375px;
}

</style>
