//for text highlighting
let Inline = Quill.import('blots/inline'); 
class MarkBlot extends Inline { }; 
MarkBlot.blotName = 'mark'; 
MarkBlot.tagName = 'mark'; 
Quill.register(MarkBlot);


function parseWordDocxFile(inputElement) {
    var files = inputElement.files || [];
    if (!files.length) return;
    var file = files[0];

    console.time();
    var reader = new FileReader();
    reader.onloadend = function(event) {
      var arrayBuffer = reader.result;
      // debugger

      mammoth.convertToHtml({arrayBuffer: arrayBuffer}).then(function (resultObject) {
        output.innerHTML = resultObject.value
      })
      console.timeEnd();
    };
    reader.readAsArrayBuffer(file);
  }

  
var self = this; 
//Create an observable array to display the text that you highlight with your cursor.
self.selectedText = ko.observableArray([]);

function Initialize() {
var quill = new Quill('#editor', {
modules: {            // Include syntax module
},
theme: 'snow'
});
quill.setContents();
const value = document.getElementById('output').textContent
const delta = quill.clipboard.convert(value)
quill.setContents(delta, 'silent')

//this is the "AI" automatic highlighting
let length = quill.getLength()
var text = quill.getText(0, length);
for(let i = 0; i < length; ++i) {
if(keyWordPatternMatcher(i, text, length) ) {
    findNextPeriodAndHighlight(i, text);
  }
}

function keyWordPatternMatcher(startIndex, text, length) {
if(text.length - startIndex > 10) { //ensures there will be no out of bounds/ useless highlights
  if(recursiveKeyWordMatcher("This", text, startIndex)){
        return true;
      }
    }
return false;
}

function recursiveKeyWordMatcher(word, text, startIndex) {
  if(word === "") {
    return true;
  } else if(word[0] === text[startIndex]) {
    return recursiveKeyWordMatcher(word.slice(1,word.length), text, (startIndex+1));
  } else {
    return false;
  }
}


function findNextPeriodAndHighlight(startIndex, text) {
for(let i = startIndex; i < text.length; ++i) {
  if(text[i] === '.') {
    quill.formatText(startIndex, i - startIndex, {                   
        'mark': true
        });
        highlightedText = text.slice(startIndex, i);
        self.selectedText.push(highlightedText);
        return 0;
      }
    }
}

function ViewModel(){

//This function will be called when you make a change in the text, in this case, highlighting a word. 
quill.on('selection-change', function(range, oldRange, source){
    //This will get the text range that you highlighted.
    var text = quill.getText(range.index, range.length);
    if(self.selectedText().includes(text)){
        quill.formatText(range.index, range.length, {                   
        'mark': false
    });
        self.selectedText.remove(text);
    } else if(text.length > 0) {
        quill.formatText(range.index, range.length, 'mark', true);
      self.selectedText.push(text);
    }
})
}
ko.applyBindings(new ViewModel());
}
