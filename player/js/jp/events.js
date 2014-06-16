
/*
 * All event types
*/

jp.events = {
  layoutLoad: 'layoutLoad',
  styleLoad: 'styleLoad',
  styleLoaded: 'styleLoaded',
  elementRendered: 'elementRendered',
  reboot: 'reboot'
};

/*
 * Listens for an event, using anthropomorphic metaphors to descripe the listener
 * @param {string} ear the listening device.
 * @param {string} sound the specific sound the ear is listening for.
 * @param {string} reaction what to do once the event has been heard.
 * @param {string} self the instance that is listening/
 * @param {*=} backpack any parameters to carry with it to handle the reaction.
*/
jp.events.listen = function(ear, sound, reaction, self, backpack) {
  $(ear).bind(sound, jp.bind(reaction, self, backpack));
};

/*
 * Calls out an event, using anthropomorphic metaphors to descripe the talker.
 * @param {string} self the instance that is talking.
 * @param {string} voice the specific sound the voice is saying.
 
 * @param {*=} backpack any parameters to carry with it to handle the reaction.
*/
jp.events.talk = function(self, voice) {
  $(self).trigger(voice);
};
