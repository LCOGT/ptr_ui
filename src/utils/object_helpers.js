/* Useful sky object related functions */
const object_helpers = {
  common_name_parse: function (object_name) {
    /* Takes common names for objects and returns Aladin searchable object names
        */

    // List of potential alternate names in lowercase with corresponding proper Aladin names
    const common_names = require('/public/data/common_names.json') // eslint-disable-line import/no-absolute-path

    if (object_name.toLowerCase() in common_names) {
      return common_names[object_name.toLowerCase()]
    } else {
      return object_name
    };
  }
}

export default object_helpers
