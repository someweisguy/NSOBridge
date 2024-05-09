class JamElement extends HTMLElement {
    constructor() {
        super();

        this.jamScoreValue;
        this.initialTripButtons;
        this.tripPointButtons;
        this.tripViewer;
        this.activeTrip = 0;
        this.trips = [];
    }

    addTrip(points) {
        this.trips.push(points);
        this.activeTrip += 1;
        this.renderTrips();
    }

    editTrip(tripIndex, points) {
        this.trips[tripIndex] = points;
        this.renderTrips();
    }

    renderTrips() {
        // Show or hide initial trip buttons
        if (this.trips.length == 0) {
            this.initialTripButtons.style.display = "block";
            this.tripPointButtons.style.display = "none";
        } else {
            this.initialTripButtons.style.display = "none";
            this.tripPointButtons.style.display = "block";
        }

        // Update the trip viewer cells
        this.tripViewer.innerText = "";  // Clear the trip viewer
        let i = 1;
        for (let trip of this.trips) {
            let tripView = document.createElement("button");
            tripView.innerHTML = "Trip " + i + "<br>" + trip;
            this.tripViewer.appendChild(tripView);
            i++;
        }

        // Add upcoming trip with a blank number of points
        let tripView = document.createElement("button");
        tripView.setAttribute("id", "tripButton" + i);
        tripView.innerHTML = "Trip " + i + "<br>\u00a0";
        tripView.style.marginRight = "5px";
        this.tripViewer.appendChild(tripView);

        // Get the ammount to scroll the trip viewer
        let scrollAmount = 0;
        for (let view of this.tripViewer.children) {
            scrollAmount += view.offsetWidth;
        }
        this.tripViewer.scrollTo({ behavior: "smooth", left: scrollAmount });

        // Highlight the active trip view
        let highlightColor = "red";
        if (this.hasAttribute("active-trip-color")) {
            highlightColor = this.getAnimations("active-trip-color")
        }
        this.tripViewer.children[this.activeTrip].style.backgroundColor = highlightColor;

        // Update jam score
        let jamScore = 0;
        for (let tripPoints of this.trips) {
            jamScore += tripPoints;
        }
        this.jamScoreValue.innerText = jamScore;
    }

    connectedCallback() {
        const shadow = this.attachShadow({ mode: "open" });

        // Create the main span that will wrap the element
        const jamWrapper = document.createElement("span");
        jamWrapper.setAttribute("class", "jamWrapper");
        jamWrapper.style.display = "inline-block";
        if (this.hasAttribute("width")) {
            jamWrapper.style.width = this.getAttribute(width);
        } else {
            jamWrapper.style.width = "300px";
        }

        // Create the label for the jam score
        const jamScoreHeader = document.createElement("div");
        jamScoreHeader.setAttribute("class", "label");
        jamScoreHeader.innerText = "Jam Score";
        jamWrapper.appendChild(jamScoreHeader);

        // Create the element to display the jam score
        this.jamScoreValue = document.createElement("div");
        this.jamScoreValue.style.textAlign = "center";
        this.jamScoreValue.style.fontSize = "24pt";
        jamWrapper.appendChild(this.jamScoreValue);

        // Create the label for the trip point buttons
        const tripPointButtonHeader = document.createElement("div");
        tripPointButtonHeader.setAttribute("class", "label");
        tripPointButtonHeader.innerText = "Trip Points";
        jamWrapper.appendChild(tripPointButtonHeader);

        // Create the initial trip points
        this.initialTripButtons = document.createElement("div");
        let noPassButton = document.createElement("button");
        noPassButton.innerText = "NP/NP";
        noPassButton.addEventListener("click", () => { this.addTrip(0) });
        this.initialTripButtons.appendChild(noPassButton);
        let initialPassButton = document.createElement("button");
        initialPassButton.innerText = "Initial";
        initialPassButton.addEventListener("click", () => { this.addTrip(0) });
        this.initialTripButtons.appendChild(initialPassButton);
        this.initialTripButtons.style.textAlign = "center";
        jamWrapper.appendChild(this.initialTripButtons);

        // Create the trip points
        this.tripPointButtons = document.createElement("div");
        let maxPoints = 4;
        if (this.hasAttribute("max-points")) {
            let maxPointsAttribute = this.getAttribute("max-points");
            if (!isNaN(maxPointsAttribute)) {
                maxPoints = parseInt(maxPointsAttribute);
            }
        }
        // Trip points can be a custom number depending on the game rules
        for (let i = 0; i < maxPoints; i++) {
            let button = document.createElement("button");
            button.setAttribute("id", "pointButton" + i);
            button.appendChild(document.createTextNode(i));
            button.addEventListener("click", () => { this.addTrip(i) })
            button.style.width = "30px";
            button.style.height = "20px";
            button.style.marginLeft = "10px";
            button.style.marginRight = "10px";
            this.tripPointButtons.appendChild(button);
        }
        // Create the last point button a bit bigger than the rest
        let button = document.createElement("button");
        button.setAttribute("id", "pointButton" + maxPoints);
        button.appendChild(document.createTextNode(maxPoints));
        button.addEventListener("click", () => { this.addTrip(maxPoints) })
        button.style.width = "40px";
        button.style.height = "30px";
        button.style.marginLeft = "10px";
        button.style.marginRight = "10px";

        this.tripPointButtons.appendChild(button);
        this.tripPointButtons.style.textAlign = "center";
        this.tripPointButtons.style.display = "block";
        this.tripPointButtons.style.marginBottom = "10px";
        jamWrapper.appendChild(this.tripPointButtons);

        // Create the trip viewer
        this.tripViewer = document.createElement("div");
        this.renderTrips();
        this.tripViewer.textAlign = "left";
        this.tripViewer.style.whiteSpace = "nowrap";
        this.tripViewer.style.overflowX = "scroll";
        jamWrapper.appendChild(this.tripViewer);

        shadow.appendChild(jamWrapper);
    }
}

customElements.define("jam-score", JamElement);
