var _, $, jQuery;
var $ = require('ep_etherpad-lite/static/js/rjquery').$;
var _ = require('ep_etherpad-lite/static/js/underscore');

/* Bind the event handler to the toolbar buttons */
exports.postAceInit = function(hook, context) {
    if (!$('#editorcontainerbox').hasClass('flex-layout')) {
        $.gritter.add({
            title: "Error",
            text: "Ep_embed_hyperlink2: Please upgrade to etherpad 1.9 for this plugin to work correctly",
            sticky: true,
            class_name: "error"
        })
    }
    /* Event: User clicks editbar button */
    $('.hyperlink-icon').on('click',function() {
        $('.hyperlink-dialog').toggleClass('popup-show');
        $('.hyperlink-dialog').css('left', $('.hyperlink-icon').offset().left - 12);
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
            extraOpenTags: '<a href="' + url + '">',
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
}

function doInsertLink(url) {
    var rep = this.rep,
        documentAttributeManager = this.documentAttributeManager;
    if(!(rep.selStart && rep.selEnd)) {
        return;
    }
    var url = ["url",url];
    console.log(url,rep)
    documentAttributeManager.setAttributesOnRange(rep.selStart, rep.selEnd, [url]);
}

exports.collectContentPre = function(hook,context) {
    var url = /(?:^| )url-(\S*)/.exec(context.cls);
    if(url) {
        context.cc.doAttrib(context.state,"url::" + url);
    }
}



lastLineSelectedIsEmpty = function(rep, lastLineSelected){
    var line = rep.lines.atIndex(lastLineSelected);
    // when we've a line with line attribute, the first char line position
    // in a line is 1 because of the *, otherwise is 0
    var firstCharLinePosition = lineHasMarker(line) ? 1 : 0;
    var lastColumnSelected = rep.selEnd[1];
  
    return lastColumnSelected === firstCharLinePosition;
  }
getLastLine = function(firstLine, rep){
    var lastLineSelected = rep.selEnd[0];
  
    if (lastLineSelected > firstLine){
      // Ignore last line if the selected text of it it is empty
      if(lastLineSelectedIsEmpty(rep, lastLineSelected)){
        lastLineSelected--;
      }
    }
    return lastLineSelected;
  }
  
// Get a string representation of the text selected on the editor
getSelectedText = function(rep) {
    var self = this;
    var firstLine = rep.selStart[0];
    var lastLine = self.getLastLine(firstLine, rep);
    console.log("last line")
    var selectedText = "";
  
    _(_.range(firstLine, lastLine + 1)).each(function(lineNumber){
       // rep looks like -- starts at line 2, character 1, ends at line 4 char 1
       /*
       {
          rep.selStart[2,0],
          rep.selEnd[4,2]
       }
       */
       var line = rep.lines.atIndex(lineNumber);
       // If we span over multiple lines
       if(rep.selStart[0] === lineNumber){
         // Is this the first line?
         if(rep.selStart[1] > 0){
           var posStart = rep.selStart[1];
         }else{
           var posStart = 0;
         }
       }
       if(rep.selEnd[0] === lineNumber){
         if(rep.selEnd[1] <= line.text.length){
           var posEnd = rep.selEnd[1];
         }else{
           var posEnd = 0;
         }
       }
       var lineText = line.text.substring(posStart, posEnd);
       // When it has a selection with more than one line we select at least the beginning
       // of the next line after the first line. As it is not possible to select the beginning
       // of the first line, we skip it.
       if(lineNumber > firstLine){
        // if the selection takes the very beginning of line, and the element has a lineMarker,
        // it means we select the * as well, so we need to clean it from the text selected
        lineText = cleanLine(line, lineText);
        lineText = '\n' + lineText;
       }
       selectedText += lineText;
    });
    return selectedText;
  }

  
  cleanLine = function(line, lineText){
    var hasALineMarker = lineHasMarker(line);
    if(hasALineMarker){
      lineText = lineText.substring(1);
    }
    return lineText;
  }

  lineHasMarker = function(line){
    return line.lineMarker === 1;
  }

  