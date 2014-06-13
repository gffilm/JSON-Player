{
  "course": {
    "title": "not set",
    "description": "not set"
  },
  "loader": {
    "layout": "basic",
    "layoutContent": "welcomeContent"
  },
  "player": {
    "layout": "player",
    "style": "player",
    "styleContent": "playerCss",
    "layoutContent": "playerContent"
  },
  "playerContent": {
    "id": "player",
    "class": "jp-player",
    "buttons":[
        {"button": true, "id": "menu", "html":"home", "tabIndex": 1},
        {"button": true, "id": "cc", "html":"transcript", "tabIndex": 2},
        {"button": true, "id": "mute", "html":"mute", "tabIndex": 3},
        {"button": false, "id": "title",  "class": "title", "html":"course title", "tabIndex": 4},
        {"button": true, "id": "play", "html":"play", "tabIndex": 5},
        {"button": true, "id": "pause", "html":"pause", "tabIndex": 6},
        {"button": true, "id": "next", "html":"next", "tabIndex": 7}
      ]
  },
  "playerCss": {
    "buttonColor":"#5f5f5f",
    "buttonBgColor":"#000",
    "buttonHoverColor":"#ccc",
    "buttonBgHoverColor":"#222",
    "progressBarColor":"#a58306"
  }
}