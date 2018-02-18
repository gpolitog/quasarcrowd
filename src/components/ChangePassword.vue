<template>
<section>
      <transition name="modal">
      <div class="modal-mask" >
        <div class="modal-wrapper">
          <div class="modal-container">
            <div class="alert alert-danger" v-if="error.message"
             @click="error.message=''">
             <span>{{error.message}}</span>
            </div>
            <div class="alert alert-success" v-if="success">
             {{success}}
            </div>
            <div class="modal-header">
              <slot name="header">
                Αλλαγή κωδικού
              </slot>
            </div>

            <div class="modal-body">
              <slot name="body">
                  <div class="group">
                    <input type="password" v-model="oldPassword"><span class="highlight"></span><span class="bar"></span>
                    <label>Παλιός κωδικός</label>
                 </div>
                  <div class="group">
                    <input type="password" v-model="newPassword"><span class="highlight"></span><span class="bar"></span>
                    <label>Νέος κωδικός</label>
                 </div>
                 <div class="group">
                    <input type="password" v-model="verifNewPassword"><span class="highlight"></span><span class="bar"></span>
                    <label>Επιβεβαιωση νέου κωδικού</label>
                 </div>
              </slot>
            </div>
            <div class="modal-footer">
              <slot name="footer">
                <button class="btn btn-primary" @click="changePassword">
                  Αλλαγή κωδικού
                </button>
                <button class="btn btn-danger" @click="$emit('close')">
                  Ακύρωση
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
  props: {
    user: Object,
    firebase: Object
  },
  data: function () {
    return {
      oldPassword: '',
      newPassword: '',
      verifNewPassword: '',
      error: {
        code: '',
        message: ''
      },
      success: ''
    }
  },
  methods: {
    changePassword: function () {
      let vm = this
      this.error.message = ''
      if (vm.verifNewPassword !== vm.newPassword) {
        vm.error.message = 'Λάθος στην επιβεβαίωση του νέου κωδικού.'
      }
      vm.firebase
        .auth()
        .signInWithEmailAndPassword(vm.user.email, vm.oldPassword)
        .then(() => {
          return vm.firebase.auth().currentUser.updatePassword(vm.newPassword)
        })
        .then(() => {
          return vm.firebase.auth().signOut()
        })
        .then(() => {
          vm.success = 'Επιτυχής αλλαγή κωδικού!'
          setTimeout(function () {
            vm.$router.push('login')
          }, 3000)
        })
        .catch(function (error) {
          console.log(error)
          this.error = error
          vm.oldPassword = ''
          vm.newPassword = ''
          vm.verifNewPassword = ''
        })
    }
  }
}
</script>

<style scoped>
.modal-container {
  width: 400px
}

div.alert {
  max-width: 100%
}
</style>
