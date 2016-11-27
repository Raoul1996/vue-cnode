<template>
  <transition name="fade-slide">
    <div class="loginForm" v-show="show">
      <div class="Menu Menu--arrowed loginForm-menu">
        <form class="form-inline" role="form">
          <div class="form-group">
            <label class="sr-only" for="loginFrom__textfield">accessToke</label>
            <input type="text" class="form-control" id="loginFrom__textfield" placeholder="accessToken...">
          </div>
          <button type="button" class="btn btn-default" @click.prevent="signIn">Sign in</button>
        </form>
      </div>
    </div>
  </transition>
</template>

<script>
  export default {
    data() {
      return {
        $input: null
      };
    },

    props: {
      show: {
        type: Boolean,
        default: false
      }
    },

    mounted() {
      this.$input = document.getElementById('loginFrom__textfield');
    },

    methods: {
      signIn() {
        const token = this.$input.value;

        if (!token) {
          return;
        }

        this.$emit('signIn', token);
      }
    }
  };
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .fade-slide-enter-active,
  .fade-slide-leave-active {
    transition: all .2s linear;
  }

  .fade-slide-enter,
  .fade-slide-leave-active {
    opacity: 0;
    transform: translate3d(0, -5px, 0);
  }

  .loginForm {
    position: absolute;
    left: -122px;
    top: 54px;
    &-menu {
      background-color: #fff;
      padding: 12px;
      width: 300px;
      &::before {
        top: -8px;
        border-bottom: 8px solid #e7eaf1;
      }
      &::after {
        top: -7px;
        border-bottom: 8px solid #ffffff;
      }
    }
  }
</style>
