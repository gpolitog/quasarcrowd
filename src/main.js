// === DEFAULT / CUSTOM STYLE ===
// WARNING! always comment out ONE of the two require() calls below.
// 1. use next line to activate CUSTOM STYLE (./src/themes)
// require(`./themes/app.${__THEME}.styl`)
// 2. or, use next line to activate DEFAULT QUASAR STYLE
require(`quasar/dist/quasar.${__THEME}.css`)
// ==============================

// Uncomment the following lines if you need IE11/Edge support
// require(`quasar/dist/quasar.ie`)
// require(`quasar/dist/quasar.ie.${__THEME}.css`)

import Vue from 'vue'
import Quasar from 'quasar'
import router from './router'

import firebase from 'firebase'
import * as VueGoogleMaps from 'vue2-google-maps'

import BootstrapVue from 'bootstrap-vue/dist/bootstrap-vue.esm'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import 'bootstrap/dist/css/bootstrap.css'

// import 'src/statics/js/light-bootstrap-dashboard.js'

Vue.use(BootstrapVue)

Vue.config.productionTip = false
Vue.use(Quasar) // Install Quasar Framework

if (__THEME === 'mat') {
  require('quasar-extras/roboto-font')
}
import 'quasar-extras/material-icons'
// import 'quasar-extras/ionicons'
// import 'quasar-extras/fontawesome'
// import 'quasar-extras/animate'

const GoogleMapsKey = 'AIzaSyBUGzx798XJXy5ohtcyM-YulHpSoXEAw38'

Vue.use(VueGoogleMaps, {
  load: {
    key: GoogleMapsKey
  }
})
// Initialize Firebase
var config = {
  apiKey: 'AIzaSyDR-TouSF3NXVUdBo88lSexZnEzHEWihdk',
  authDomain: 'test-86189.firebaseapp.com',
  databaseURL: 'https://test-86189.firebaseio.com',
  projectId: 'test-86189',
  storageBucket: 'test-86189.appspot.com',
  messagingSenderId: '168427742214'
}

let app

firebase.initializeApp(config)

Quasar.start(() => {
  router.beforeEach((to, from, next) => {
    let currentUser = firebase.auth().currentUser
    let requiresAuth = to.matched.some(record => record.meta.requiresAuth)
    if (requiresAuth && !currentUser) next('login')
    else if (!requiresAuth && currentUser) next('/')
    else next()
  })

  firebase.auth().onAuthStateChanged(function (user) {
    if (!app) {
      app = new Vue({
        el: '#q-app',
        render: h => h(require('./App').default),
        data: { firebase, GoogleMapsKey },
        router
      })
    }
  })
})

// Quasar.start(() => {
//   /* eslint-disable no-new */
//   new Vue({
//     el: '#q-app',
//     router,
//     render: h => h(require('./App').default),
//     data: { firebase, GoogleMapsKey }
//   })
// })
