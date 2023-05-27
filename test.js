const regexPattern = /\[(.*?)\]\((.*?)\)/g
const regexStraightLink = /(?<!href=[\'\"])(https?:\/\/[^\s]+)/g
const l ="./Text/Magedans.txt"
var fs = require("fs");
function addText(textLocation){
    
        
        
        fs.readFile(l, 'utf8', function(err,data){

          console.log(data.replace(regexPattern, "<a class'textlinks' href='$1'>$2</a>").replace(regexStraightLink, "<a class'textlinks' href='$1'>$1</a>"))
        
         
          
        });
   
    
    
    
}
addText("Magedans.txt")