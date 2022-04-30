<template>
  <div>
    <div id="chatlioWidgetPlaceholder"></div>
    <!--b-button class="is-primary is-outlined" id="chatlio-custom-button-control-room" onclick="_chatlio.showOrHide();" data-chatlio-widget-button>
        <slot>Help Chat</slot>
    </b-button-->
  </div>
</template>

<script>
export default {
  data() {
    return {
      chatlio_ready: false,
      chatlio_showing: false,
    };
  },
  created() {},
  mounted() {
    console.log("in chatlio mounted");
    if (window._chatlio) {
      console.log("chatlio already loaded...");
    } else {
      console.log("initializing chatlio...");
      this.init_chatlio();
    }

    var openedText = "Close chat window"; // change me
    var closedText = "Start chat"; // change me
    var updateCustomButtons = function (visibility) {
      var btns = document.querySelectorAll("[data-chatlio-widget-button]");
      for (var i = 0; i < btns.length; i++) {
        var btn = btns[i];
        btns[i].innerHTML = visibility === "open" ? openedText : closedText;
      }
    };
    document.addEventListener("chatlio.ready", function (e, data) {
      updateCustomButtons(e.data.visibility);
    });
    document.addEventListener("chatlio.visibilityChange", function (e, data) {
      updateCustomButtons(e.data.visibility);
    });
  },
  methods: {
    init_chatlio() {
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
        n.setAttribute(
          "data-widget-id",
          "b1ddbfda-9e94-4d0b-49ef-cb7831fe03c0"
        );
        //n.setAttribute('data-widget-options', '{"embedInline": true}');
        //n.setAttribute("data-start-hidden", true);
        n.setAttribute("data-chatlio-debug", true);

        c.parentNode.insertBefore(n, c);
      })();
    },
  },
};
</script>

<style>
#chatlio-widget {
  color-scheme: light;
}
#chatlio-widget-container {
  right: 90px;
  bottom: 10px;
}
#chatlio-custom-button-control-room {
  position: absolute;
  bottom: 65px;
  right: 60px;
  z-index: 1000;
}
#chatlioWidgetPlaceholder {
  margin: auto;
  height: 400px;
  width: 300px;
  position: absolute;
  bottom: 95px;
  right: 60px;
}
</style>