{
  "player": {
    "layout": "player",
    "style": ["canvas", "player"],
    "styleContext": "playerCss",
    "layoutContext": "playerLayout",
    "modelContext": "playerModel"
  },
  "playerLayout": {
    "id": "player",
    "class": "jp-player",
    "elements":[
        {"id": "skip-nav","class": "hidden", "localizedId":"player.skipContent", "tabIndex": 1},
        {"id": "reboot","class": "button", "localizedId":"player.reboot", "tabIndex": 1},
        {"id": "menu","class": "button", "localizedId":"player.home", "tabIndex": 2},
        {"id": "cc", "class": "button", "localizedId":"player.cc", "tabIndex": 3},
        {"id": "mute","class": "button", "localizedId":"player.mute", "tabIndex": 4},
        {"id": "title",  "class": "title", "localizedId":"course.title", "tabIndex": 5},
        {"id": "play","class": "button", "localizedId":"player.play", "tabIndex": 6},
        {"id": "pause","class": "button", "localizedId":"player.pause", "tabIndex": 7},
        {"id": "next","class": "button", "localizedId":"player.next", "tabIndex": 8},
        {"id": "skip-target","class": "hidden", "localizedId":"player.skipTarget", "tabIndex": 9}
      ]
  },
  "playerModel": {
    "buttonMap":[
        {"id": "reboot", "function": "restart"}
      ]
  },
  "playerCss": {
    "buttonColor":"#5f5f5f",
    "buttonBgColor":"#000",
    "buttonHoverColor":"#ccc",
    "buttonBgHoverColor":"#222",
    "progressBarColor":"#a58306",
    "focus":"3px solid #d85a1a",
    "buttonBorder": "2px solid #009496"
  }
}