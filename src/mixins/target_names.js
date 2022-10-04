import axios from 'axios'
export const target_names = {

  computed: {

  },

  methods: {

    get_coordinates_from_object_name (common_name) {
      const url = 'https://cdsweb.u-strasbg.fr/cgi-bin/nph-sesame.jsonp?object=' + encodeURIComponent(common_name)

      let ra, dec, name
      let error = false
      return new Promise(resolve => {
        axios.get(url).then(response => {
          const result = JSON.parse(response.data.slice(10, -3))
          if (!result.Target.Resolver || !result.Target.Resolver.jradeg || !result.Target.Resolver.jdedeg) {
            console.error('failed to fetch coordinates for ', common_name)
            error = true
          } else {
            ra = result.Target.Resolver.jradeg / 15 // degrees to decimal hours
            dec = result.Target.Resolver.jdedeg
            name = result.Target.Resolver.oname
          }
          const results = { ra, dec, name, error }
          resolve(results)
        })
      })
    }

  }

}
