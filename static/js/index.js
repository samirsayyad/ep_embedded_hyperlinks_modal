var _, $, jQuery;
var $ = require('ep_etherpad-lite/static/js/rjquery').$;
var _ = require('ep_etherpad-lite/static/js/underscore');
var shared = require("./shared")
var ep_embedded_hyperlinks_modal = require("./ep_embedded_hyperlinks_modal")
var preLinkMarker = require("./preLinkMarker")
/* Bind the event handler to the toolbar buttons */
exports.postAceInit = function(hook, context) {
  if(!pad.plugins) pad.plugins = {};
  var Links = ep_embedded_hyperlinks_modal.init(context);
  pad.plugins.ep_embedded_hyperlinks_modal = Links;



  var padOuter = $('iframe[name="ace_outer"]').contents();
  var padInner = padOuter.find('iframe[name="ace_inner"]').contents();
  var outerBody = padOuter.find("#outerdocbody");
  var innerBody = padInner.find("#innerdocbody");


  innerBody.contents().on("click", ".ep_embedded_hyperlinks_modal", function(e){
    console.log( $(this).select())
    context.ace.callWithAce(function(ace) {
        var saveRep = ace.ace_getRep();
        console.log(saveRep)
        lineText = ace.ace_getHighlightedText();
  }, 'selectingLink', true);
  });




    if (!$('#editorcontainerbox').hasClass('flex-layout')) {
        $.gritter.add({
            title: "Error",
            text: "ep_embedded_hyperlinks_modal: Please upgrade to etherpad 1.9 for this plugin to work correctly",
            sticky: true,
            class_name: "error"
        })
    }
    $("#ep_embedded_hyperlinks_modal").on("click",function(e){
        console.log("I called",e)
    })
    /* Event: User clicks editbar button */
    $('.hyperlink-icon').on('click',function(e) {
        e.preventDefault(); // stops focus from being lost
        var rep = {};
        context.ace.callWithAce(shared.doNothing, 'markPreSelectedTextToLink', true);
        context.ace.callWithAce(function(ace) {
            //var saveRep = ace.ace_getRep();
            //rep.lines    = saveRep.lines;
            //rep.selStart = saveRep.selStart;
            //rep.selEnd   = saveRep.selEnd;
            //rep.selectedLine = ace.ace_doFindHighlightedText();
            rep.lineText = ace.ace_getHighlightedText();
      }, 'selectingLink', true);

      var selectedElement = innerBody.find("."+preLinkMarker.MARK_CLASS)
      var position = selectedElement.position()
      console.log(position)
      $("#hyperlink-text").val(rep.lineText)
      $('.hyperlink-dialog').toggleClass('popup-show');
      $('.hyperlink-dialog').css('top', position.top+82);
      $('.hyperlink-dialog').css('left', position.left);
        
      //$('.hyperlink-dialog').css('left', $('.hyperlink-icon').offset().left - 12);

    });
    /* Event: User creates new hyperlink */
    $('.hyperlink-save').on('click',function() {
        var url = $('.hyperlink-url').val();
        context.ace.callWithAce(function(ace) {
            
            ace.ace_doInsertLink(url);
        }, 'insertLink', true);
        $('.hyperlink-url').val('');
        $('.hyperlink-dialog').removeClass('popup-show');
    });
    /* User press Enter on url input */
    $('.hyperlink-url').on("keyup", function(e)
    {
        if(e.keyCode == 13) // ENTER key
        {
          $('.hyperlink-save').click();
        }
    });
}

exports.aceAttribsToClasses = function(hook, context) {
    console.log(hook, context)
    if(context.key == 'url'){
        var url = context.value;
        return ['url-' + url ];
    }

    // only read marks made by current user
    if(context.key === preLinkMarker.MARK_CLASS && context.value === clientVars.userId) {
        return [preLinkMarker.MARK_CLASS, context.value];
    }
}

/* Convert the classes into a tag */
exports.aceCreateDomLine = function(name, context) {
    var cls = context.cls;
    var domline = context.domline;
    var url = /(?:^| )url-(\S*)/.exec(cls);
    var modifier = {};
    if(url != null) {
        url = url[1];

        if(!(/^http:\/\//.test(url)) && !(/^https:\/\//.test(url))) {
            url = "http://" + url;
        }

        modifier = {
            // extraOpenTags: '<a href="' + url + '">',
            // extraCloseTags: '</a>',
            // cls: cls
             extraOpenTags: '<a class="ep_embedded_hyperlinks_modal" data-text="'+cls+'" data-href="' + url + '">',
             extraCloseTags: '</a>',
             cls: cls
            
        }
        return modifier;
    }

    return [];
}

/* I don't know what this does */
exports.aceInitialized = function(hook, context) {
    var editorInfo = context.editorInfo;

    editorInfo.ace_doInsertLink = _(doInsertLink).bind(context);
    editorInfo.ace_doFindHighlightedText = _(doFindHighlightedText).bind(context);
    editorInfo.ace_getHighlightedText = _(getHighlightedText).bind(context);


}

exports.collectContentPre = function(hook,context) {
    var url = /(?:^| )url-(\S*)/.exec(context.cls);
    if(url) {
        context.cc.doAttrib(context.state,"url::" + url);
    }
}



function getHighlightedText(){
    var rep = this.rep
    var line = rep.lines.atIndex( rep.selEnd[0]);
    var lineText = line.text.substring(rep.selStart[1],  rep.selEnd[1]);
    return lineText
}

function doFindHighlightedText(){
    var rep = this.rep
    var line = rep.lines.atIndex( rep.selEnd[0]);
    return line
  }
  function doInsertLink(url) {
      var rep = this.rep,
          documentAttributeManager = this.documentAttributeManager;
      if(!(rep.selStart && rep.selEnd)) {
          return;
      }
      var url = ["url",url];
      documentAttributeManager.setAttributesOnRange(rep.selStart, rep.selEnd, [url]);
  }
  