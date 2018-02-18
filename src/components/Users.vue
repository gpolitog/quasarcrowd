<template>
  <section>
  <div class="alert alert-danger" v-if="error.message"
  @click="error.message=''">
  <span>{{error.message}}</span>
  </div>
<h2> Πίνακας χρηστών </h2>
<table class="table">
<thead>
  <tr>
    <th>Email</th>
    <th>Role</th>
    <th>Δημος</th>
  </tr>
</thead>
<tbody>
  <tr v-for="user in users" :key="user.id">
    <td>{{user.email}}</td>
    <td>
    <select v-model="user.role" @change="updateRole(user)">
      <option value="admin">admin</option>
      <option value="moderator">moderator</option>
      <option value="user" >user</option>
      <option value="citizen" >citizen</option>
    </select>
   </td>
    <td>{{user.municipality}}</td>
  </tr>
</tbody>
</table>
</section>
</template>
<script>
export default {
  mounted: function () {
    this.firebase
      .database()
      .ref()
      .child('users')
      .on('value', this.gotData, this.errData)
  },
  data: function () {
    return {
      email: '',
      users: [],
      success: '',
      error: {
        code: '',
        message: ''
      }
    }
  },
  props: {
    firebase: Object
  },
  methods: {
    updateRole: function (user) {
      // console.log(user)
      this.firebase
        .database()
        .ref()
        .child('users')
        .child(user.id)
        .update({ role: user.role })
    },
    gotData (data) {
      let vm = this
      let usersTemp = []
      var obj = data.val()
      for (let key in obj) {
        usersTemp.push({
          id: key,
          email: obj[key].email,
          role: obj[key].role,
          municipality: obj[key].municipality
        })
      }
      vm.users = usersTemp
    },
    errData () {},
    updateUser: function (event) {
      let vm = this
      event.preventDefault()
      let newUser = {
        email: vm.email
      }
      this.firebase
        .database()
        .ref()
        .child('users')
        .push(newUser)
        .then(() => {})
        .catch(error => {
          console.log(error)
        })
    }
  }
}
</script>
