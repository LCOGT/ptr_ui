

import store from '../store'

/**
 *  This module includes a function that makes it easier to form valid commands
 *  from javascript objects.
 */
var create_commands = {
    // See utils/command_syntax_cod.js for the optional and required params to use.
    cmd: function(device_name, type, action, required_params={}, optional_params={}) {
        return {
            device: device_name,
            type: type,
            action: action,
            required_params: required_params,
            optional_params: optional_params,
        }
    },
    cmd_button: function(name, url, http_method, device_name, type, action,
                         required_params={}, optional_params={}) {
        return {
            name: name,
            url: url,
            http_method: http_method,
            form: this.cmd(device_name, type, action, required_params, optional_params),
        }
    },


    store_test: function() {
        console.log(store.getters['observatory/foo'])
    },
    test: function() {
        console.log('test from create_command.test()')
        this.store_test()
    },


    boilerplate_command(device_type, action, name, req_params, opt_params) {

      // Get the active device of the requested device type. 
      let device
      switch (device_type) {
        case 'mount':
          device = this.active_mount;
          break;
        case 'camera': 
          device = this.active_camera;
          break;
        case 'filter':
          device = this.active_filter;
          break;
        case 'rotator':
          device = this.active_rotator;
          break;
        case 'focuser':
          device = this.active_focuser;
          break;
      }

      return {
        name: name,
        url: `/${this.active_site}/${this.active_mount}/command/`,
        site: this.active_site,
        mount: this.active_mount,
        http_method: 'POST',
        form: {
          device: device,
          type: device_type,
          timestamp: parseInt(Date.now() / 1000),
          action: action,
          required_params: req_params || {},
          optional_params: opt_params || {},
        }
      }
    }
}

export default create_commands


