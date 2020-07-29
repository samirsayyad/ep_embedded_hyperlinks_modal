exports.aceEditEvent = function(hook, context){

    var eventType = context.callstack.editEvent.eventType;
    if(eventType === "markPreSelectedTextToLink") {
        pad.plugins.ep_embedded_hyperlinks_modal.preLinkMarker.handleMarkText(context);

    }
    if(eventType === "unmarkPreSelectedTextToComment") {
        pad.plugins.ep_embedded_hyperlinks_modal.preLinkMarker.handleUnmarkText(context);
    }

 
}