<template>
  <section>
  <div class="alert alert-danger" v-if="error.message" @click="error.message=''">
    <span>{{error.message}}</span>
  </div>
  <div class="row">
    <div class="col-sm-6">
      <h2> Δήμοι </h2>
      <table class="table">
        <thead>
          <tr>
            <th>Όνομα</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="municipality in municipalities" :key="municipality.id">
            <td>{{municipality.name}}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="col-sm-6">
      <form>
        <div class="group">
          <input type="text" v-model="name">
          <span class="highlight"></span>
          <span class="bar"></span>
          <label>Ονομασία Δήμου</label>
        </div>
        <button type="button" class="button buttonBlue" @click="fetchMunicipality">Προσθήκη Δήμου
          <div class="ripples buttonRipples">
            <span class="ripplesCircle"></span>
          </div>
        </button>
      </form>
    </div>
  </div>
</section>
</template>

<script>
export default {
  mounted: function () {
    this.firebase
      .database()
      .ref()
      .child('municipalities')
      .on('value', this.gotData, this.errData)
  },
  data: function () {
    return {
      name: '',
      municipalities: [],
      success: '',
      error: {
        code: '',
        message: ''
      }
    }
  },
  props: {
    firebase: Object,
    GoogleMapsKey: String
  },
  methods: {
    gotData: function (data) {
      let vm = this
      let municipalitiesTemp = []
      var obj = data.val()
      for (let key in obj) {
        municipalitiesTemp.push({
          id: key,
          name: obj[key].name
        })
      }
      vm.municipalities = municipalitiesTemp
    },
    errData: function () {},
    fetchMunicipality: function (event) {
      let vm = this
      event.preventDefault()

      let url =
        'https://maps.googleapis.com/maps/api/geocode/json?address=' +
        encodeURIComponent(vm.name) +
        '&language=el&key=' +
        vm.GoogleMapsKey
      axios
        .get(url)
        .then(function (results) {
          console.log(results)
          var location = results.data.results['0'].geometry.location
          let newMunicipality = {
            name: results.data.results['0'].address_components['0'].long_name,
            lat: location.lat,
            lng: location.lng
          }
          return vm.firebase
            .database()
            .ref()
            .child('municipalities')
            .push(newMunicipality)
        })
        .then(() => {
          console.log('Επιτυχής προσθήκη νέου δήμου.')
        })
        .catch(error => {
          console.log(error)
        })
    }
  }
}
</script>
