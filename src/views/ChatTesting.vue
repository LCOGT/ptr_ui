<template>
  <div class="about container">
    <SiteNavbar />
    <slot>
      <div class="description-text">
        <h1 class="title">Photon Ranch - Chat support test page</h1>
        <!--p>id: {{ userId }}</p>
        <p>name: {{ userName }}</p>
        <p>email: {{ userEmail }}</p>
        <p>nickname: {{ userNickname }}</p-->
      </div>

      <!--div id="chatlioWidgetPlaceholder" style=" position: absolute; right: 50px; bottom: 50px; margin: auto; height: 600px; width: 400px; " ></div-->

    </slot>
  </div>
</template>

<script>
import SiteNavbar from "@/components/SiteNavbar";
import { user_mixin } from "@/mixins/user_mixin";
export default {
  components: {
    SiteNavbar,
  },
  mixins: [user_mixin],
  beforeRouteLeave(to, from, next) {
    //console.log('in BEFORE ROUTE LEAVE')
    this.remove()

    next()
  },
  methods: {
      remove() {
        var n = document.getElementById('chatlio-widget')
        console.log('element to remove: ', n)
        n.remove()
      }
  },
  mounted() {

    window._chatlio = window._chatlio || [];
    !(function () {
      var t = document.getElementById("chatlio-widget-embed");
      if (t && window.ChatlioReact && _chatlio.init)
        return void _chatlio.init(t, ChatlioReact);
      for (
        var e = function (t) {
            return function () {
              _chatlio.push([t].concat(arguments));
            };
          },
          i = [
            "configure",
            "identify",
            "track",
            "show",
            "hide",
            "isShown",
            "isOnline",
            "page",
            "open",
            "showOrHide",
          ],
          a = 0;
        a < i.length;
        a++
      )
        _chatlio[i[a]] || (_chatlio[i[a]] = e(i[a]));
      var n = document.createElement("script"),
        c = document.getElementsByTagName("script")[0];
      (n.id = "chatlio-widget-embed"),
        (n.src = "https://w.chatlio.com/w.chatlio-widget.js"),
        (n.async = !0),
        n.setAttribute("data-embed-version", "2.3");
      n.setAttribute("data-widget-id", "b1ddbfda-9e94-4d0b-49ef-cb7831fe03c0");
      c.parentNode.insertBefore(n, c);

    })();

    if (this.userIsAuthenticated) {
        _chatlio.identify(this.userId, {
            name: this.userName,
            email: this.userEmail,
            nickname: this.userNickname,
        })

    }

    console.log(_chatlio);
  },
    watch: {
        userIsAuthenticated() {
            _chatlio.reset()
            console.log('user auth switch')
            console.log(_chatlio)
            if (this.userIsAuthenticated) {
                _chatlio.identify(this.userId, {
                    name: this.userName,
                    email: this.userEmail,
                    nickname: this.userNickname,
                })
            }
        }
    },
};
</script>

<style lang="scss" scoped>
.about {
  min-height: 100vh;
}
.description-text {
  margin: 2em;
}
</style>
