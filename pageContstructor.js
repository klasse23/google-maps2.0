const title = document.title.replace(" – Program Stoppested verden", "")
let cat
const attachmentPoint = document.getElementsByClassName("page-content")
function getPageData(){
    fetch("https://program.stoppestedverden.no/wp-content/plugins/Klasse23/pages.json")
     .then((response) => response.json())
     .then((data) => {
        for(let category of Object.keys(data["category"])){
            if(data["category"][category]["pages"][title] !== undefined){
                cat=category
                console.log("Found Correct Activity")
                createPage(category, data["category"][category]["pages"][title])
                break
            }
        }
         console.log(cat)
     })
}

getPageData()



function createPage(category, pageData) {
    console.log(category, pageData)
    let l = document.createElement("div")
    const newContainer = attachmentPoint[0].appendChild(document.createElement("div"));
}