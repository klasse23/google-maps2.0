const title = document.title.replace(" – Program Stoppested verden", "")
const attachmentPoint = document.getElementsByClassName("page-content")
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
    newContainer.style = "display:block;"
    newContainer.innerHTML = 
    `
    <img src="${pageData["1280x844"]}" class="cover-bilde">
    <button class="Kategori-knapp" style="background-color:${color};">${category}</button>
    <h4 class="Land">${pageData.Land}</h4>
    <h1 class="Side-Tittel">${title}</h1>
    <audio class="audio-player"></audio>
    <p class="page-content"></p>
    <link rel="stylesheet" type="text/css" href="https://program.stoppestedverden.no/wp-content/plugins/Klasse23/style.css" />`
    attachmentPoint[0].appendChild(newContainer);

    
}


function addText(){
    fetch(`https://program.stoppestedverden.no/wp-content/plugins/Klasse23/`)
 
}