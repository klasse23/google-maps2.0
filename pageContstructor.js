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
    let pathi = "https://program.stoppestedverden.no/wp-content/plugins/Klasse23/"
    console.log(pageData["Land"],category, pageData)
    const newContainer = document.createElement("div");
    newContainer.classList.add("custom-page-container")
    newContainer.innerHTML = 
    `
    <img src="${pageData["1280x844"]}" class="cover-bilde">
    <button class="Kategori-knapp" style="background-color:${color};">${category}</button>
    <div id="middle-info">
        <h4 class="Land">${pageData.Land}</h4>
        <h1 class="Side-Tittel">${title}</h1>
        <audio controls class="Lyd-avspiller">
            <source src="${pathi}/Lydfiler/mp3/${pageData.Land + " " + title}.mp3" type="audio/mpeg" />
            <source src="${pathi}/Lydfiler/ogg/${pageData.Land + " " + title}.ogg" type="audio/ogg" />

            <!-- fallback for non-supporting browsers goes here -->
            <p>
                Hmmm.. Fikk ikke spilt av lyd, men du kan laste det ned her!
                <a href="${pathi}/Lydfiler/mp3/${pageData.Land + " " + title}.mp3">download the music</a>.
            </p>
        </audio>
    
        <p id="page-content"></p>
    </div>
    <link rel="stylesheet" type="text/css" href="https://program.stoppestedverden.no/wp-content/plugins/Klasse23/style.css" />`
    attachmentPoint[0].appendChild(newContainer);
    
    
    addText(title+".txt");
}


function addText(textLocation){
    
    
    fetch(`https://program.stoppestedverden.no/wp-content/plugins/Klasse23/Text/${textLocation}`)
    .then((response) => response.text())
    .then((data)=> {
        console.log(data)
         document.getElementById("page-content").innerHTML = data
         //Something is breaking
    })
    
    
}