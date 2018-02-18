<template>
  <section>
  <div class="alert alert-danger" v-if="error.message"
      @click="error.message=''">
      <span>{{error.message}}</span>
  </div>
  <form>
  <div class="group">
    <input type="text" v-model="email" ><span class="highlight"></span><span class="bar"></span>
    <label>Email</label>
  </div>
  <div class="group">
    <select v-model="municipality" >
      <option v-for="municipality in municipalities" :value="municipality.name" :key="municipality.id">{{municipality.name}}</option>
    </select>
    <label>Δήμος</label>
  </div>
  <div class="group">
    <input type="password" v-model="password" ><span class="highlight"></span><span class="bar"></span>
    <label>Password</label>
  </div>
  <button type="button" class="button buttonBlue" @click="register">Εγγραφή νέου χρήστη
    <div class="ripples buttonRipples"><span class="ripplesCircle"></span></div>
  </button>
  <p style="text-align:center"> <router-link to="/login">Σύνδεση </router-link></p>
</form>
</section>
</template>

<script>
export default {
  data: function () {
    return {
      municipalities: [],
      email: '',
      password: '',
      municipality: 'Αθήνα',
      error: {
        code: '',
        message: ''
      }
    }
  },
  props: {
    firebase: Object
  },
  mounted: function () {
    this.firebase
      .database()
      .ref()
      .child('municipalities')
      .on('value', this.gotData, this.errData)
  },
  methods: {
    register: function (event) {
      let vm = this
      event.preventDefault()
      vm.firebase
        .auth()
        .createUserWithEmailAndPassword(vm.email, vm.password)
        .then(() => {
          let newUser = {
            email: vm.email.toLowerCase(),
            role: 'citizen',
            municipality: vm.municipality
          }
          return vm.firebase
            .database()
            .ref()
            .child('users')
            .push(newUser)
        })
        .then(user => {
          console.log('Your account has been created!')
          vm.$router.replace('login')
        })
        .catch(error => {
          console.log(error)
          this.error = error
        })
    },
    gotData (data) {
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
    errData () {}
  }
}
</script>