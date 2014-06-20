
/*
 * The player class
 * @param {string} name the player name.
 * @extends jp.layer
*/
jp.player = function(name) {
  jp.base(this, name);

  this.isReady_ = false;

  this.page_ = new jp.layer('c0001');

  // Set the parent to this instance
  this.page_.setParent(this);
  this.setChildren(this.page_);
  jp.events.listen(this, jp.events.activated, jp.bind(this.activatePage, this));
};
jp.inherits(jp.player, jp.layer);


jp.player.prototype.activatePage = function() {
  if (!this.page_.isActivated()) {
    this.page_.activate();
  }
};

