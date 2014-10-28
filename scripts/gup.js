"use strict";

function gup(name, default_) {
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
  var results = regex.exec(window.location.href);
  if (results == null)
    return default_;
  else
    return results[1];
}
