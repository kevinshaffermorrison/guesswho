<template>
    <div id="nav">
      <h1>
        Welcome to Guess Who!
      </h1>
        <div class="container">
            <div class="card login">
            <div class="card-body">
                <h3 class="card-title text-center">Join a Room!</h3>
                <form @submit.prevent="login" class="text-center">
                <div class="form-group">
                    <label for="name">Your Name</label>
                    <input @focus="$event.target.select()" type="text" class="form-control" placeholder="Please enter your name..." name="name" v-model="name">
                    <br>
                    <label  for="room">Room Name</label>
                    <input @focus="$event.target.select()" type="text" class="form-control" placeholder="Please room name..." name="room" v-model="room">
                    <p v-if="errorText" class="text-danger">{{ errorText }}</p>
                </div>
                <button class="btn btn-primary">Enter Room</button>
                </form>
            </div>
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

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #11779F;
}
</style>