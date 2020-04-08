<!-- TODO
    Store name is localStorage.
-->
<template>
  <div class="container">
    <div class="card login">
      <div class="card-body">
        <h2 class="card-title text-center">Enter</h2>
        <form @submit.prevent="login" class="text-center">
          <div class="form-group">
            <label for="name">Your Name</label>
            <input type="text" class="form-control" placeholder="Please enter your name..." name="name" v-model="name">

            <label for="room">Room Name</label>
            <input type="text" class="form-control" placeholder="Please room name..." name="room" v-model="room">
            <p v-if="errorText" class="text-danger">{{ errorText }}</p>
          </div>
          <button class="btn btn-primary">Enter Room</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import functions from '../mixins/functions';

export default {
  mixins: [functions],
  name: 'home',
  data () {
    return {
      name: "",
      room: "",
      errorText: null
    }
  },
  async mounted(){
    this.errorText = this.$route.params.message;
    this.room = await this.getRandomName({});
    this.name = await this.getRandomName({spaces:true});
    // this.room = this.titleCase(roomName.replace('_',' ')).replace(' ','');
    // this.name = this.titleCase(name.replace('_',' '));
  },
  methods: {
    login() {
      if (this.name) {
        this.$router.push({name: 'Room', params: {room: this.room, name: this.name}})
      } else {
        this.errorText = "Please enter a name!"
      }
    }
  }
}
</script>

<style>
.login{
  max-width: 450px;
  margin-top: 50px;
  display: block;
  margin-left: auto;
  margin-right: auto;
}
</style>