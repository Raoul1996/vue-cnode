<template>
  <header class="globalnav globalnav--fixed" :class="{ 'is-loading': isLoading }">
    <div class="container">
      <router-link to="/" class="globalnav__brand t-pull-left">CNode</router-link>
      <div class="spinner"></div>
      <ul class="globalnav__nav t-pull-right">
        <li class="globalnav__link" v-if="!host">
          <a href="#" @click.stop.prevent="toggleMenu(1)">登录</a>
          <div class="globalnav__menu globalnav__loginFormMenu">
            <loginForm @signIn="getHost" :show="showLoginForm"></loginForm>
          </div>
        </li>

        <li class="globalnav__link" v-if="host">
          <router-link :to="{ path: '/user/' + host.loginname }" class="globalnav__avatar">
            <img :src="host.avatar_url">
          </router-link>
        </li>

        <li class="globalnav__link globalnav__link--withicon globalnav__notifies" v-if="host">
          <a href="#" :class="{ 'is-active': host.notifiesCount }"
             @click.stop.prevent="toggleMenu(2)">
            <i class="fa fa-envelope fa-lg" aria-hidden="true"></i>
          </a>
          <div class="globalnav__menu globalnav__notificationMenu">
            <Notification :show="showNotification"></Notification>
          </div>
        </li>

        <li class="globalnav__link globalnav__link--withicon">
          <a href="#" @click.stop.prevent="toggleMenu(3)">
            <i class="fa fa-ellipsis-h fa-lg" aria-hidden="true"></i>
          </a>
          <div class="globalnav__menu">
            <transition name="menu-fade-slide">
              <div class="menu menu--arrowed moremenu" v-show="showMoreMenu">
                <ul>
                  <li>
                    <a href="https://cnodejs.org/" target="_blank">真·官网</a>
                  </li>
                  <li>
                    <a href="https://github.com/jiananle/vue-cnode" target="_blank">项目地址</a>
                  </li>
                  <li>
                    <a href="https://jiananle.github.io/vue-cnode/index.html#/" target="_blank">预览</a>
                  </li>
                </ul>
              </div>
            </transition>
          </div>
        </li>
      </ul>
      <ul class="globalnav__nav">
        <slot></slot>
      </ul>
    </div>
  </header>
</template>
<script>
  import Tools from '../js/tools';
  import loginForm from './LoginForm';
  import Notification from './Notification';

  export default {
    data() {
      return {
        host: null,
        showLoginForm: false, // loginFrom
        showNotification: false, // Notification
        showMoreMenu: false // moreMenu
      };
    },

    props: {
      isLoading: {
        type: Boolean,
        default: false
      }
    },

    components: {
      loginForm,
      Notification
    },

    mounted() {
      this.getHost();

      // see https://css-tricks.com/dangers-stopping-event-propagation/
      document.documentElement.addEventListener('click', () => {
        let parent = event.target;
        let isInside = false;

        if (this.showNotification || this.showLoginForm || this.showMoreMenu) {
          let checkedClassName;

          if (this.showNotification) {
            checkedClassName = 'globalnav__notificationMenu';
          } else if (this.showLoginForm) {
            checkedClassName = 'globalnav__loginFormMenu';
          } else {
            checkedClassName = 'globalnav__moreMenu';
          }

          while (parent) {
            if (parent.classList && parent.classList.contains(checkedClassName)) {
              isInside = true;
              break;
            }
            parent = parent.parentNode;
          }

          if (!isInside) {
            if (this.showNotification) {
              this.showNotification = false;
            } else if (this.showLoginForm) {
              this.showLoginForm = false;
            } else {
              this.showMoreMenu = false;
            }
          }
        }
      }, false);
    },

    methods: {
      // 请求登录的用户
      getHost(token) {
        const auth = Tools.getHost(token);

        auth.then((data) => {
          this.host = data;
          this.showLoginForm = false;

          setTimeout(() => {
            this.$emit('ready', data);
          }, 1000);
        }, (errorMsg) => {
          this.host = null;
          this.$message.error(errorMsg);
        });
      },

      toggleMenu(type) {
        switch (type) {
          case 1: // loginForm
            this.showNotification = false;
            this.showMoreMenu = false;
            this.showLoginForm = !this.showLoginForm;
            break;
          case 2: // notification
            this.showLoginForm = false;
            this.showMoreMenu = false;
            this.showNotification = !this.showNotification;
            break;
          case 3: // moreMenu
            this.showNotification = false;
            this.showLoginForm = false;
            this.showMoreMenu = !this.showMoreMenu;
            break;
          default:
            return;
        }
      }
    }
  };
</script>
