<template>
  <section>
    <div id="map" class="large"></div>
    <!-- use the modal component, pass in the prop -->
    <transition name="modal">
      <div class="modal-mask" v-if="showModal">
        <div class="modal-wrapper">
          <div class="modal-container">
  
            <div class="modal-header">
              <slot name="header">
                Επεξεργασία αναφοράς
              </slot>
            </div>
  
            <div class="modal-body">
              <slot name="body">
                <b>Διεύθυνση :</b> {{reportToEdit.roadName}} <br>
                <section v-if="user.role==='user'">
                  <b>Κατηγορία :</b> {{reportToEdit.category}} <br>
                  <b>Περιγραφή :</b> {{reportToEdit.desc}} <br>
                </section>
                <section v-else>
                  <b>Κατηγορία :</b>
                  <select v-model="reportToEdit.category">
                    <option v-for="category in categories" :value="category.name" :key="category.id">{{category.name}}</option>
                  </select>
                  <br>
                  <b>Περιγραφή :</b>
                  <textarea v-model="reportToEdit.desc"></textarea>
                  <br>
                </section>
                <b>Ημερομηνία :</b> {{reportToEdit.date}} <br>
                <b>Χρήστης :</b> {{reportToEdit.user}} <br>
                <b>Ώρα :</b> {{reportToEdit.time}} <br>
                <b>status : </b>
                <select v-model="reportToEdit.status">
                  <option value="pending">pending</option>
                  <option value="work in progress">work in progress</option>
                  <option value="closed">closed</option>
                </select>
              </slot>
            </div>
            <div class="modal-footer">
              <slot name="footer" >
                <button class="btn btn-info" @click="deleteReport" v-if="user.role !=='user'">
                  Διαγραφή αναφοράς
                </button>
                <button class="btn btn-primary" @click="saveChanges">
                  Αποθήκευση αλλαγών
                </button>
                <button class="btn btn-danger" @click="showModal=false">
                  Ακύρωση αλλαγών
                </button>
              </slot>
            </div>
          </div>
        </div>
      </div>
    </transition> 
  </section>   
</template>

<script>
export default {
  data: function () {
    return {
      showModal: false,
      map: {},
      markers: [],
      reports: [],
      lat: '',
      lng: '',
      reportToEdit: {},
      categories: [],
      markerToEdit: {}
    }
  },
  props: {
    firebase: Object,
    user: Object
  },
  mounted: function () {
    this.firebase
      .database()
      .ref()
      .child('categories')
      .on('value', this.fetchCategories, this.errData)
    this.firebase
      .database()
      .ref()
      .child('municipalities')
      .orderByChild('name')
      .equalTo(this.user.municipality)
      .on('value', this.fetchMunicipality, this.errData)
    if (this.user.role === 'admin') {
      this.firebase
        .database()
        .ref()
        .child('reports')
        .on('value', this.gotData, this.errData)
    } else {
      this.firebase
        .database()
        .ref()
        .child('reports')
        .orderByChild('municipality')
        .equalTo(this.user.municipality)
        .on('value', this.gotData, this.errData)
    }
  },
  methods: {
    deleteReport: function () {
      let vm = this
      if (
        prompt(`Προσοχή! Αυτή ή ενέργεια θα διαγράψει μόνιμα την αναφορά από την βάση.

         Αν επιθυμείτε να συνεχίσετε πληκτρολογήστε "ΝΑΙ".`) === 'ΝΑΙ'
      ) {
        this.firebase
          .database()
          .ref()
          .child('reports')
          .child(this.reportToEdit.id)
          .remove()
          .then(() => {
            console.log('succesfull deletion!')
            // let indexToDelete = vm.markers.findIndex(
            //   el => el.report.id === vm.markerToEdit.report.id
            // )
            vm.markerToEdit.setMap(null)
            vm.markerToEdit = null

            vm.showModal = false
          })
          .catch(error => {
            console.log(error)
          })
      }
    },
    saveChanges: function () {
      let vm = this
      this.firebase
        .database()
        .ref()
        .child('reports')
        .child(this.reportToEdit.id)
        .update({
          status: this.reportToEdit.status,
          desc: this.reportToEdit.desc,
          category: this.reportToEdit.category
        })
        .then(() => {
          console.log('Successful update of report!')
          vm.showModal = false
        })
        .catch(err => console.log(err))
    },
    fetchCategories (data) {
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
    gotData (data) {
      let vm = this
      vm.reports = []
      vm.markers.forEach(marker => {
        marker.setMap(null)
        marker = null
      })
      vm.markers = []
      let reportsTemp = []
      var obj = data.val()
      for (let key in obj) {
        reportsTemp.push({
          id: key,
          roadName: obj[key].roadName,
          lat: obj[key].lat,
          lng: obj[key].lng,
          category: obj[key].category,
          desc: obj[key].desc,
          date: obj[key].date,
          time: obj[key].time,
          status: obj[key].status,
          user: obj[key].user,
          municipality: obj[key].municipality
        })
      }
      vm.reports = reportsTemp
      vm.reports.forEach(report => {
        let icon
        switch (report.status) {
          case 'pending':
            icon = 'src/assets/img/red-dot.png'
            break
          case 'work in progress':
            icon = 'src/assets/img/yellow-dot.png'
            break
          case 'closed':
            icon = 'src/assets/img/green-dot.png'
            break
          default:
            icon = 'src/assets/img/red-dot.png'
        }

        if (report.status === 'closed' && vm.user.role === 'citizen') {
        } else {
          let marker = new google.maps.Marker({
            position: new google.maps.LatLng(report.lat, report.lng),
            icon: icon,
            map: vm.map,
            report: Object.assign({}, report)
          })
          let infowindow = new google.maps.InfoWindow({
            content: `  
           <b>Διεύθυνση :</b> ${marker.report.roadName} </br>
           <b>Κατηγορία :</b> ${marker.report.category} </br>
           <b>Περιγραφή :</b> ${marker.report.desc} </br>
           <b>Ημερομηνία :</b> ${marker.report.date} </br>
           <b>Ώρα :</b> ${marker.report.time} </br>
           <b>status : </b>${marker.report.status}
           `
          })
          marker.addListener('click', function (e) {
            if (vm.user.role === 'citizen') return
            vm.reportToEdit = this.report
            vm.markerToEdit = this
            vm.showModal = true
          })
          marker.addListener('mouseover', function (e) {
            infowindow.open(vm.map, this)
          })
          marker.addListener('mouseout', function (e) {
            infowindow.close()
          })
          vm.markers.push(marker)
        }
      })
      if (vm.user.role === 'admin') {
        var bounds = new google.maps.LatLngBounds()
        for (var i = 0; i < vm.markers.length; i++) {
          bounds.extend(vm.markers[i].getPosition())
        }
        vm.map.fitBounds(bounds)
      }
    },
    errData () {},
    fetchMunicipality (data) {
      let vm = this
      var obj = data.val()
      for (let key in obj) {
        vm.lat = obj[key].lat
        vm.lng = obj[key].lng
      }
      this.initMap()
    },
    initMap: function () {
      let vm = this
      var center = { lat: vm.lat, lng: vm.lng }
      this.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: center
      })
    }
  }
}
</script>

<style>
.btn-info {
  border-color: #333;
  color: #333;
}
</style>
