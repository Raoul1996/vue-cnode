<template>
  <transition name="fade">
    <div class="la-container">
      <div class="la-anim" :style="loading()"></div>
    </div>
  </transition>

</template>

<script>
  export default {
    props: {
      percentage: {
        type: Number,
        default: -100,
        required: true,
        validator: val => val >= -100 && val <= 0
      }
    },

    methods: {
      loading() {
        return {
          transform: `translate3d(${this.percentage}%, 0, 0)`
        };
      }
    }
  };
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .fade-enter-active, .fade-leave-active {
    transition: opacity .5s
  }

  .fade-enter, .fade-leave-active {
    opacity: 0
  }

  .la-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 9999;
  }

  .la-anim {
    height: 3px;
    background: #ed4e6e;
    pointer-events: none;
    transform: translate3d(-100%, 0, 0);
    transition: transform .3s ease-in;

    &::after {
      position: absolute;
      top: 0;
      right: 0;
      width: 100px;
      height: 100%;
      background: #ed4e6e;
      box-shadow: 0 0 15px #ed4e6e, 0 0 5px #ed4e6e;
      content: '';
      opacity: 0;
      transition: opacity 0.2s, box-shadow 2s 4s;
      transform: rotate(2deg) translateY(-2px);
    }
  }
</style>
