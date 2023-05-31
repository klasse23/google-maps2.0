const title = document.title.replace(" – Program Stoppested verden", "")
const attachmentPoint = document.getElementsByClassName("page-content")

const regexPattern = /\[(.*?)\]\((.*?)\)/g
const regexStraightLink = /(?<!href=[\'\"])(https?:\/\/[^\s]+)/g
const defaultPath = "https://program.stoppestedverden.no/wp-content/plugins/Klasse23/"


function getPageData(){
    console.log("Starting")
    fetch("https://program.stoppestedverden.no/wp-content/plugins/Klasse23/pages.json")
     .then((response) => response.json())
     .then((data) => {
        for(let category of Object.keys(data["category"])){
            if(data["category"][category]["pages"][title] !== undefined){
                console.log("Found Correct Activity")
                createPage(category, data["category"][category]["pages"][title], data["category"][category].color)
                break
            }
        }
     })
}

getPageData()



function createPage(category, pageData, color) {
    
    console.log(pageData["Land"],category, pageData)
    const newContainer = document.createElement("div");
    newContainer.classList.add("custom-page-container")
    
    
    
    let Land = pageData.Land.toLowerCase()
    newContainer.innerHTML = 
    `
    <img src="${pageData["1280x844"]}" class="cover-bilde">
    <button class="Kategori-knapp" style="background-color:${color};">${category}</button>
    <div id="middle-info">
        <h4 class="Land">${pageData.Land}</h4>
        <h1 class="Side-Tittel">${title}</h1>
         <audio controls class="Lyd-avspiller" style="visibility: hidden;"">
          Browser does not support this audio!
         </audio>
        <p id="page-content"></p>
    </div>
    <link rel="stylesheet" type="text/css" href="https://program.stoppestedverden.no/wp-content/plugins/Klasse23/style.css" />`
    attachmentPoint[0].appendChild(newContainer);
    
    addAudio(Land)
    addText(title+".txt");
}
async function getAudio(Land, fileType, format, audioController){
    return fetch(defaultPath+`Lydfiler/${fileType}/${Land.charAt(0).toUpperCase() + Land.slice(1) + " " + title}.${fileType}`)
        .then(e=>{
        if(e.status=="200"){
            console.log("eeeeee", audioController)
            audioController.style.visibility = "visible"
            let audioString = `<source src="${defaultPath}Lydfiler/${fileType}/${Land.charAt(0).toUpperCase() + Land.slice(1) + " " + title}.${fileType}" type="${format}" />`
            return audioString
        } else {
            console.log("No audio file found!")
            return ""
        }})
}

async function addAudio(Land){
    let controller = document.getElementsByClassName("Lyd-avspiller")
    
    controller[0].innerHTML = `
    ${await getAudio(Land, "mp3", "audio/mpeg", controller[0])}
    ${await getAudio(Land, "ogg", "audio/ogg", controller[0])}
    Browser no supporty
    `
}

function addText(textLocation){
    
    
    fetch(`https://program.stoppestedverden.no/wp-content/plugins/Klasse23/Text/${textLocation}`)
    .then((response) => response.text())
    .then((data)=> {
        console.log(data.replace(regexPattern, "<a class'textlinks' href='$1'>$2</a>"))
         try {
            data = data.replace(regexPattern, "<a class'textlinks' href='$1'>$2</a>")//.replace(regexStraightLink, "<a class'textLinks' href='$1'>$1</a>")         //Something is breaking
         } catch(err) {
            console.log(err)
         }
        
        document.getElementById("page-content").innerHTML = data//.replace(regexPattern, "<a class'textlinks' href='$1'>$2</a>")//.replace(regexStraightLink, "<a class'textLinks' href='$1'>$1</a>")
        document.getElementById("page-content").innerHTML += "Test TExt" 
        
        //Something is breaking
    })
    
    
}