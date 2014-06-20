
/*
 * The player class
 * @param {string} the model name.
 * @param {Object} the model. 
 * @extends jp.layer
*/
jp.player = function(modelName) {
  jp.base(this, modelName);

  this.isReady_ = false;
  return;

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

