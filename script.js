let map;
const { Map } = await google.maps.importLibrary("maps");
const { Marker } = await google.maps.importLibrary("marker");

const markerSize = 50;

async function initMap() {
  const position = { lat: 60.797912, lng: 11.029991 };
  const infoWindow = new google.maps.InfoWindow();

  map = new Map(document.getElementById("map"), {
    zoom: 17,
    center: position,
    fullscreenControl: false,
  });

  const bounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(60.79697, 11.02375),
    new google.maps.LatLng(60.79927, 11.03643)
  );

  let image = "img/uten_bakgrunn.svg";

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

  try {
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

initMap();

async function getData(infoWindow) {
  fetch("maps.json")
    .then((response) => response.json())
    .then((data) => {
      const filterButtons = {};
      let markers = [];

      let item = data[1];
      const filterWrapper = document.createElement("div");
      filterWrapper.classList.add("filter-wrapper");

      const filterDiv = document.createElement("div");
      filterDiv.classList.add("filterMain");

      filterWrapper.appendChild(filterDiv);

      Object.keys(item).forEach((key, index) => {
        let color = item[key]["color"];
        let currentWindowPosition;

        const marker = item[key].markers.map((markerData) => {
          const marker = new google.maps.Marker({
            position: { lat: markerData.lat, lng: markerData.lng },
            title: markerData.title,
            animation: google.maps.Animation.DROP,
            map, // assuming you have a `map` variable referencing the Google Map
            icon: {
              url: item[key].icon,
              scaledSize: new google.maps.Size(30, 30),
            },
          });

          google.maps.event.addListenerOnce(map, "idle", function () {
            google.maps.event.addListener(marker, "click", function () {
              map.setCenter(marker.getPosition());
              infoWindow.close();

              const category = key.charAt(0).toUpperCase() + key.slice(1);

              const content = `<div id="content">
                <div class="parent">
                <div class="first">  
                ${
                  markerData.thumbnail
                    ? `<img src="${markerData.thumbnail}" alt="cool" width="150" height="100"/>`
                    : ""
                }
                </div>
                  <div class="second">
                    <span class="tag" style="background-color: ${
                      item[key].color
                    }">${category}</span>
                    ${
                      markerData.web_location
                        ? `<a href="${markerData.web_location}" style="text-decoration: none; font-weight: 600;"><h3>${marker.title}</h3></a>`
                        : `<h3>${marker.title}</h3>`
                    }
                  </div>
                  <div class="third">
                  ${
                    markerData.web_location
                      ? `<a href="${markerData.web_location}">
                      <span class="material-symbols-outlined" id="more" style="font-size: 56px;">
                        chevron_right
                      </span>
                    </a>`
                      : `<span class="material-symbols-outlined" id="more" style="font-size: 56px;">
                      chevron_right
                    </span>`
                  }  
                  
                  
                  </div>
                </div>
              </div>`;

              infoWindow.setContent(content);
              infoWindow.open(map, marker);
            });
          });

          markers.push(marker);
          return marker;
        });

        google.maps.event.addListener(map, "click", function () {
          infoWindow.close();
        });

        const filterButton = document.createElement("button");
        const str = key;
        const str2 = str.charAt(0).toUpperCase() + str.slice(1);
        filterButton.textContent = str2;
        filterButton.style.border = "2px solid " + color;
        filterButton.style.backgroundColor = color;
        filterButton.classList.add("filter-button");

        filterDiv.appendChild(filterButton);

        filterButtons[key] = { button: filterButton, index: index };

        filterButton.addEventListener("click", () => {
          const filterButtonData = filterButtons[key];

          const shown = item[key].shown;

          if (shown) {
            filterButton.classList.add("deactive");
            filterButton.style.backgroundColor = "#F0F0F0";
            infoWindow.close();
            clusterer.removeMarkers(marker);

            item[key].shown = false;
          } else {
            filterButton.classList.remove("deactive");
            filterButton.style.border = "2px solid " + color;
            filterButton.style.backgroundColor = color;
            clusterer.addMarkers(marker);
            item[key].shown = true;
          }
        });
      });

      map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(
        filterWrapper
      );

      //TODO: Legge til slik at vi kan vise hvor spilleren er.
      playerLocation(data[0]["player"].iconPath, data[0]["player"].iconSize);

      //TODO: Fikse problemet når man drar, gjør slik at infoWindow følger etter kartet etter rundt 0.1 sekund
      google.maps.event.addListener(map, "drag", function () {
        if (
          infoWindow &&
          infoWindow.getMap() !== null &&
          window.innerWidth <= 750 &&
          infoWindow.getPosition() !== undefined &&
          infoWindow.getPosition() !== null
        ) {
          console.log(
            "InfoWindow: " + infoWindow.getPosition(),
            "Map: " + map.getCenter()
          );
          infoWindow.setPosition(map.getCenter());
        } else {
          infoWindow.close();
        }
      });

      const clusterer = new MarkerClusterer(map, markers, {
        imagePath: data[0]["markers"].imagePath,
        gridSize: data[0]["markers"].gridSize,
        minimumClusterSize: data[0]["markers"].minimumClusterSize,
      });
    });
}

//TODO: Slider funksjon
function sliderMain() {
  //wait 1 second before launch
  setTimeout(() => {
    const slider = document.querySelector(".filterMain");
    let isDown = false;
    let startX;
    let scrollLeft;

    slider.addEventListener("mousedown", (e) => {
      isDown = true;
      slider.classList.add("active");
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    });
    slider.addEventListener("mouseleave", () => {
      isDown = false;
      slider.classList.remove("active");
    });
    slider.addEventListener("mouseup", () => {
      isDown = false;
      slider.classList.remove("active");
    });
    slider.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 3; //scroll-fast
      slider.scrollLeft = scrollLeft - walk;
      console.log(walk);
    });
  }, 1000);
}
