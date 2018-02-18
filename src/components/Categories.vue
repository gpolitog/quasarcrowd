  <template>
  <section>
  <div class="alert alert-danger" v-if="error.message" @click="error.message=''">
    <span>{{error.message}}</span>
  </div>
  <div class="row">
    <div class="col-sm-6">
      <h2> Διαθέσιμες Κατηγορίες </h2>
      <table class="table">
        <thead>
          <tr>
            <th>Όνομα</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="category in categories" :key="category.id">
            <td>{{category.name}}</td>
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
          <label>Ονομασία Κατηγορίας</label>
        </div>
        <button type="button" class="button buttonBlue" @click="createCategory">Προσθήκη Κατηγορίας
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
      .child('categories')
      .on('value', this.gotData, this.errData)
  },
  props: {
    firebase: Object
  },
  data: function () {
    return {
      name: '',
      categories: [],
      success: '',
      error: {
        code: '',
        message: ''
      }
    }
  },
  methods: {
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
    errData () {},
    createCategory: function (event) {
      let vm = this
      event.preventDefault()
      let newCategory = {
        name: vm.name
      }
      this.firebase
        .database()
        .ref()
        .child('categories')
        .push(newCategory)
        .then(() => {})
        .catch(error => {
          console.log(error)
        })
    }
  }
}
</script>