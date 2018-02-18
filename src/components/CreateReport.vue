<template>
    <section>
  <div class="row">
    <div class="col-sm-8">
      <div id="map" class="small"></div>
      <p style="padding:10px">
      <i>Σύρετε τον δείκτη στο σημείο που υπάρχει πρόβλημα.</i>
     </p>
    </div>
    <div class="col-sm-4">
      <div class="alert alert-danger" v-if="error.message">
        {{error.message}}
      </div>
      <div class="alert alert-success" v-if="success">
        {{success}}
      </div>
      <form class="newReport">
        <div class="group">
          <input type="text" disabled v-model="roadName">
          <label>Οδός</label>
        </div>
        <div class="group">
          <input type="text" disabled v-model="municipality">
          <label>Δήμος</label>
        </div>
        <div class="group">
          <select v-model="category">
             <option v-for="category in categories" :value="category.name" :key="category.id">{{category.name}}</option>
          </select>
          <label>Κατηγορία</label>
        </div>
        <div class="group">
          <textarea v-model="desc" placeholder="σύντομη περιγραφή του προβλήματος πχ πρέπει να μπει σαμαράκι γιατί περνάνε γρήγορα τα αυτοκίνητα"></textarea>
          <label>Περιγραφή</label>
        </div>
        <button type="button" class="button buttonBlue" @click="addReport">Δημιουργία αναφοράς
        </button>
      </form>
    </div>
  </div>
</section>
</template>
<script>
export default {
  data: function () {
    return {
      roadName: '',
      lat: 37.974334,
      lng: 23.735245,
      category: 'Σαμαράκι',
      desc: '',
      map: {},
      success: '',
      municipality: '',
      categories: [],
      error: {
        code: '',
        message: ''
      }
    }
  },
  props: {
    firebase: Object,
    user: Object,
    GoogleMapsKey: String
  },
  mounted: function () {
    let vm = this
    this.firebase
      .database()
      .ref()
      .child('municipalities')
      .orderByChild('name')
      .equalTo(vm.user.municipality)
      .on('value', this.fetchMunicipality, this.errData)
    this.firebase
      .database()
      .ref()
      .child('categories')
      .on('value', this.gotData, this.errData)
  },
  methods: {
    addReport: function (event) {
      let vm = this
      event.preventDefault()
      if (
        vm.user.role !== 'admin' &&
        vm.municipality !== vm.user.municipality
      ) {
        vm.error.message = `Μπορείτε να δημιουργήσετε αναφορά μονό για τον δήμο : ${
          vm.user.municipality
        }`
        return
      }
      let date = new Date()
      let newReport = {
        roadName: vm.roadName,
        lat: vm.lat,
        lng: vm.lng,
        category: vm.category,
        desc: vm.desc,
        date: date.toLocaleDateString(),
        time:
          date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds(),
        status: 'pending',
        user: vm.user.email,
        municipality: vm.municipality
      }
      this.firebase
        .database()
        .ref()
        .child('reports')
        .push(newReport)
        .then(() => {
          // console.log('Successfull insertion to firebase')
          vm.success = 'Επιτυχής εισαγωγή αναφοράς στην βάση!'
          setTimeout(() => {
            vm.success = ''
          }, 5000)
        })
        .catch(err => console.log(err))
    },
    gotData (data) {
      let vm = this
      let categoriesTemp = []
      var obj = data.val()
      for (let key in obj) {
        categoriesTemp.push({
          id: key,
          name: obj[key].name
        })
      }
      vm.categories = categoriesTemp
    },
    fetchMunicipality (data) {
      let vm = this
      var obj = data.val()
      for (let key in obj) {
        vm.lat = obj[key].lat
        vm.lng = obj[key].lng
      }
      this.initMap()
    },
    errData (err) {
      console.log(err)
    },
    initMap: function () {
      let vm = this
      var center = { lat: vm.lat, lng: vm.lng }
      this.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: center
      })
      // Place a draggable marker on the map
      var marker = new google.maps.Marker({
        position: new google.maps.LatLng(this.lat, this.lng),
        map: this.map,
        draggable: true,
        title: 'Drag me!'
      })
      // console.log(marker)
      marker.addListener('dragend', function (e) {
        vm.lat = e.latLng.lat()
        vm.lng = e.latLng.lng()
        var geocoder = new google.maps.Geocoder()
        var latlng = { lat: parseFloat(vm.lat), lng: parseFloat(vm.lng) }
        geocoder.geocode({ location: latlng, language: 'el' }, function (
          results,
          status
        ) {
          if (status === 'OK') {
            let url =
              'https://maps.googleapis.com/maps/api/geocode/json?address=' +
              encodeURIComponent(results[0].formatted_address) +
              '&language=el&key=' +
              vm.GoogleMapsKey
            axios
              .get(url)
              .then(function (response) {
                vm.roadName = response.data.results['0'].formatted_address
                vm.municipality =
                  response.data.results['0'].address_components[2].long_name
              })
              .catch(function (error) {
                console.log(error)
                vm.roadName = 'ανώνυμος δρόμος'
              })
          } else {
            vm.roadName = 'ανώνυμος δρόμος'
          }
        })
      })
    }
  }
}
</script>

<style scoped>
div.alert {
  max-width: 100%
}
</style>
