
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
    }
}

export default create_commands


