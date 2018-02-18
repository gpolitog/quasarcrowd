<template>
  <section>
  <div class="alert alert-danger" v-if="error.message"
  @click="error.message=''">
  <span>{{error.message}}</span>
  </div>
  <form>
  <div class="group">
    <input type="text" v-model="email"><span class="highlight"></span><span class="bar"></span>
    <label>Email</label>
  </div>
  <div class="group">
    <input type="password" v-model="password"><span class="highlight"></span><span class="bar"></span>
    <label>Password</label>
  </div>
  <button type="button" class="button buttonBlue" @click="login">Σύνδεση
    <div class="ripples buttonRipples"><span class="ripplesCircle"></span></div>
  </button>
  <p style="text-align:center"> <router-link to="/register">Εγγραφή νέου χρήστη </router-link></p>
</form>
</section>
</template>
<script>
export default {
  data: function () {
    return {
      email: '',
      password: '',
      error: {
        code: '',
        message: ''
      }
    }
  },
  props: { firebase: Object },
  methods: {
    login: function (event) {
      event.preventDefault()
      this.firebase
        .auth()
        .signInWithEmailAndPassword(this.email, this.password)
        .then(user => {
          this.$router.replace('/')
        })
        .catch(error => {
          console.log(error)
          this.error = error
        })
    }
  }
}
</script>

