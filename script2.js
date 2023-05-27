let map;
let filterButtons = {};
let sortedMarkers = {}
const { Map } = await google.maps.importLibrary("maps");
const { Marker } = await google.maps.importLibrary("marker");
let clusterer
const markerSize = 50;
const defaultPath = "https://program.stoppestedverden.no/wp-content/plugins/Klasse23/"
const l = document.querySelector("#content")
let windowUp = false
let customWindowTitle , filterWrapper,windowControllButton,window
/**
 * Sette opp kartet, overlay, markers, og mer
 */
async function initMap() {
  
  l.style = "margin:auto;max-width:none;"
  console.log("Init Map Started");
  const position = { lat: 60.797912, lng: 11.029991 };
  const infoWindow = new google.maps.InfoWindow({
    content: "",
    disableAutoPan: true,
    
  });

  map = new Map(document.getElementById("map"), {
    zoom: 17,
    center: position,
    fullscreenControl: false,
    
  });

  const bounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(60.79697, 11.02375),
    new google.maps.LatLng(60.79927, 11.03643)
  );
  
  let image = defaultPath + "img/uten_bakgrunn.svg";
   map.addListener("click", () => {
    // 3 seconds after the center of the map has changed, pan back to the
    // marker.
   showHideWindow(true)
  });
  class USGSOverlay extends google.maps.OverlayView {
    bounds;
    image;
    div;
    constructor(bounds, image) {
      super();
      this.bounds = bounds;
      this.image = image;
    }
    /**
     * onAdd is called when the map's panes are ready and the overlay has been
     * added to the map.
     */
    onAdd() {
      this.div = document.createElement("div");
      this.div.style.borderStyle = "none";
      this.div.style.borderWidth = "0px";
      this.div.style.position = "absolute";
      this.div.className = "map-encasing";

      // Create the img element and attach it to the div.
      const img = document.createElement("img");

      img.src = this.image;
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.position = "absolute"; //

      this.div.appendChild(img);

      // Add the element to the "overlayLayer" pane.
      const panes = this.getPanes();

      panes.overlayLayer.appendChild(this.div);
    }
    draw() {
      const overlayProjection = this.getProjection();

      const sw = overlayProjection.fromLatLngToDivPixel(
        this.bounds.getSouthWest()
      );
      const ne = overlayProjection.fromLatLngToDivPixel(
        this.bounds.getNorthEast()
      );

      if (this.div) {
        this.div.style.left = sw.x + "px";
        this.div.style.top = ne.y + "px";
        this.div.style.width = ne.x - sw.x + "px";
        this.div.style.height = sw.y - ne.y + "px";
        this.div.style.transform = "rotate(206.9deg)";
      }
    }
    /**
     * The onRemove() method will be called automatically from the API if
     * we ever set the overlay's map property to 'null'.
     */
    onRemove() {
      if (this.div) {
        this.div.parentNode.removeChild(this.div);
        delete this.div;
      }
    }
    /**
     *  Set the visibility to 'hidden' or 'visible'.
     */
    hide() {
      if (this.div) {
        this.div.style.visibility = "hidden";
      }
    }
    show() {
      if (this.div) {
        this.div.style.visibility = "visible";
      }
    }
    toggle() {
      if (this.div) {
        if (this.div.style.visibility === "hidden") {
          this.show();
        } else {
          this.hide();
        }
      }
    }
    toggleDOM(map) {
      if (this.getMap()) {
        this.setMap(null);
      } else {
        this.setMap(map);
      }
    }
  }

  const overlay = new USGSOverlay(bounds, image);
  overlay.setMap(map);
  buildWindow()
  
  
  try {
    console.log("This tests infoWindow", infoWindow)
    getData(infoWindow);
    
  } catch (err) {
    console.log("Error when fetching overlay json: ", err);
  }
}


function playerLocation(icon, size) {
  let infoWindow = new google.maps.InfoWindow();
  const playerLocationBtn = document.createElement("button");
  playerLocationBtn.classList.add("playerLocationBtn");

  const playerLocationSpan = document.createElement("span");
  playerLocationSpan.classList.add("material-symbols-outlined");
  playerLocationSpan.innerText = "near_me";

  playerLocationBtn.appendChild(playerLocationSpan);
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(playerLocationBtn);

  playerLocationBtn.addEventListener("click", () => {
    // Try HTML5 geolocation.

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          let marker = new google.maps.Marker({
            position: pos,
            map,
            icon: {
              url: icon,
              scaledSize: new google.maps.Size(size, size),
            },
          });

          marker.addListener("click", function () {
            infoWindow.setContent("You are here");
            infoWindow.open(map, marker);
          });

          map.setCenter(pos);
        },
        () => {
          handleLocationError(true, infoWindow, map.getCenter());
        }
      );
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false, infoWindow, map.getCenter());
    }
  });

  function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
      browserHasGeolocation
        ? "Error: The Geolocation service failed."
        : "Error: Your browser doesn't support geolocation."
    );
    infoWindow.open(map);
  }
}

async function getData(infoWindow) {
  fetch(defaultPath+"pages.json")
    .then((response) => response.json())
    .then((data) => {
		console.log("Creating filter")
      
      let markers = [];
      
      let categories = data["category"];
 
      filterWrapper = document.createElement("div");filterWrapper.classList.add("filter-wrapper");
      Object.keys(categories).forEach((category, index) => {
        let color = categories[category]["color"];
        let icon = categories[category]["Ikon"]
        let currentWindowPosition;
        filterButtons[category] = {"markers":[]}
        
        Object.entries(categories[category]["pages"]).forEach(
          ([markerTitle, markerData]) => {
            
            
            const marker = new google.maps.Marker({
              position: { lat: markerData.lat, lng: markerData.lng },
              title: markerTitle,
              //animation: google.maps.Animation.DROP,
              map,
              icon: {
                url: icon,
                scaledSize: new google.maps.Size(30, 30),
              },
            });

            
              marker.addListener("click", function () {
                console.log("Marker clicked 2")
                map.setCenter(marker.getPosition());
                createWindow(marker, categories, category)
              });
            
            
            filterButtons[category]["markers"].push(marker)
            markers.push(marker)
          }

        );
        createFiltration(color, category, filterWrapper, index, categories)
      });

      map.controls[google.maps.ControlPosition.LEFT_CENTER].push(filterWrapper);
      //console.log(data["user"].iconPath)
      //TODO: Legge til slik at vi kan vise hvor spilleren er.
      //playerLocation(data["user"].iconPath, data["user"].iconSize);
    clusterer = new markerClusterer.MarkerClusterer({
        map:map,
        markers:markers
    });
    });
}

//TODO Fikse feil.
/**
 * InfoWindow, en klasse som har funksjoner som å sette opp vindu får info.
 */

function createFiltration(color, category, filterWrapper, index, categories) {
  console.log("filterWrapper", filterWrapper)
  let filterButton = document.createElement("button");filterButton.textContent = category;filterButton.classList.add("filter-button");
  filterButton.style.border = "2px solid " + color;
  filterButton.style.backgroundColor = color;
  
  filterWrapper.appendChild(filterButton);

  filterButtons[category].button = filterButton 
  filterButtons[category].shown = true

        filterButton.addEventListener("click", () => {
          if (filterButtons[category].shown) {
            filterButton.classList.add("deactive");
            filterButton.style.backgroundColor = "#F0F0F0";
            filterButton.style.color = "black";
            clusterer.removeMarkers(filterButtons[category]["markers"], true)
            
    
            filterButtons[category].shown = false;
          } else {
            filterButton.classList.remove("deactive");
            filterButton.style.border = "2px solid " + color;
            filterButton.style.backgroundColor = color;
            filterButton.style.color = "white";
            clusterer.addMarkers(filterButtons[category]["markers"], false)
            filterButtons[category].shown = true;
          }
        })
}

initMap();



function createWindow(marker, categories, category) {
  console.log(marker, categories, category)
    window.style.backgroundColor = categories[category].color
     customWindowTitle.textContent = marker.title
  showHideWindow(false)
  

  
  
}

function showHideWindow(move = windowUp) {

  if(move) {
    window.style.top = "95%"
    windowUp = false
    
    
    //windowControllButton.style = "transform-origin:rotate(180deg);"
    
    return
  }
  window.style.top = "55%"

  //windowControllButton.style = "transform-origin:rotate(180deg);"
  windowUp = true
}


function buildWindow() {
    window = document.createElement("div")
    let mapA = document.getElementById("map")
    windowControllButton = document.createElement("button")
    windowControllButton.classList.add("custom-window-button") 
    windowControllButton.innerHTML = "<i class='fas fa-chevron-up' style='font-size:24px'></i>"
    mapA.appendChild(window)
    window.appendChild(windowControllButton)
    customWindowTitle = document.createElement("h2")
    customWindowTitle.classList.add("custom-window-title")
    window.appendChild(customWindowTitle)
    window.classList.add("infoWindow")
    windowControllButton.addEventListener("click", () => {
      showHideWindow()
    })
}