const title = document.title.replace(" – Program Stoppested verden", "")
const attachmentPoint = document.getElementsByClassName("page-content")[0]

//const regexPattern = /\[(.*?)\]\((.*?)\)/g
//const regexStraightLink = /(?<!href=[\'\"])(https?:\/\/[^\s]+)/g
const defaultPath = "https://program.stoppestedverden.no/wp-content/plugins/Klasse23/"


async function getPageData() {
    try {
        const response = await fetch(`${defaultPath}pages.json`);
        const data = await response.json();
        const categoryKey = Object.keys(data["category"]).find(category => data["category"][category]["pages"][title] !== undefined);
        if (categoryKey) {
            createPage(categoryKey, data["category"][categoryKey]["pages"][title], data["category"][categoryKey].color);
        }
    } catch (error) {
        console.error("Error getting page data:", error);
    }
}

getPageData()



function createPage(category, pageData, color) {
    const newContainer = document.createElement("div");
    newContainer.classList.add("custom-page-container");
    const flipState = ["Forestilling", "Konsert", "Utstilling"];
    const Land = pageData.Land.toLowerCase();
    const isFlipState = flipState.includes(category);
    newContainer.innerHTML = `
    <img src="${pageData["1280x844"]}" class="cover-bilde">
    <button class="Kategori-knapp" style="background-color:${color};">${category}</button>
    <div id="middle-info">
        ${isFlipState ? `<h1 class="Side-Tittel">${title}</h1><h4 class="Land">${pageData.Land}</h4>` : `<h4 class="Land">${pageData.Land}</h4><h1 class="Side-Tittel">${title}</h1>`}
        <audio controls class="Lyd-avspiller" style="visibility: hidden;">
          Browser does not support this audio!
        </audio>
        <p id="page-content"></p>
    </div>
    <link rel="stylesheet" type="text/css" href="${defaultPath}style.css" />`;
    attachmentPoint.appendChild(newContainer);
    addAudio(Land);
    addText(pageData.textLocation);
}



async function getAudio(Land, fileType, format, audioController) {
    try {
        const response = await fetch(`${defaultPath}Lydfiler/${fileType}/${Land.charAt(0).toUpperCase() + Land.slice(1) + " " + title}.${fileType}`);
        if (response.ok) {
            audioController.style.visibility = "visible";
            return `<source src="${defaultPath}Lydfiler/${fileType}/${Land.charAt(0).toUpperCase() + Land.slice(1) + " " + title}.${fileType}" type="${format}" />`;
        } else {
            console.log("No audio file found!");
            return "";
        }
    } catch (error) {
        console.error("Error:", error);
        return "";
    }
}

async function addAudio(Land){
    let controller = document.getElementsByClassName("Lyd-avspiller")[0]
    
    controller.innerHTML = `
    ${await getAudio(Land, "mp3", "audio/mpeg", controller[0])}
    ${await getAudio(Land, "ogg", "audio/ogg", controller[0])}
    Browser no supporty
    `
}

async function addText(textLocation) {
    try {
        const response = await fetch(`${defaultPath}/Text/${textLocation}`);
        if (!response.ok) {
            console.log(`No text file found at ${textLocation}`);
            document.getElementById("page-content").innerHTML = "No content available.";
            return;
        }
        let data = await response.text();
        data = data.replace(/(https?:\/\/|www\.)\S+/g, (match) => {
            if (match.startsWith("www")) {
                match = "https://" + match;
            }
            return `<a class'textlinks' href='${match}'>${match}</a>`;
        });
        document.getElementById("page-content").innerHTML = data;
    } catch (error) {
        document.getElementById("page-content").innerHTML = "Something went wrong!";
        console.error(error);
    }
}