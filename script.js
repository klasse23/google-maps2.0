let map;
const { Map } = await google.maps.importLibrary("maps");
const { Marker } = await google.maps.importLibrary("marker");

const markerSize = 50;

/**
 * Sette opp kartet, overlay, markers, og mer
 */
async function initMap() {
  console.log("This is a test");
  const position = { lat: 60.797912, lng: 11.029991 };
  const infoWindow = new InfoWindow();

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

/**
 * Finne hvor spilleren er.
 * @param {*} icon
 * @param {*} size
 */
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

/**
 * Get data from pages.json
 * @param {*} infoWindow
 */
async function getData(infoWindow) {
  fetch("pages.json")
    .then((response) => response.json())
    .then((data) => {
      const filterButtons = {};
      let markers = [];

      let item = data["category"];
      console.log(item);
      const filterWrapper = document.createElement("div");
      filterWrapper.classList.add("filter-wrapper");

      const filterDiv = document.createElement("div");
      filterDiv.classList.add("filterMain");

      filterWrapper.appendChild(filterDiv);

      Object.keys(item).forEach((key, index) => {
        let color = item[key]["color"];
        let currentWindowPosition;
        console.log(item[key]);

        const marker = Object.values(item[key]["pages"]).forEach(
          (markerData) => {
            const marker = new google.maps.Marker({
              position: { lat: markerData.lat, lng: markerData.lng },
              title: markerData.title,
              animation: google.maps.Animation.DROP,
              map,
              icon: {
                url: item[key].icon,
                scaledSize: new google.maps.Size(30, 30),
              },
            });

            google.maps.event.addListenerOnce(map, "idle", function () {
              google.maps.event.addListener(marker, "click", function () {
                map.setCenter(marker.getPosition());

                const category = key.charAt(0).toUpperCase() + key.slice(1);

                document
                  .getElementById("infoWindowCustom")
                  .classList.remove("hidden");
                document.getElementById("infoWindowTitle").innerText =
                  markerData.title;
                document.getElementById("infoWindowDescription").innerText =
                  markerData.description;

                document.getElementById("infoWindowReadMore").href =
                  markerData.web_location ? markerData.web_location : "#";
              });
            });

            markers.push(marker);
            return marker;
          }
        );

        google.maps.event.addListener(map, "click", function () {
          document.getElementById("infoWindowCustom").classList.add("hidden");
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
            filterButton.style.color = "black";
            clusterer.removeMarkers(marker);

            item[key].shown = false;
          } else {
            filterButton.classList.remove("deactive");
            filterButton.style.border = "2px solid " + color;
            filterButton.style.backgroundColor = color;
            filterButton.style.color = "white";
            clusterer.addMarkers(marker);
            item[key].shown = true;
          }
        });
      });

      map.controls[google.maps.ControlPosition.LEFT_CENTER].push(filterWrapper);

      //TODO: Legge til slik at vi kan vise hvor spilleren er.
      playerLocation(data["user"].iconPath, data[0]["player"].iconSize);

      google.maps.event.addListener(map, "drag", function () {
        document.getElementById("infoWindowCustom").classList.add("hidden");

        const clusterer = new MarkerClusterer(map, markers, {
          imagePath: data[0]["markers"].imagePath,
          gridSize: data[0]["markers"].gridSize,
          minimumClusterSize: data[0]["markers"].minimumClusterSize,
        });
      });
    });
}

//TODO Fikse feil.
/**
 * InfoWindow, en klasse som har funksjoner som å sette opp vindu får info.
 */
class InfoWindow {
  constructor() {}

  async createInfoWindow() {
    const infoWindow = document.createElement("div");
    infoWindow.setAttribute("id", "infoWindowCustom");
    infoWindow.classList.add("infoWindow");
    infoWindow.classList.add("hidden");

    const infoWindowContent = document.createElement("div");
    infoWindowContent.classList.add("infoWindowContent");

    const infoWindowDropdown = document.createElement("button");
    infoWindowDropdown.classList.add("infoWindowDropdown");

    const infoWindowDropdownIcon = document.createElement("span");
    infoWindowDropdownIcon.classList.add("material-symbols-outlined");
    infoWindowDropdownIcon.innerText = "expand_more";
    infoWindowDropdownIcon.setAttribute("id", "infoWindowIcon");

    infoWindowDropdown.appendChild(infoWindowDropdownIcon);

    const infoWindowHeader = document.createElement("div");
    infoWindowHeader.classList.add("infoWindowHeader");

    const infoWindowBody = document.createElement("div");
    infoWindowBody.classList.add("infoWindowBody");

    const infoWindowTitle = document.createElement("h3");
    infoWindowTitle.classList.add("infoWindowTitle");
    infoWindowTitle.setAttribute("id", "infoWindowTitle");
    infoWindowTitle.innerText = "Hello World";

    const infoWindowCategory = document.createElement("p");
    infoWindowCategory.setAttribute("id", "infoWindowCategory");
    infoWindowCategory.classList.add("infoWindowCategory");
    infoWindowCategory.innerText = "This is just a description.";

    const images = document.createElement("div");
    images.classList.add("images");

    const image1 = document.createElement("img");
    image1.src = "https://www.w3schools.com/howto/img_snow_wide.jpg";

    const image2 = document.createElement("img");
    image2.src = "https://www.w3schools.com/howto/img_snow_wide.jpg";

    const image3 = document.createElement("img");
    image3.src = "https://www.w3schools.com/howto/img_snow_wide.jpg";

    images.appendChild(image1);
    images.appendChild(image2);
    images.appendChild(image3);

    const infoWindowReadMore = document.createElement("a");
    infoWindowReadMore.setAttribute("id", "infoWindowReadMore");
    infoWindowReadMore.classList.add("infoWindowReadMore");
    infoWindowReadMore.innerText = "Les mer";

    const infoWindowReadMoreIcon = document.createElement("span");

    infoWindowReadMoreIcon.classList.add("material-symbols-outlined");
    infoWindowReadMoreIcon.innerText = "arrow_forward";
    infoWindowReadMoreIcon.setAttribute("id", "infoWindowNextIcon");

    infoWindowReadMore.appendChild(infoWindowReadMoreIcon);

    const details = document.createElement("h4");
    details.classList.add("infoWindowDetails");
    details.innerText = "Detaljer";

    const infoWindowDetails = document.createElement("div");
    infoWindowDetails.classList.add("infoWindowDetailsDiv");

    const infoWindowDetailsHead = document.createElement("h5");
    infoWindowDetailsHead.classList.add("infoWindowDetailsHead");
    infoWindowDetailsHead.innerText = "Tidstider";

    const infoWindowDetailsStatus = document.createElement("h4");
    infoWindowDetailsStatus.classList.add("infoWindowDetailsStatus");
    infoWindowDetailsStatus.innerText = "Åpent";

    const infoWindowDetailsList = document.createElement("ul");
    infoWindowDetailsList.classList.add("infoWindowDetailsList");

    const infoWindowDetailsListItem = document.createElement("li");
    infoWindowDetailsListItem.classList.add("infoWindowDetailsListItem");
    infoWindowDetailsListItem.innerText = "hello world";

    const infoWindowDetailsListItemTime = document.createElement("span");
    infoWindowDetailsListItemTime.classList.add(
      "infoWindowDetailsListItemTime"
    );
    infoWindowDetailsListItemTime.innerText = "23:00";
    infoWindowDetailsListItem.appendChild(infoWindowDetailsListItemTime);

    const infoWindowDetailsListItem2 = document.createElement("li");
    infoWindowDetailsListItem2.classList.add("infoWindowDetailsListItem");
    infoWindowDetailsListItem2.innerText = "hello world";

    const infoWindowDetailsListItemTime2 = document.createElement("span");
    infoWindowDetailsListItemTime2.classList.add(
      "infoWindowDetailsListItemTime"
    );
    infoWindowDetailsListItemTime2.innerText = "12:00";
    infoWindowDetailsListItem2.appendChild(infoWindowDetailsListItemTime2);

    infoWindow.appendChild(infoWindowContent);
    infoWindowContent.appendChild(infoWindowDropdown);
    infoWindowContent.appendChild(infoWindowHeader);
    infoWindowContent.appendChild(infoWindowBody);

    infoWindowHeader.appendChild(infoWindowTitle);
    infoWindowHeader.appendChild(infoWindowCategory);
    infoWindowHeader.appendChild(infoWindowReadMore);
    infoWindowHeader.appendChild(details);
    infoWindowHeader.appendChild(infoWindowDetails);
    infoWindowDetails.appendChild(infoWindowDetailsHead);
    infoWindowDetails.appendChild(infoWindowDetailsStatus);
    infoWindowDetails.appendChild(infoWindowDetailsList);
    infoWindowDetails.appendChild(infoWindowDetailsListItem);
    infoWindowDetails.appendChild(infoWindowDetailsListItem2);

    document.getElementById("map").appendChild(infoWindow);

    infoWindowDropdown.addEventListener("click", function () {
      this.toggleInfoWindow();
    });
  }

  async toggleInfoWindow() {
    const infoWIndow = document.querySelector(".infoWindow");
    infoWIndow.classList.toggle("small");
    document.querySelector(".infoWindowDropdown span").innerText =
      infoWIndow.classList.contains("small") ? "expand_less" : "expand_more";
  }

  async makeInfoWindowBigger() {
    const infoWIndow = document.querySelector(".infoWindow");
    infoWIndow.classList.remove("small");
    document.querySelector(".infoWindowDropdown span").innerText =
      "expand_more";
  }

  async makeInfoWindowSmaller() {
    const infoWIndow = document.querySelector(".infoWindow");
    infoWIndow.classList.add("small");
    document.querySelector(".infoWindowDropdown span").innerText =
      "expand_less";
  }
}

initMap();
