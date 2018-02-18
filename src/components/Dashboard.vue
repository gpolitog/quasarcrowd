<template>
  <div class="wrapper" v-if="user.role">
  <div class="sidebar" data-color="blue" data-image="assets/img/sidebar-5.jpg">
    <!--
  Tip 1: you can change the color of the sidebar using: data-color="blue | azure | green | orange | red | purple"
  Tip 2: you can also add an image using data-image tag
     -->
    <div class="sidebar-wrapper">
      <div class="logo">
        ΣΔΥ51
      </div>
      <ul class="nav">
        <li v-for="nav in navigation" :key="nav.target" 
        v-if="userHasRole(nav.rolesAllowed)">
          <router-link :to="nav.target">
            <i :class="nav.icon"></i>
            <p>{{nav.label}}</p>
          </router-link>
        </li>
      </ul>
    </div>
  </div>
  <div class="main-panel">
    <nav class="navbar navbar-default navbar-fixed">
      <div class="container-fluid">
        <div class="navbar-header">
          <button type="button" class="navbar-toggle" data-toggle="collapse">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
          <a class="navbar-brand" href="">{{user.role}} <span  v-if="user.role!=='admin'">@ {{user.municipality}}</span></a>
        </div>
        <div class="collapse navbar-collapse">
          <ul class="nav navbar-nav navbar-left">
            <li>
              <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                <i class="fa fa-dashboard"></i>
              </a>
            </li>
          </ul>
          <ul class="nav navbar-nav navbar-right">
            <li>
              <div class="dropdown">
                <button class="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true"
                  aria-expanded="true">
                 {{user.email}}
                  <span class="caret"></span>
                </button>
                <ul class="dropdown-menu" aria-labelledby="dropdownMenu1">
                  <li>
                    <a href="" @click="changePassword">Αλλαγή κωδικού</a>
                  </li>
                  <li>
                    <a href="" @click="logout">Αποσύνδεση</a>
                  </li>
                </ul>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </nav>
    <div class="content">
      <div class="container-fluid">
        <change-password v-if="chgPassword" :user="user" 
        :firebase="firebase"  @close="chgPassword=false" >
        </change-password>
        <router-view :firebase="firebase" :GoogleMapsKey="GoogleMapsKey" :user="user"></router-view>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import changePassword from './ChangePassword'

export default {
  data () {
    return {
      password: '',
      error: {
        code: '',
        message: ''
      },
      user: {},
      chgPassword: false,
      navigation: [
        {
          target: '/',
          icon: 'pe-7s-map-marker',
          label: 'αναφορες στο χαρτη',
          rolesAllowed: ['citizen', 'user', 'moderator', 'admin']
        },
        {
          target: '/createReport',
          icon: 'pe-7s-plus',
          label: 'δημιουργια αναφορας',
          rolesAllowed: ['citizen', 'user', 'moderator', 'admin']
        },
        {
          target: '/municipalities',
          icon: 'pe-7s-culture',
          label: 'διαχειριση δημων',
          rolesAllowed: ['admin']
        },
        {
          target: '/categories',
          icon: 'pe-7s-ticket',
          label: 'κατηγοριες αναφορων',
          rolesAllowed: ['admin']
        },
        {
          target: '/users',
          icon: 'pe-7s-users',
          label: 'διαχειριση χρηστων',
          rolesAllowed: ['admin']
        }
      ]
    }
  },
  props: {
    firebase: Object,
    GoogleMapsKey: String
  },
  components: { 'change-password': changePassword },
  created: function () {
    this.user.email = this.firebase.auth().currentUser.email
    this.firebase
      .database()
      .ref()
      .child('users')
      .orderByChild('email')
      .equalTo(this.user.email)
      .on('value', this.gotData, this.errData)
  },
  methods: {
    logout: function () {
      let vm = this
      this.firebase
        .auth()
        .signOut()
        .then(
          function () {
            // console.log('Signed Out')
            vm.$router.push('login')
          },
          function (error) {
            console.error('Sign Out Error', error)
          }
        )
    },
    userHasRole: function (array) {
      return array.indexOf(this.user.role) !== -1
    },
    changePassword: function (event) {
      event.preventDefault()
      this.chgPassword = true
    },
    gotData (data) {
      let vm = this
      var obj = data.val()
      for (let key in obj) {
        vm.user = {
          id: key,
          email: obj[key].email,
          role: obj[key].role,
          municipality: obj[key].municipality
        }
      }
    },
    errData (error) {
      console.log(error)
    }
  }
}
</script>

<style>

</style>
