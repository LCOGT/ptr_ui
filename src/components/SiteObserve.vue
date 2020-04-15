

<template><div class="wrapper container">

  
<div class="content-column">

  <!--status-overview-2
    :config="config"
    :sitecode="sitecode"  
    :deviceStatus="deviceStatus" 
  style="margin:0"/-->

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

        <div class="status-items">
          <div class="keys">
            <div class="key">Enclosure:</div>
            <div class="key">Shutter:</div>
            <div class="key">Open ok</div>
          </div>
          <div class="keys">
            <div class="val">{{enclosure_state.shutter_status}}</div>
            <div class="val">{{parseTrueFalse(enclosure_state.shutter_slewing) ? "slewing" : "idle" }}</div>
            <div class="val">{{weather_state.open_ok || '-'}}</div>
          </div>
        </div>

        <command-button :data="enclosure_open_command" style="margin-bottom: 1em;" class="is-small"/>
        <command-button :data="enclosure_close_command" style="margin-bottom: 1em;" class="is-small"/>
        <br>

        <div class="status-toggle-bar" @click="isEnclosureStatusVisible = !isEnclosureStatusVisible">toggle status</div>
        <pre v-if="isEnclosureStatusVisible">
          <simple-device-status :device_name="active_enclosure" device_type="enclosure" :device_status="enclosure_state" />
        </pre>

      </b-dropdown-item> 
    </b-dropdown>

    <b-dropdown>
      <a
        slot="trigger"
        role="button">
        <div class="button is-text" >Telescope</div>
      </a>
      <b-dropdown-item custom label="Telescope">

        <div class="instrument-control-title-bar">
          <div class="title">Telescope</div>
          <div class="device-instance-subtitle tag is-small is-light" @click="isDeviceSelectorActive = !isDeviceSelectorActive">
            {{active_mount}}
          </div>
          <div class="device-instance-subtitle tag is-small is-light" @click="isDeviceSelectorActive = !isDeviceSelectorActive">
            {{active_telescope}}
          </div>
        </div>>

        <div class="columns">
          <div class="status-items column">
              <div class="keys">
                <div class="key">Ra:</div>
                <div class="key">Dec:</div>
                <div class="key">Alt:</div>
                <div class="key">Az:</div>
              </div>
              <div class="keys">
                <div class="val">{{decimalToHHMMSS(telescope_state.right_ascension)}}</div>
                <div class="val">{{decimalToHHMMSS(telescope_state.declination)}}</div>
                <div class="val">{{(telescope_state.altitude)}}</div>
                <div class="val">{{(telescope_state.azimuth)}}</div>
              </div>
          </div>
          <div class="status-items column">
              <div class="keys">
                <div class="key">Ha:</div>
                <div class="key">Airmass:</div>
                <div class="key">Activity:</div>
              </div>
              <div class="keys">
                <div class="val">{{(hour_angle)}}</div>
                <div class="val">{{telescope_state.airmass}}</div>
                <div class="val">{{mount_activity}}</div>
              </div>
          </div>
        </div>

        <b-field horizontal label="Ra">
          <b-input name="subject" size="is-small" v-model="mount_ra" autocomplete="off"></b-input>
        </b-field>
        <b-field horizontal label="Dec">
          <b-input name="subject" size="is-small" v-model="mount_dec" autocomplete="off"></b-input>
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

        <div class="status-toggle-bar" @click="isMountStatusVisible = !isMountStatusVisible">toggle status</div>
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

        <div class="status-items">
          <div class="keys">
            <div class="key">Camera status: </div>
            <div class="key">Filter: </div>
            <div class="key">Filter Wheel: </div>
          </div>
          <div class="keys">
            <div class="val">{{camera_state.status}}</div>
            <div class="val">{{filter_wheel_state.filter_name}}</div>
            <div class="val">{{parseTrueFalse(filter_wheel_state.wheel_is_moving) ? "moving" : "idle"}}</div>
          </div>
        </div>

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
            <!--b-select placeholder="Select filter" v-model="cam_filter" style="width: 100%">
                <option value="LUMINANCE">luminance</option>
                <option value="RED">red</option>
                <option value="GREEN">green</option>
                <option value="BLUE">blue</option>
            </b-select-->

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
        <div class="status-toggle-bar" @click="isCameraStatusVisible = !isCameraStatusVisible">toggle status</div>
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
        <div class="button is-text">Sequencer</div>
      </a>
      <b-dropdown-item custom label="Sequencer">

        <div>
            <div class="instrument-control-title-bar">
              <div class="title">Sequencer</div>
            </div>

            <b-field label="Script">
              <b-field>
                <b-select value="none" v-model="selected_script" style="width: 100;" size="is-small">
                  <option value="none">none</option>
                  <option value="stop_script">Stop Script</option>
                  <option value="focus_auto">Focus Auto</option>
                  <option value="focus_fine">Focus Fine</option>
                  <option value="focus_vcurve">Focus V-Curve</option>
                  <option value="takeLRGBStack">Take LRGB Stack</option>
                  <option value="takeO3HaS2N2Stack">Take O3HaS2N2 Stack</option>
                  <option value="takeUGRIZSStack">Take ugrizs Stack</option>
                  <option value="takePlanetStack">Take Planet Stack</option>
                  <option value="takeLunarStack">Take Lunar Stack</option>
                  <option value="genBiasDarkMaster">Gen Bias/Dark Master</option>
                  <option value="genScreenFlatMasters">Gen Screen Flat Masters</option>
                  <option value="take_pre-open_calibrations">Take Pre-open Calibrations</option>
                  <option value="takeSkyFlats">Take SkyFlats</option>
                  <option value="find_field_center">Find Field Center</option>
                  <option value="calibrate_focus_v-curve">Calibrate Focus V-curve</option>
                  <option value="32_target_pointing_run">32 Target Pointing Run</option>
                  <option value="128_target_pointing_run">128 Target Pointing Run</option>
                  <option value="run_using_acp">Run Using ACP</option>
                  <option value="stop_using_acp">Stop Using ACP</option>
                </b-select>
                <p class="control">
                  <button 
                    class="button is-light is-small" 
                    :disabled="!scriptHasSettings"
                    @click="isScriptSettingsActive = true"
                    >
                    <b-icon icon="settings"></b-icon>
                  </button>
                </p>
              </b-field>
            </b-field>

            <b-modal :active.sync="isScriptSettingsActive" has-modal-card>
                <script-settings :script="selected_script" />
            </b-modal>

            <div class="status-item">
              <div class="title2">Sequencer Status</div>
              <pre>{{ sequencer_state }}</pre>
            </div>

            <div class="buttons has-addons">
              <button class="button is-small" @click="script_run_command" style="width: 70%;"> run script</button>
              <button class="button is-small" @click="script_stop_command" style="width: 30%"> stop script</button>
            </div>

        </div>

        <div class="status-toggle-bar" @click="isCameraStatusVisible = !isCameraStatusVisible">toggle status</div>
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

          <div class="status-items">
              <div class="keys">
                <div class="key">Focus:</div>
                <div class="key">Temp:</div>
                <div class="key">Status:</div>
              </div>
              <div class="keys">
                <div class="val">{{focuser_state.focus_position}}	&mu;m</div>
                <div class="val">{{focuser_state.focus_temperature}} &#8451;</div>
                <div class="val">{{focuser_state.focus_moving.toLowerCase()=="true" ? "moving" : "idle"}}</div>
              </div>
          </div>

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
                <button class="button is-small" @click="postCommand(focus_relative_command_args,['-100'])"> -100 </button>
            </p>
            <p class="control">
                <button class="button is-small" @click="postCommand(focus_relative_command_args,['-10'])"> -10 </button>
            </p>
            <p class="control">
                <button class="button is-small" @click="postCommand(focus_relative_command_args,['-1'])"> -1 </button>
            </p>
            <p class="control">
                <button class="button is-small" @click="postCommand(focus_relative_command_args,['+1'])"> +1 </button>
            </p>
            <p class="control">
                <button class="button is-small" @click="postCommand(focus_relative_command_args,['+10'])"> +10 </button>
            </p>
            <p class="control">
                <button class="button is-small" @click="postCommand(focus_relative_command_args,['+100'])"> +100 </button>
            </p>
          </b-field>

          <b-field label="Absolute">
            <b-field>
              <b-input expanded name="subject" size="is-small" v-model="focuser_absolute" type="number" :step="focuser_step_size" :min="focuser_min" :max="focuser_max" autocomplete="off"></b-input>
              <p class="control"> <command-button :data="focus_absolute_command" class="is-small"/>  </p>
            </b-field>
          </b-field>
          <br>

        <div class="status-toggle-bar" @click="isFocuserStatusVisible = !isFocuserStatusVisible">toggle full status</div>
        <pre v-if="isFocuserStatusVisible">
          <simple-device-status :device_name="active_focuser" device_type="Focuser" :device_status="focuser_state" />
        </pre>
      </b-dropdown-item>
    </b-dropdown>

    <b-dropdown>
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

        <div class="status-items">
          <div class="keys">
            <div class="key">Position:</div>
            <div class="key">Activity:</div>
          </div>
          <div class="keys">
            <div class="val">{{rotator_state.position_angle}} &deg;</div>
            <div class="val">{{parseTrueFalse(rotator_state.rotator_moving) ? "rotating" : "idle" }}</div>
          </div>
        </div>

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

        <div class="status-toggle-bar" @click="isFocuserStatusVisible = !isFocuserStatusVisible">toggle status</div>
        <pre v-if="isFocuserStatusVisible">
          <simple-device-status :device_name="active_rotator" device_type="Rotator" :device_status="rotator_state" />
        </pre>
      </b-dropdown-item>
    </b-dropdown>

    <b-dropdown>
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

        <div class="status-items">
          <div class="keys">
            <div class="key">Status:</div>
            <div class="key">Brightness:</div>
          </div>
          <div class="keys">
            <div class="val">{{screen_state.dark_setting.split(' ')[2]}}</div>
            <div class="val">{{screen_state.bright_setting}} &#37;</div>
          </div>
        </div>

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

        <div class="status-toggle-bar" @click="isScreenStatusVisible = !isScreenStatusVisible">toggle status</div>
        <pre v-if="isScreenStatusVisible">
          <simple-device-status :device_name="active_screen" device_type="Screen" :device_status="screen_state" />
        </pre>
      </b-dropdown-item>
    </b-dropdown>

    <b-dropdown>
      <a
        slot="trigger"
        role="button">
        <div class="button is-text">Settings</div>
      </a>
      <b-dropdown-item custom icon="settings">

        <button class="button" @click="isDeviceSelectorActive = !isDeviceSelectorActive">Select Devices</button>
        <div style="height: 1em"/>
        <table class="table">
          <thead>
            <tr>
              <th>Mount</th>
              <th>Telescope</th>
              <th>Camera</th>
              <th>Filter Wheel</th>
              <th>Focuser</th>
              <th>Rotator</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{{active_mount}}</td>
              <td>{{active_telescope}}</td>
              <td>{{active_camera}}</td>
              <td>{{active_filter_wheel}}</td>
              <td>{{active_focuser}}</td>
              <td>{{active_rotator}}</td>
            </tr>
          </tbody>
        </table>


      </b-dropdown-item>
    </b-dropdown>

    <!-- Select the active devices here -->
    <b-modal :active.sync="isDeviceSelectorActive" :width="640" :can-cancel="true">
      <article class="instrument-selection message">
        <div class="message-header">Device Selection</div>
        <div class="message-body">
          <!-- Mount Selection -->
          <b-field horizontal class="select-device" label="Mount">
              <b-select 
                placeholder="choose mount..." 
                default="" 
                v-model="active_mount"
              >
                <option 
                  v-for="(mount, index) in Object.keys(config.mount)" 
                  v-bind:value="mount"
                  v-bind:key="`mount-${index}`"
                >
                  {{ mount }}
                </option>
              </b-select>
          </b-field>

          <!-- Telescope Selection -->
          <b-field horizontal class="select-device" label="Telescope">
              <b-select 
                placeholder="choose telescope..." 
                default="" 
                v-model="active_telescope"
              >
                <option 
                  v-for="(ota, index) in Object.keys(config.telescope)" 
                  v-bind:value="ota"
                  v-bind:key="`ota-${index}`"
                >
                  {{ ota }}
                </option>
              </b-select>
          </b-field>
          
          <!-- Camera Selection -->
          <b-field horizontal class="select-device" label="Camera">
              <b-select 
                placeholder="choose camera..." 
                default="" 
                v-model="active_camera"
              >
                <option 
                  v-for="(cam, index) in Object.keys(config.camera)" 
                  v-bind:value="cam"
                  v-bind:key="`cam-${index}`"
                >
                  {{ cam }}
                </option>
              </b-select>
          </b-field>

          <!-- Filter Wheel Selection -->
          <b-field horizontal class="select-device" label="Filters">
              <b-select 
                placeholder="choose filter wheel..." 
                default="" 
                v-model="active_filter_wheel"
              >
                <option 
                  v-for="(filter_wheel, index) in Object.keys(config.filter_wheel)" 
                  v-bind:value="filter_wheel"
                  v-bind:key="`filter_wheel-${index}`"
                >
                  {{ filter_wheel }}
                </option>
              </b-select>
          </b-field>

          <!-- Focuser Selection -->
          <b-field horizontal class="select-device" label="Focuser">
              <b-select 
                placeholder="choose focuser..." 
                default="" 
                v-model="active_focuser"
              >
                <option 
                  v-for="(focuser, index) in Object.keys(config.focuser)" 
                  v-bind:value="focuser"
                  v-bind:key="`focuser-${index}`"
                >
                  {{ focuser }}
                </option>
              </b-select>
          </b-field>

          <!-- Rotator Selection -->
          <b-field horizontal class="select-device" label="Rotator">
              <b-select 
                placeholder="choose rotator..." 
                default="" 
                v-model="active_rotator"
              >
                <option 
                  v-for="(rotator, index) in Object.keys(config.rotator)" 
                  v-bind:value="rotator"
                  v-bind:key="`rotator-${index}`"
                >
                  {{ rotator }}
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
  :config="config" 
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
import StatusOverview2 from '@/components/StatusOverview2'

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
    StatusOverview2,
  },
  mixins: [commands_mixin],
  props: ['config', 'deviceStatus', 'sitecode'],
  data () {
    return {

      // This is a setInterval object initialized in `created()`. 
      // Fetches status every few seconds.
      update_status_interval: 2000,
      local_timestamp: Date.now(),

      // Controls the toggle for image preview modal.
      isImageModalActive: false,

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

      // testign job status
      focuserStatus: 'nothing yet',
      jobSub: '', //ws connection

      focuserJobs: {},

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

    // Alternative to the command_button component
    async postCommand(formCreatorFunction, args) {

      let form = formCreatorFunction(...args).form
      let url = 'https://jobs.photonranch.org/jobs/newjob'

      form.timestamp = parseInt(Date.now() / 1000)

      const options = await this.getConfigWithAuth()
      form.site = this.sitecode
      form.mount = this.active_mount
      axios.post(url,form, options).then(response => {
          console.log(response.data)
          this.$emit('jobPost', response.data)
      }).catch(e => {
          console.warn(e)
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
  
    parseTrueFalse(str) {
      if (str.toLowerCase()=="true") {return true}
      if (str.toLowerCase()=="false") {return false}
      console.error("Could not parse true or false. Check for bad behavior.")
      console.log(str)
      return false
    },

    refresh_latest_image() {
      this.$store.dispatch('images/set_latest_image')
    },

    decimalToHHMMSS(time) {
        // prevent return value of NaN:NaN:NaN
        if (typeof parseFloat(time) != "number") {return '--:--:--'}

        // -1.00 should translate to -01:00:00
        let negative = false;
        if (parseFloat(time) < 0) { negative = true }
        time = Math.abs(time)

        let hhmmss = ''
        let h, m, s;
        h = parseInt(time)
        m = parseInt(60 * (time - h))
        s = parseInt(3600 * (time - h) % 60)
        if (h<10) { h = '0'+h}
        if (m<10) { m = '0'+m}
        if (s<10) { s = '0'+s}
        if (negative) {h = '-'+h}
        hhmmss = `${h}:${m}:${s}`
        return hhmmss
    },

    // Get axios request config object (the headers) with auth token
    async getConfigWithAuth() {
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

    ...mapGetters('images', [
      'current_image',
    ]),
    ...mapGetters([
      'scriptHasSettings',
    ]),

    ...mapGetters('observatory_configuration', [
      'enclosure',
      'mount',
      'telescope',
      'camera',
      'filter_wheel',
      'focuser',
      'rotator',
      'screen',
      'weather',
    ]),


    // single status items
    mount_activity() {
      let activity = "idle"

      if (this.parseTrueFalse(this.mount_state.is_parked)) {
        activity = "parked"
      }
      else if (this.parseTrueFalse(this.mount_state.is_tracking)) {
        activity = "tracking"
      }
      else if (this.parseTrueFalse(this.mount_state.is_slewing)) {
        activity = "slewing"
      }
      return activity
    },
    hour_angle() {
      let ha = this.telescope_state.sidereal_time - this.telescope_state.right_ascension
      if (ha < -12) {
        ha += 24 // hours, since we're in decimal
      }
      ha = ha.toFixed(3)
      if (ha > 0) {
        ha = '+'+ha
      }
      return ha
    },

      

    enclosure_state() {
        try {
            return this.deviceStatus.enclosure[this.enclosure]
        } catch { return {} }
    },
    mount_state() {
        try {
            return this.deviceStatus.mount[this.mount]
        } catch { return {} }
    },
    telescope_state() {
        try {
            return this.deviceStatus.telescope[this.telescope]
        } catch(error) { return {} }
    },
    camera_state() {
        try {
            return this.deviceStatus.camera[this.camera]
        } catch(error) { console.log(error); return {} }
    },
    filter_wheel_state () {
        try {
            return this.deviceStatus.filter_wheel[this.filter_wheel]
        } catch(error) { return {} }
    },
    focuser_state() {
        try {
            return this.deviceStatus.focuser[this.focuser]
        } catch(error) { return {} }
    },
    rotator_state() {
        try {
            return this.deviceStatus.rotator[this.rotator]
        } catch(error) { return {} }
    },
    screen_state () {
        try {
            return this.deviceStatus.screen[this.screen]
        } catch(error) { return {} }
    },
    weather_state() {
        try {
            return this.deviceStatus.observing_conditions[this.weather]
        } catch { return {} }
    },
    sequencer_state () {
        try {
            return this.deviceStatus.sequencer
        } catch(error) { return {} }
    },

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
  margin: 1em;
  background-color: rgba(20,20,20,0.9)
}

.status-items {
  margin:15px 0;
  display:flex;
  width:100%;
}

.keys {
  flex-direction:column;
}
.status-header {
  font-weight: bold;
  text-align: center;
  padding: 3px 0;
  margin-bottom: 5px;
  background-color: #283030;
}
.key {
  text-align: right;
  padding-right: 10px;
  color:silver;
  padding: 0 8px;
  margin-bottom: 3px;
  background-color: #283030;
  white-space: nowrap;
}
.val{
  color: greenyellow;
  background-color: black;
  padding: 0 8px;
  margin-bottom: 3px;
}

.status-toggle-bar {
  height: 1.5em;
  background-color:#161a1a;
  text-align: center;
}
.status-toggle-bar:hover {
  cursor: pointer;
}
.status {
  margin: 1em;
  padding: 1em;
  min-height: 5em;
  /*background:lightskyblue;*/
  display: flex;
  border-bottom: solid grey 1px;
  flex-wrap: wrap;
}
.status-item {
  margin: 1em;
  flex: 1;
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

.modal-dialog {
    max-width: 100%;
    margin: 0;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    height: 110vh;
    display: flex;
}

</style>
