<template>

<div class="wrapper container">
  
<div class="content-column">
        <b-modal :active.sync="telescopeModal"
                trap-focus
                :can-cancel="['escape']"
                scroll="clip"
                full-screen
                style="z-index:1000;"
                 >
          <skychart-modal
            style="background-color:#151718; overflow-y:auto; height: 100%;"
            :sitecode="sitecode"
            :deviceStatus="deviceStatus"
            />
        </b-modal>

  <div class="b-tabs" style="position: relative;">

    <b-dropdown :trap-focus="true" :append-to-body="true">
      <a
        slot="trigger"
        role="button">
        <div class="button is-text">Enclosure</div>
      </a>
      <b-dropdown-item custom style="position;absolute; width:100%" label="Enclosure" >
        <div class="instrument-control-title-bar">
          <div class="title">Enclosure</div>
          <div class="device-instance-subtitle tag is-small is-light" 
            @click="isDeviceSelectorActive = !isDeviceSelectorActive">
            {{active_enclosure}}
          </div>
        </div>

        <div class="val">{{enclosure_state.enclosure_message}}</div>

        <status-column :statusList="buildEnclosureTabStatus" />

        <command-button 
          admin
          v-if="userIsAdmin && enclosure_state.enclosure_mode != 'Manual'" 
          :data="enclosure_manual_command" 
          style="margin-bottom: 1em; width: 100%;" 
          />
        <command-button 
          admin
          v-if="userIsAdmin && enclosure_state.enclosure_mode != 'Automatic'" 
          :data="enclosure_auto_command" 
          style="margin-bottom: 1em; width: 100%;" 
          />

        <b-field>
          <p class="control">
            <command-button :data="enclosure_open_command" style="margin-bottom: 1em;" class="is-small"/>
          </p>
          <p class="control">
            <command-button :data="enclosure_close_command" style="margin-bottom: 1em;" class="is-small"/>
          </p>
        </b-field>
        <br>

        <div class="status-toggle-bar" @click="isEnclosureStatusVisible = !isEnclosureStatusVisible">{{isEnclosureStatusVisible ? 'collapse status' : 'expand status'}}</div>
        <pre v-if="isEnclosureStatusVisible">
          <simple-device-status :device_name="active_enclosure" device_type="enclosure" :device_status="enclosure_state" />
        </pre>

      </b-dropdown-item> 
    </b-dropdown>

    <b-dropdown :append-to-body="true">
      <a
        slot="trigger"
        role="button">
        <div class="button is-text" >Telescope</div>
      </a>
      <b-dropdown-item custom label="Telescope">

        <div class="instrument-control-title-bar">
          <div class="title">Telescope</div>
          <div 
            class="device-instance-subtitle tag is-small is-light" 
            @click="isDeviceSelectorActive = !isDeviceSelectorActive">
            {{active_mount}}
          </div>
          <div class="device-instance-subtitle tag is-small is-light" @click="isDeviceSelectorActive = !isDeviceSelectorActive">
            {{active_telescope}}
          </div>
        </div>

        <div class="val" v-if="mount_state && mount_state.message && mount_state.message != '-'">{{mount_state.message}}</div>
        <div class="val" v-if="telescope_state && telescope_state.message && telescope_state.message != '-'">{{telescope_state.message}}</div>

        <div class="columns">
          <status-column class="column" :statusList="buildTelescopeTabStatus1"/>
          <status-column class="column" :statusList="buildTelescopeTabStatus2"/>
        </div>

        <b-field horizontal label="Ra">
          <b-field>
            <b-input name="subject" type="search" icon-clickable size="is-small" v-model="mount_ra" autocomplete="off"></b-input>
            <p class="control"><span class="button is-static is-small">hrs</span></p>
            </b-field>
          </b-field>
          <b-field horizontal label="Dec">
            <b-field>
              <b-input name="subject" type="search" icon-clickable size="is-small" v-model="mount_dec" autocomplete="off"></b-input>
              <p class="control"><span class="button is-static is-small">deg</span></p>
            </b-field>
          </b-field>
          <b-field horizontal label="Object">
            <b-input name="subject" type="search" icon-clickable size="is-small" v-model="mount_object" autocomplete="off"></b-input>
          </b-field>

          <command-button :data="mount_slew_command" style="margin-bottom: 1em;" class="is-small"/>
          <br>

          <b-dropdown aria-role="list" style="width: 100%;" size="is-small">
            <button class="button is-small" slot="trigger" style="width: 100%;">
                <span>Slew to...</span>
                <b-icon icon="menu-down"></b-icon>
            </button>
            <b-dropdown-item aria-role="listitem">
              <command-button :data="mount_slew_chart_command" class="dropdown-button-command is-small"/>
            </b-dropdown-item>
            <b-dropdown-item>
              <command-button :data="mount_screenflat_command" class="dropdown-button-command is-small"/>
            </b-dropdown-item>
            <b-dropdown-item>
              <command-button :data="mount_skyflat_command" class="dropdown-button-command is-small"/>
            </b-dropdown-item>
            <b-dropdown-item>
              <command-button :data="mount_home_command" class="dropdown-button-command is-small"/>
            </b-dropdown-item>
            <b-dropdown-item>
              <command-button :data="mount_park_command" class="dropdown-button-command is-small"/>
            </b-dropdown-item>
            <b-dropdown-item>
              <command-button :data="mount_raSidDec0_command" class="dropdown-button-command is-small"/>
            </b-dropdown-item>
            <b-dropdown-item>
              <command-button :data="mount_stop_command" class="dropdown-button-command is-small"/>
            </b-dropdown-item>
          </b-dropdown>

          <b-button class="button" style="width:100%; margin:1em 0;" @click=" telescopeModal = !telescopeModal" icon-right="arrow-top-right">view skychart</b-button>

          <div class="status-toggle-bar" @click="isMountStatusVisible = !isMountStatusVisible">
            {{ isMountStatusVisible ? 'collapse status' : 'expand status'}}
          </div>
          <pre v-if="isMountStatusVisible">
            <simple-device-status :device_name="active_mount" device_type="Mount" :device_status="mount_state" />
            <simple-device-status :device_name="active_telescope" device_type="Telescope" :device_status="telescope_state" />
          </pre>


        </b-dropdown-item>
      </b-dropdown>

      <b-dropdown>
        <a
          slot="trigger"
          role="button">
          <div class="button is-text">Camera</div>
        </a>
        <b-dropdown-item custom label="Camera">

          <div class="instrument-control-title-bar">
            <div class="title">Camera</div>
            <div class="device-instance-subtitle tag is-small is-light" @click="isDeviceSelectorActive = !isDeviceSelectorActive">
              {{active_camera}}
            </div>
            <div class="device-instance-subtitle tag is-small is-light" @click="isDeviceSelectorActive = !isDeviceSelectorActive">
              {{active_filter_wheel}}
            </div>
          </div>

          <div class="val" v-if="camera_state && camera_state.message">{{camera_state.message}}</div>

          <status-column :statusList="buildCameraTabStatus" />


          <b-field horizontal label="Expose">
              <b-field>
                  <b-input name="subject" size="is-small" v-model="camera_exposure" autocomplete="off"></b-input>
                  <p class="control"> <span class="button is-static is-small">s</span> </p>
              </b-field>
          </b-field>

          <b-field horizontal label="Count">
              <b-field>
                  <b-numberinput name="subject" type="is-light" min="1" size="is-small" controls-position="compact" v-model="camera_count" autocomplete="off"></b-numberinput>
              </b-field>
          </b-field>


          <b-field horizontal label="Filter">

              <b-select placeholder="select filter..." v-model="filter_wheel_options_selection" size="is-small" style="width: 100%">
                <option 
                  v-for="(filter, index) in filter_wheel_options"
                  v-bind:value="filter[0]" 
                  v-bind:selected="index === 0"
                  v-bind:key="index"
                  >
                  {{ filter[0] }}
                </option>
              </b-select>

              <div class="buttons has-addons">
                <command-button :data="filter_wheel_command" style="width: 50%" class="is-small"/>
                <command-button :data="filter_wheel_home_command" style="width: 50%" class="is-small" />
              </div>
          </b-field>

          <b-field horizontal label="Bin" v-if="camera_can_bin">
            <b-select placeholder="Select bin" v-model="camera_bin" size="is-small">
              <option
                v-for="(bin_option, index) in camera_bin_options"
                v-bind:value="bin_option"
                v-bind:selected="index === 0"
                v-bind:key="index"
                >
                {{ bin_option }}
              </option>
            </b-select>
          </b-field>

          <b-field horizontal label="Area" v-if="camera_areas.length != 0">
              <b-select 
                placeholder="Select chip area" 
                v-model="camera_areas_selection" 
                style="width: 100%"
                size="is-small"
                >
                <option
                  v-for="(area, index) in camera_areas"
                  v-bind:value="area"
                  v-bind:selected="index === 0"
                  v-bind:key="index"
                  >
                  {{ area }}
                </option>
              </b-select>
          </b-field>

          <b-field horizontal label="Subframe">
            <p>{{ subframeIsActive ? "Active" : "Not Active"}}</p>
            <p>({{subframe_x0.toFixed(2)}},{{subframe_y0.toFixed(2)}}), ({{subframe_x1.toFixed(2)}}, {{subframe_y1.toFixed(2)}})</p>
            <button class="button is-small" v-if="subframeIsActive" @click="function(){subframeIsActive = false}"> deactivate </button>
            <button class="button is-small" v-if="!subframeIsActive" @click="function(){subframeIsActive = true}"> activate </button>
          </b-field>


          <b-field horizontal label="Image Type">
            <b-select placeholder="Select image type" v-model="camera_image_type" size="is-small">
              <option
                v-for="(image_type, index) in camera_image_type_options"
                v-bind:value="image_type"
                v-bind:selected="index === 0"
                v-bind:key="index"
                >
                {{ image_type }}
              </option>
            </b-select>
          </b-field>

          <b-field horizontal label="Dither">
            <b-checkbox
              v-model="camera_dither"
              true-value="on"
              false-value="off"
              >
              {{ camera_dither }}
            </b-checkbox>
          </b-field>

          <b-field horizontal label="Extract">
            <b-checkbox
              v-model="camera_extract"
              true-value="on"
              false-value="off"
              >
              {{ camera_extract }}
            </b-checkbox>
          </b-field>

          <b-field horizontal label="Hint">
            <b-input placeholder="a hint for the FITS header..."
              type="text"
              min="0"
              max="64"
              size="is-small"
              v-model="camera_hint">
            </b-input>
          </b-field>

          <br>
          <div class="buttons has-addons">
            <command-button :data="camera_expose_command" style="width: 70%" class="is-small"/>
            <command-button :data="camera_cancel_command" style="width: 30%" class="is-small"/>
          </div>
          <div class="status-toggle-bar" @click="isCameraStatusVisible = !isCameraStatusVisible">
            {{ isCameraStatusVisible ? 'collapse status' : 'expand status'}}
          </div>
          <pre v-if="isCameraStatusVisible">
            <simple-device-status :device_name="active_camera" device_type="Camera" :device_status="camera_state" />
            <simple-device-status :device_name="active_filter_wheel" device_type="Filter Wheel" :device_status="filter_wheel_state" />
          </pre>

        </b-dropdown-item>
      </b-dropdown>

      <b-dropdown>
        <a
          slot="trigger"
          role="button">
          <div class="button is-text">Focuser</div>
        </a>
        <b-dropdown-item custom label="Focuser">

          <div class="instrument-control-title-bar">
            <div class="title">Focuser</div>
            <div class="device-instance-subtitle tag is-small is-light" @click="isDeviceSelectorActive = !isDeviceSelectorActive">
              {{active_focuser}}
            </div>
          </div>

          <div class="val" v-if="focuser_state && focuser_state.message">{{focuser_state.message}}</div>
          <status-column :statusList="buildFocuserTabStatus" />

          <b-dropdown aria-role="list" style="width: 100%; margin-bottom: 1em;">
            <button class="button is-small" slot="trigger" style="width: 100%;">
                <span>Focus Action...</span>
                <b-icon icon="menu-down"></b-icon>
            </button>
            <b-dropdown-item aria-role="listitem">
              <command-button :data="focus_home_command" class="dropdown-button-command"/>
            </b-dropdown-item>
            <b-dropdown-item>
              <command-button :data="focus_gotoreference_command" class="dropdown-button-command"/>
            </b-dropdown-item>
            <b-dropdown-item>
              <command-button :data="focus_gotocompensated_command" class="dropdown-button-command"/>
            </b-dropdown-item>
            <b-dropdown-item>
              <command-button :data="focus_saveasreference_command" class="dropdown-button-command"/>
            </b-dropdown-item>
          </b-dropdown>
          <br>

          <b-field label="Relative">
            <b-field>
              <b-input expanded name="subject" size="is-small" v-model="focuser_relative" type="number" :step="focuser_step_size" autocomplete="off"></b-input>
              <p class="control"> <command-button :data="focus_relative_command" class="is-small" @jobPost="focuserJobPost"/>  </p><br>
            </b-field>
          </b-field>
          <b-field>
            <p class="control">
                <button class="button is-small" @click="postCommand(focus_relative_command_args,['-300'])"> -300 </button>
            </p>
            <p class="control">
                <button class="button is-small" @click="postCommand(focus_relative_command_args,['-100'])"> -100 </button>
            </p>
            <p class="control">
                <button class="button is-small" @click="postCommand(focus_relative_command_args,['-30'])"> -30 </button>
            </p>
            <p class="control">
                <button class="button is-small" @click="postCommand(focus_relative_command_args,['+30'])"> +30 </button>
            </p>
            <p class="control">
                <button class="button is-small" @click="postCommand(focus_relative_command_args,['+100'])"> +100 </button>
            </p>
            <p class="control">
                <button class="button is-small" @click="postCommand(focus_relative_command_args,['+300'])"> +300 </button>
            </p>
          </b-field>

          <b-field label="Absolute">
            <b-field>
              <b-input expanded name="subject" size="is-small" v-model="focuser_absolute" type="number" :step="focuser_step_size" :min="focuser_min" :max="focuser_max" autocomplete="off"></b-input>
              <p class="control"> <command-button :data="focus_absolute_command" class="is-small"/>  </p>
            </b-field>
          </b-field>
          <br>

          <div class="status-toggle-bar" @click="isFocuserStatusVisible = !isFocuserStatusVisible">
            {{ isFocuserStatusVisible ? 'collapse status' : 'expand status' }}
          </div>
          <pre v-if="isFocuserStatusVisible">
            <simple-device-status :device_name="active_focuser" device_type="Focuser" :device_status="focuser_state" />
          </pre>
        </b-dropdown-item>
      </b-dropdown>

      <b-dropdown>
        <a
          slot="trigger"
          role="button">
          <div class="button is-text">Sequencer</div>
        </a>
        <b-dropdown-item custom label="Sequencer">
          <div style="width: 275px;"/>

          <div class="instrument-control-title-bar">
            <div class="title">Sequencer</div>
          </div>

          <div class="val" v-if="sequencer_state && sequencer_state.message">{{sequencer_state.message}}</div>
          <status-column :statusList="buildSequencerTabStatus" />

          <b-field label="Script">
            <b-field>
              <b-select value="none" v-model="selected_script" style="width: 100;" size="is-small">
                <option value="none">none</option>
                <option value="stopScript">Stop Script</option>
                <option value="findFieldCenter">Find Field Center</option>
                <option value="calibrateAtFieldCenter">Calibrate at Field Center</option>
                <option value="focusAuto">Focus Auto</option>
                <option value="focusFine">Focus Fine</option>
                <option value="focusVcurve">Focus V-Curve</option>
                <option value="takeLRGBStack">Take LRGB Stack</option>
                <option value="takeO3HaS2N2Stack">Take O3HaS2N2 Stack</option>
                <option value="takeUGRIZSStack">Take ugrizs Stack</option>
                <option value="takePlanetStack">Take Planet Stack</option>
                <option value="takeLunarStack">Take Lunar Stack</option>
                <option value="genBiasDarkMaster">Gen Bias/Dark Master</option>
                <option value="genScreenFlatMasters">Gen Screen Flat Masters</option>
                <option value="genSkyFlatMasters">Gen Sky Flat Masters</option>
                <option value="genCalibrations">Gen Calibrations</option>
                <option value="calibrateFocusVcurve">Calibrate Focus V-curve</option>
                <option value="pointingRun">Pointing Run</option>
                <option value="runWithMaximCamera">Run w/Maxim Camera</option>
                <option value="runWithAscomCamera">Run w/Ascom Camera</option>
                <option value="runUsingAcp">Run Using ACP</option>
                <option value="stopUsingAcp">Stop Using ACP</option>
              </b-select>
              <p class="control">
                <button 
                  class="button is-light is-small" 
                  :disabled="!scriptHasSettings"
                  @click="isScriptSettingsActive = !isScriptSettingsActive"
                  >
                  <b-icon icon="settings"></b-icon>
                </button>
              </p>
            </b-field>
          </b-field>

          <div v-if="isScriptSettingsActive">
            <script-settings :show="scriptHasSettings" :script="selected_script" />
          </div>

          <div class="buttons has-addons" style="margin-bottom: 10px;">
            <b-button class="button is-small is-success" @click="script_run_command" style="width: 65%;"> run script</b-button>
            <b-button class="button is-small" @click="script_stop_command" style="width: 35%"> stop script</b-button>
          </div>



          <div class="status-toggle-bar" @click="isSequencerStatusVisible = !isSequencerStatusVisible">
            {{ isSequencerStatusVisible ? 'collapse status' : 'expand status' }}
          </div>
          <pre v-if="isSequencerStatusVisible">
            <simple-device-status :device_name="active_sequencer" device_type="Sequencer" :device_status="sequencer_state" />
          </pre>

        </b-dropdown-item>
      </b-dropdown>


      <b-dropdown v-if="isCmdTabsExpanded">
        <a
          slot="trigger"
          role="button">
          <div class="button is-text">Rotator</div>
        </a>
        <b-dropdown-item custom label="Rotator">

          <div class="instrument-control-title-bar">
            <div class="title">Rotator</div>
            <div class="device-instance-subtitle tag is-small is-light" @click="isDeviceSelectorActive = !isDeviceSelectorActive">
              {{active_rotator}}
            </div>
          </div>

          <status-column :statusList="buildRotatorTabStatus" />

          <command-button :data="rotate_home_command" class="is-small" style="width:100%; margin-bottom:1em;"/>
          <b-field label="Relative">
            <b-field>
              <b-input expanded size="is-small" name="subject" v-model="rotator_relative" type="number" :step="rotator_step_size" autocomplete="off"></b-input>
              <p class="control"> <command-button :data="rotate_relative_command" class="is-small"/>  </p>
            </b-field>
          </b-field>
          <b-field label="Absolute">
            <b-field>
              <b-input expanded size="is-small" name="subject" v-model="rotator_absolute" type="number" :step="rotator_step_size" autocomplete="off"></b-input>
              <p class="control"> <command-button :data="rotate_absolute_command" class="is-small" />  </p>
            </b-field>
          </b-field>
          <br>

          <div class="status-toggle-bar" @click="isFocuserStatusVisible = !isFocuserStatusVisible">
            {{ isFocuserStatusVisible ? 'collapse status' : 'expand status' }}
          </div>
          <pre v-if="isFocuserStatusVisible">
            <simple-device-status :device_name="active_rotator" device_type="Rotator" :device_status="rotator_state" />
          </pre>
        </b-dropdown-item>
      </b-dropdown>

      <b-dropdown v-if="isCmdTabsExpanded">
        <a
          slot="trigger"
          role="button">
          <div class="button is-text">Screen</div>
        </a>
        <b-dropdown-item custom label="Screen">
          <div class="instrument-control-title-bar">
            <div class="title">Screen</div>
            <div class="device-instance-subtitle tag is-small is-light" @click="isDeviceSelectorActive = !isDeviceSelectorActive">
              {{active_screen}}
            </div>
          </div>

          <status-column :statusList="buildScreenTabStatus" />

          <b-field label="Brightness">
            <b-field>
              <b-input 
                expanded 
                size="is-small" 
                name="subject" 
                v-model="screen_brightness" 
                type="number" 
                :step="1" 
                min="0" 
                max="100" 
                autocomplete="off" />
                <p class="control"> <command-button :data="screen_on_command" class="is-small control" /> </p>
                <p class="control"> <command-button :data="screen_off_command" class="is-small control" /> </p>
            </b-field>
          </b-field>

          <div class="status-toggle-bar" @click="isScreenStatusVisible = !isScreenStatusVisible">
            {{ isScreenStatusVisible ? 'collapse status' : 'expand status' }}
          </div>
          <pre v-if="isScreenStatusVisible">
            <simple-device-status :device_name="active_screen" device_type="Screen" :device_status="screen_state" />
          </pre>
        </b-dropdown-item>
      </b-dropdown>

        

      <b-dropdown v-if="isCmdTabsExpanded">
        <a
          slot="trigger"
          role="button">
          <div class="button is-text">Settings</div>
        </a>
        <b-dropdown-item custom label="custom" style="margin: 0; padding: 0">
          <article class="instrument-selection message">
            <div class="message-header">Device Selection</div>
            <div class="message-body">
          <div>

                <b-field 
                  horizontal 
                  v-for="(instrument, idx) in [
                    'mount',
                    'telescope',
                    'camera',
                    'filter_wheel',
                    'focuser', 
                    'rotator',
                    'sequencer',
                  ]"
                  v-bind:key="idx"
                  class="select-device" :label="instrument">

                    <b-select 
                      :placeholder="`choose ${instrument}...`"
                      v-model="self['active_'+instrument]"
                    >

                      <option 
                        v-for="(val, index) in available_devices(instrument, sitecode)" 
                        v-bind:value="val"
                        v-bind:key="`ota-${index}`"
                      >
                        {{ val }}
                      </option>
                    </b-select>
                </b-field>


              <b-field horizontal class="select-device" label="">
                <button class="button is-success" @click="setDefaultDevices" >Defaults</button>
              </b-field>
            </div>
          </div>
          </article>


        </b-dropdown-item>
      </b-dropdown>

      <b-dropdown v-if="isCmdTabsExpanded && userIsAdmin" position="is-bottom-left">
        <a
          slot="trigger"
          role="button">
          <div class="button is-text">Site Config</div>
        </a>
        <b-dropdown-item custom label="custom" style="max-width: 50em">
          <pre>{{JSON.stringify(site_config(this.sitecode), null,2)}}</pre>
        </b-dropdown-item>
      </b-dropdown>

      <a style="color:#4099ff;" class="button is-text" @click="isCmdTabsExpanded = !isCmdTabsExpanded"> {{isCmdTabsExpanded ? " << less" : "more >>"}}</a>

      <!-- Select the active devices here -->
      <b-modal :active.sync="isDeviceSelectorActive" :width="640" :can-cancel="true">
        <article class="instrument-selection message">
          <div class="message-header">Device Selection</div>
          <div class="message-body">

              <b-field horizontal 
                v-for="(instrument, idx) in [
                  'mount',
                  'telescope',
                  'camera',
                  'filter_wheel',
                  'focuser', 
                  'rotator',
                  'sequencer',
                ]"
                v-bind:key="idx"
                class="select-device" :label="instrument">

                  <b-select 
                    :placeholder="`choose ${instrument}...`"
                    v-model="self['active_'+instrument]"
                  >

                    <option 
                      v-for="(val, index) in available_devices(instrument, sitecode)" 
                      v-bind:value="val"
                      v-bind:key="`ota-${index}`"
                    >
                      {{ val }}
                    </option>
                  </b-select>
              </b-field>


            <b-field horizontal class="select-device" label="">
              <button class="button is-success" @click="isDeviceSelectorActive = false">Submit</button>
            </b-field>
          </div>
        </article>
      </b-modal>


    </div>
  </div>


  <div class="spacer" style="height: 2em;" />



  <site-data 
    :sitecode="sitecode" 
    :deviceStatus="deviceStatus"
    />


  <div class="info-column" style="display: none">

    <div style="margin-top: 2em;"/>

    <side-info-panel>
      <p slot="title">Webcam</p>
      <the-dome-cam v-if="sitecode=='wmd'"/>
    </side-info-panel>

    <side-info-panel :startOpen="true">
      <p slot="title">Image Preview</p>
      <!--button class="button is-small" @click="refresh_latest_image" style="margin-bottom: 1em;">latest image</button-->
      <div style="width:100%;height:0; padding-top:100%;position:relative; background-fill: yellow;">
          <img
              v-bind:src="current_image.jpg13_url" 
              @click="isImageModalActive = true" 
              style="width: 100%; background-color: grey; cursor: pointer; position: absolute; top:0; left:0" />
      </div>
      <b-modal :active.sync="isImageModalActive" :width="800">
          <p class="image">
              <image-view :site="active_site" />
          </p>
      </b-modal>
      <div>{{current_image.base_filename}}</div>
    </side-info-panel>

    <side-info-panel :startOpen="true">
      <p slot="title">Job Status</p>
      <pre>{{focuserJobs}}</pre>
    </side-info-panel>

    </div>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { commands_mixin } from '../mixins/commands_mixin'
import { status_mixin } from '../mixins/status_mixin'
import helpers from '@/utils/helpers'
import store from '../store/index'

// Components
import CommandButton from '@/components/CommandButton'
import TheSkyChart from '@/components/celestialmap/TheSkyChart'
import ImageView from '@/components/ImageView'
import SimpleDeviceStatus from '@/components/SimpleDeviceStatus'
import ScriptSettings from '@/components/ScriptSettings'
import TheDomeCam from '@/components/TheDomeCam'
import SideInfoPanel from '@/components/SideInfoPanel'
import SiteData from '@/components/SiteData'
import SkychartModal from '@/components/SkychartModal'
import ImagesTable from '@/components/ImagesTable'
import StatusColumn from '@/components/StatusColumn'

import ReconnectingWebSocket from 'reconnecting-websocket'
import axios from 'axios';

export default {
  name: 'SiteObserve',
  components: {
    CommandButton,
    TheSkyChart,
    ImageView,
    SimpleDeviceStatus,
    ScriptSettings,
    TheDomeCam,
    SideInfoPanel,
    SiteData,
    SkychartModal,
    ImagesTable,
    StatusColumn,
  },
  mixins: [commands_mixin, status_mixin],
  props: ['sitecode'],
  data () {
    return {

      self: this,

      selectInstruments: [
        {name: 'telescope', model: 'active_telescope'},
        {name: 'camera', model: 'active_camera'},
      ],

      // This is a setInterval object initialized in `created()`. 
      // Fetches status every few seconds.
      update_status_interval: 2000,
      local_timestamp: Date.now(),

      // Controls the toggle for image preview modal.
      isImageModalActive: false,

      isCmdTabsExpanded: false,

      // Toggles the script settings visiblity
      isScriptSettingsActive: false,

      testSubframeIsActive: false,

      isDeviceSelectorActive: false,

      isEnclosureStatusVisible: false,
      isMountStatusVisible: false,
      isCameraStatusVisible: false,
      isFocuserStatusVisible: false,
      isRotatorStatusVisible: false,
      isScreenStatusVisible: false,
      isSequencerStatusVisible: false,

      // testign job status
      focuserStatus: 'nothing yet',
      jobSub: '', //ws connection

      focuserJobs: {},


      // Full screen modal for sky map and mount commands
      telescopeModal: false,

    }
  },

  created() {
    // This interval is stopped in the `beforeDestroy` lifecycle hook.
    this.update_time_interval = setInterval(this.update_time, 1000)

    // This websocket subscribes to changes in job status
    this.jobsSub = new ReconnectingWebSocket("wss://1tlv47sxw4.execute-api.us-east-1.amazonaws.com/dev")
    this.jobsSub.onmessage = (message) => {
      let newJob = JSON.parse(message.data)
      console.log(newJob)
      if (newJob.ulid in Object.keys(this.focuserJobs)) {
        this.focuserJobs[newJob.ulid].status = newJob.statusId.split("#")[0]
      }
      else {
        let jobStatus = {
          "status": newJob.statusId.split("#")[0],
          "deviceType": newJob.deviceType,
        }
        this.focuserJobs[newJob.ulid] = jobStatus
      }
      this.focuserStatus = newJob
      //this.$set(this.jobIds, newJob.ulid, newJob)
    }
  },
  beforeDestroy() {
    clearInterval(this.update_time_interval)
  },


  methods: {

    /**
     * Set the default devices for this site.
     * First, update the config. Then use the config to specify devices.
     */
    async setDefaultDevices() {
      await this.$store.dispatch('site_config/update_config')
      this.$store.dispatch('site_config/set_default_active_devices', this.sitecode)
    },
    handleNotAuthorizedResponse(error) {
        if (error.response) {
            // Request made and server responded
            console.log("error message", error.response.data);
            console.log("error status", error.response.status);
            console.log("error headers", error.response.headers);
            // small popup notification describing error
            this.$buefy.toast.open({
                duration: 5000,
                message: `${error.response.status} error: ${error.response.data}`,
                position: 'is-bottom',
                type: 'is-danger' ,
            })
        } else if (error.request) {
            // The request was made but no response was received
            console.warn("The request was made but no response was received.")
            console.log(error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.warn("Something happened in setting up the request that triggered an error.")
            console.log('Error', error.message);
        }
    },

    // Alternative to the command_button component
    async postCommand(formCreatorFunction, args) {

      const options = await this.getAuthHeader()
      let form = formCreatorFunction(...args).form
      const url = `${this.$store.state.dev.jobs_api}/newjob?site=${this.sitecode}`

      form.timestamp = parseInt(Date.now() / 1000)
      form.site = this.sitecode
      form.mount = this.active_mount

      axios.post(url,form, options).then(response => {
          console.log(response.data)
          this.$emit('jobPost', response.data)
      }).catch(e => {
          this.handleNotAuthorizedResponse(e)
      })
    },

    focuserJobPost(data) {
      console.log('focuser job post: ',data)
      let statusItem = {
        "status": data.statusId.split("#")[0],
        "deviceType": data.deviceType,
      }
      this.focuserJobs[data.ulid] = statusItem
    },

    update_time() {
      this.local_timestamp= Date.now()
    },
  
    parseTrueFalse(s) {
      if (undefined == s) { 
        return false; 
      }
      else if (s.toLowerCase()=="true") {return true}
      else if (s.toLowerCase()=="false") {return false}
      console.error("Could not parse true or false. Check for bad behavior.")
      console.log(s)
      return false
    },

    refresh_latest_image() {
      this.$store.dispatch('images/set_latest_image')
    },

    // Get axios request config object (the headers) with auth token
    async getAuthHeader() {
        let token, configWithAuth;
        try {
            token = await this.$auth.getTokenSilently(); 
        } catch(err) {
            console.error(err)
            console.warn('Did not acquire the needed token. Stopping request.')
            
            // small popup notification
            this.$buefy.toast.open({
                duration: 5000,
                message: "Oops! You need to be logged in to do that.",
                position: 'is-bottom',
                type: 'is-danger' ,
            })
        }

        return {
            'headers': {
                'Content-Type': 'application/json;charset=UTF-8',
                'Access-Control-Allow-Origin': '*',
                'Authorization': `Bearer ${token}`
            }
        }
    },
  },

  watch: {
    // If the user changes the chip area parameter, deactivate the subframe.
    camera_areas_selection: function(newVal, oldVal) {
      this.subframeIsActive = false;
    }
  },

  computed: {

    userIsAdmin() {
      try {
        let user = this.$auth.user 
        let roles = user['https://photonranch.org/user_metadata'].roles
        return roles.includes('admin')
      } catch {
        return false
      }
    },

    ...mapGetters('images', [
      'current_image',
    ]),
    ...mapGetters([
      'scriptHasSettings',
    ]),

    ...mapGetters('site_config', [
      'site_config',
      'available_devices',

      'enclosure',
      'mount',
      'telescope',
      'camera',
      'filter_wheel',
      'focuser',
      'rotator',
      'screen',
      'weather',
      'sequencer',
    ]),

      
    status_age() {
      let status_timestamp = this.deviceStatus.timestamp
      return (this.local_timestamp/1000 - status_timestamp).toFixed(1)
    },

    selected_script: {
      get() { return this.$store.getters['selectedScript']},
      set(val) { this.$store.commit('selectedScript', val)},
    },


    // command_params
    mount_ra: {
        get() { return this.$store.getters['command_params/mount_ra']},
        set(val) { this.$store.commit('command_params/mount_ra', val)},
    },
    mount_dec: {
        get() { return this.$store.getters['command_params/mount_dec']},
        set(val) { this.$store.commit('command_params/mount_dec', val)},
    },
    mount_object: {
        get() { return this.$store.getters['command_params/mount_object']},
        set(val) { this.$store.commit('command_params/mount_object', val)},
    },

    subframeIsActive: {
        get() { return this.$store.getters['command_params/subframeIsActive']},
        set(val) { this.$store.commit('command_params/subframeIsActive', val)},
    },

    camera_areas_selection: {
        get() { return this.$store.getters['command_params/camera_areas_selection'] },
        set(val) {this.$store.commit('command_params/camera_areas_selection', val)}
    },
    camera_hint: {
        get() { return this.$store.getters['command_params/camera_hint']},
        set(val) { this.$store.commit('command_params/camera_hint', val)},
    },
    camera_exposure: {
        get() { return this.$store.getters['command_params/camera_exposure'] },
        set(val) {this.$store.commit('command_params/camera_exposure', val)}
    },
    camera_count: {
        get() { return this.$store.getters['command_params/camera_count'] },
        set(val) {this.$store.commit('command_params/camera_count', val)}
    },
    camera_bin: {
        get() { return this.$store.getters['command_params/camera_bin'] },
        set(val) {this.$store.commit('command_params/camera_bin', val)}
    },
    camera_dither: {
        get() { return this.$store.getters['command_params/camera_dither'] },
        set(val) {this.$store.commit('command_params/camera_dither', val)}
    },
    camera_extract: {
        get() { return this.$store.getters['command_params/camera_extract'] },
        set(val) {this.$store.commit('command_params/camera_extract', val)}
    },
    camera_image_type: {
        get() { return this.$store.getters['command_params/camera_image_type'] },
        set(val) {this.$store.commit('command_params/camera_image_type', val)}
    },

    filter_wheel_options_selection: {
        get() { return this.$store.getters['command_params/filter_wheel_options_selection'] },
        set(val) { this.$store.commit('command_params/filter_wheel_options_selection', val) }
    },

    focuser_relative: {
        get() { return this.$store.getters['command_params/focuser_relative'] },
        set(val) {this.$store.commit('command_params/focuser_relative', val)}
    },
    focuser_absolute: {
        get() { return this.$store.getters['command_params/focuser_absolute'] },
        set(val) {this.$store.commit('command_params/focuser_absolute', val)}
    },

    rotator_relative: {
        get() { return this.$store.getters['command_params/rotator_relative'] },
        set(val) {this.$store.commit('command_params/rotator_relative', val)}
    },
    rotator_absolute: {
        get() { return this.$store.getters['command_params/rotator_absolute'] },
        set(val) {this.$store.commit('command_params/rotate_absolute', val)}
    },

    screen_brightness: {
        get() { return this.$store.getters['command_params/screen_brightness'] },
        set(val) {this.$store.commit('command_params/screen_brightness', val)}
    },
  },

}
</script>

<style scoped>

.b-tabs{
  background-color: #1e2223;
  display:flex;
  align-items:center;
  flex-wrap:wrap;
}

.instrument-control-title-bar {
  display:flex;
  justify-content:space-between;
  align-items:center;
  flex-wrap:nowrap;
}
.instrument-control-title-bar > .title {
  word-break:keep-all;
  padding-right: 10px;
}
.device-instance-subtitle {
  margin-bottom:22.5px /* match the margin of .title elements */
}
.device-instance-subtitle:hover {
  cursor:pointer;
}

.content-column {
  width: 100%;
}

.info-column {
  margin-top: 2em;
}
.panel-content {
  margin: 1em;
}
.instrument-selection {
  background-color: rgba(20,20,20,0.9)
}


.status-toggle-bar {
  height: 1.5em;
  background-color:#161a1a;
  text-align: center;
}
.status-toggle-bar:hover {
  cursor: pointer;
}
.choose-target {
  margin-top: 1em;
}
.label {
  color: #dbdee0;
}

.dropdown-button-command {
  border: none;
}
.dropdown-button-command:hover {
  color:grey;
  font:bolder;
}

</style>
