<template>
  <transition name="fade">
    <div class="modal post-modal">
      <div class="modal-backdrop fade in" @click.stop="close"></div>
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" @click.stop="close"><span aria-hidden="true">×</span><span class="sr-only">Close</span></button>
            <h4 class="modal-title">发布文章</h4>
          </div>
          <div class="modal-body">
            <div class="post-type">
              <span class="post__label">类型：</span>
              <div class="post-type__items">
                <span v-for="(val, key) in categories"
                      :data-type="key"
                      :class="selectedCategory === key ? 'active' : ''"
                      @click="selectType($event)">{{ val }}</span>
              </div>

            </div>
            <div class="post-info">
              <div class="post-title">
                <input type="text" class="form-control" placeholder="标题" v-model="title">
              </div>
              <div class="post-content">
                <label for="post" aria-hidden="true"></label>
                <textarea name="post" id="post"></textarea>
              </div>
              <button class="btn btn-primary" @click="postArticle($event)">发布</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
  import { articleCategory } from '../js/config';
  import createSimplemde from '../js/createSimplemde';

  export default {
    data() {
      return {
        mde: null,
        categories: articleCategory,
        selectedCategory: '',
        title: ''
      };
    },

    props: {
      article: {
        type: Object,
        default: null
      }
    },

    mounted() {
      this.mde = createSimplemde({
        element: document.getElementById('post')
      });
    },

    watch: {
      article(newVal) {
        if (newVal) {
          this.selectedCategory = newVal.tab;
          this.title = newVal.title;
          this.mde.value(newVal.content);
        }
      }
    },

    methods: {
      close() {
        this.selectedCategory = '';
        this.title = '';
        this.mde.value('');
        this.$emit('close');
      },

      selectType(evt) {
        const target = evt.target;

        this.selectedCategory = target.dataset.type;
      },

      postArticle() {
        const content = this.mde.value();

        const params = {
          title: this.title,
          tab: this.selectedCategory,
          content
        };

        this.$emit('postTopic', params);
      }
    }
  };
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  @import '../scss/variable';

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity .15s linear;
  }

  .fade-enter,
  .fade-leave-active {
    opacity: 0;
  }

  .post-modal {
    display: block;
    .modal-content {
      animation-fill-mode: both;
      opacity: 1;
      animation-duration: .75s;
      animation-name: fadeInDown;
      animation-delay: .2s;
    }
  }

  .post__label {
    display: inline-block;
    padding: 5px 0;
    font-size: 14px;
    font-weight: 400;
    line-height: 1;
    color: #6e6e6e;
  }

  .post-type {
    margin-bottom: 15px;

    &__items {
      display: inline-block;
      > span {
        display: inline-block;
        margin-right: 10px;
        border: 1px solid #dedede;
        padding: 2px 10px;
        border-radius: 20px;
        color: #8f8f8f;
        transition: all 0.2s;
        cursor: pointer;
        &.active,
        &:hover {
          border-color: $blue-base;
          color: $blue-base;
        }
      }
    }
  }

  .btn-primary {
    margin-top: 15px;
  }

  @-webkit-keyframes fadeInDown {
    0% {
      opacity: 0;
      -webkit-transform: translate3d(0,-100%,0);
      transform: translate3d(0,-100%,0)
    }

    100% {
      opacity: 1;
      -webkit-transform: none;
      transform: none
    }
  }

  @keyframes fadeInDown {
    0% {
      opacity: 0;
      -webkit-transform: translate3d(0,-100%,0);
      transform: translate3d(0,-100%,0)
    }

    100% {
      opacity: 1;
      -webkit-transform: none;
      transform: none
    }
  }
</style>
