
var preLinkMarker = require('./preLinkMarker');

// Container
ep_embedded_hyperlinks_modal = function(context){
    console.log("we are here")
    this.padOuter  = null;
    this.padInner  = null;
    this.ace       = context.ace;
    this.padId      = clientVars.padId;
    this.preLinkMarker = preLinkMarker.init(this.ace);
}
ep_embedded_hyperlinks_modal.prototype.init = function(){
    console.log("heloo")
}


exports.init = function(context) {
    return new ep_embedded_hyperlinks_modal(context);
}
  