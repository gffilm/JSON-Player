{
  "player": {
    "layout": "player",
    "style": ["canvas", "player"],
    "styleContext": "playerContext",
    "layoutContext": "playerLayout",
    "modelContext": "playerModel"
  },
  "playerLayout": {
    "id": "player",
    "class": "jp-player",
    "elements":[
        {"id": "skip-nav","class": "hidden", "html":"player.skipContent", "tabIndex": 1},
        {"id": "reboot","class": "button", "html":"player.reboot", "tabIndex": 1},
        {"id": "menu","class": "button", "title":"player.menuTitle", "html":"player.menu", "tabIndex": 2},
        {"id": "cc", "class": "button", "title":"player.cc", "tabIndex": 3},
        {"id": "mute","class": "button", "title":"player.mute", "tabIndex": 4},
        {"id": "title",  "class": "title", "html":"course.title", "tabIndex": 5},
        {"id": "back","class": "button", "title":"player.back", "tabIndex": 6},
        {"id": "play","class": "button", "title":"player.play", "tabIndex": 7},
        {"id": "next","class": "button", "title":"player.next", "tabIndex": 8},
        {"id": "skip-target","class": "hidden", "html":"player.skipTarget", "tabIndex": 9}
      ]
  },
  "playerModel": {
    "buttonMap":[
        {"id": "reboot", "function": "restart"}
      ]
  },
  "playerContext": {
    "bodyFont": "fontFamily1",
    "menuButton": "gradient1",
    "menuButtonHover": "gradient1",
    "controlBarBg":"gradient2",
    "controlBarButtonBg":"gradient2",
    "menuButtonBgHover":"gradient0",
    "controlBarText":"color1",
    "controlBarTextHover": "color1",
    "progressBarBg":"gradient2",
    "controlBarButton":"color1",
    "controlBarButtonHover":"color2",
    "focus": "outline1",
    "canvasBorder": "border3"
  }
}