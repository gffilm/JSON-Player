{
  "course": {
    "title": "Course Title",
    "description": "Course Description"
  },
  "loader": {
    "layout": "basic",
    "layoutContent": "welcomeContent"
  },
  "player": {
    "layout": "player",
    "style": ["canvas", "player"],
    "styleContent": "playerCss",
    "layoutContent": "playerContent"
  },
  "playerContent": {
    "id": "player",
    "class": "jp-player",
    "buttons":[
        {"button": false, "id": "skip-nav","class": "hidden", "html":"skip content", "tabIndex": 1},
        {"button": true, "id": "reboot", "html":"reboot", "tabIndex": 1},
        {"button": true, "id": "menu", "html":"home", "tabIndex": 2},
        {"button": true, "id": "cc", "html":"cc", "tabIndex": 3},
        {"button": true, "id": "mute", "html":"mute", "tabIndex": 4},
        {"button": false, "id": "title",  "class": "title", "html":"course title", "tabIndex": 5},
        {"button": true, "id": "play", "html":"play", "tabIndex": 6},
        {"button": true, "id": "pause", "html":"pause", "tabIndex": 7},
        {"button": true, "id": "next", "html":"next", "tabIndex": 8},
        {"button": false, "id": "skip-target","class": "hidden", "html":"skip target", "tabIndex": 9}
      ]
  },
  "playerCss": {
    "buttonColor":"#5f5f5f",
    "buttonBgColor":"#000",
    "buttonHoverColor":"#ccc",
    "buttonBgHoverColor":"#222",
    "progressBarColor":"#a58306",
    "focus":"3px solid #d85a1a"
  }
}