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
        this.activeTrip = this.trips.length;
        this.renderElement();
    }

    editTrip(tripIndex, points) {
        this.trips[tripIndex] = points;
        this.renderElement();
    }

    renderElement() {
        // Show or hide initial trip buttons
        if (this.trips.length == 0 || this.activeTrip == 0) {
            this.initialTripButtons.style.display = "block";
            this.tripPointButtons.style.display = "none";
        } else {
            this.initialTripButtons.style.display = "none";
            this.tripPointButtons.style.display = "block";
        }

        // Update the trip viewer cells
        this.tripViewer.innerText = "";  // Clear the trip viewer
        for (let i = 0; i <= this.trips.length; i++) {
            let tripCell = document.createElement("button");
            if (i == this.activeTrip) {
                tripCell.setAttribute("class", "activeTrip");
            }
            tripCell.setAttribute("id", i)
            let html = "Trip " + (i + 1) + "<br>";
            html += i == this.trips.length ? "\xa0" : this.trips[i];
            tripCell.innerHTML = html;
            tripCell.addEventListener("click", (event) => {
                this.activeTrip = parseInt(event.target.getAttribute("id"));
                this.renderElement();
            })
            this.tripViewer.appendChild(tripCell);
        }

        // Get the amount to scroll the trip viewer
        let scrollAmount = 0;
        for (let view of this.tripViewer.children) {
            if (view.getAttribute("id") == this.activeTrip) {
                break;
            }
            scrollAmount += view.offsetWidth;
        }
        this.tripViewer.scrollTo({ behavior: "smooth", left: scrollAmount });

        // Disable the appropriate trip input button
        for (let inputButton of this.tripPointButtons.children) {
            inputButton.disabled = false;
        }
        if (this.activeTrip == 0) {
            for (let i = 1; i <= 4; i++) {
                this.tripPointButtons.children[i].disabled = true;
            }
        } else if (this.activeTrip < this.trips.length) {
            let tripPoints = this.trips[this.activeTrip];
            this.tripPointButtons.children[tripPoints].disabled = true;
        }

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

        // Create the initial trip point buttons
        this.initialTripButtons = document.createElement("div");
        this.initialTripButtons.setAttribute("class", "inputButtons");
        this.initialTripButtons.setAttribute("id", "initialButtons");
        let noPassButton = document.createElement("button");
        noPassButton.innerText = "NP/NP";
        noPassButton.addEventListener("click", () => { this.addTrip(0) });
        this.initialTripButtons.appendChild(noPassButton);
        let initialPassButton = document.createElement("button");
        initialPassButton.innerText = "Initial";
        initialPassButton.addEventListener("click", () => { this.addTrip(0) });
        this.initialTripButtons.appendChild(initialPassButton);
        jamWrapper.appendChild(this.initialTripButtons);

        // Create the non-initial trip point buttons
        this.tripPointButtons = document.createElement("div");
        this.tripPointButtons.setAttribute("class", "inputButtons");
        let maxPoints = 4;
        if (this.hasAttribute("max-points")) {
            let maxPointsAttribute = this.getAttribute("max-points");
            if (!isNaN(maxPointsAttribute)) {
                maxPoints = parseInt(maxPointsAttribute);
            }
        }
        for (let i = 0; i <= maxPoints; i++) {
            // Trip points can be a custom number depending on the game rules
            let button = document.createElement("button");
            button.innerText = i;
            button.addEventListener("click", () => {
                if (this.activeTrip < this.trips.length) {
                    this.editTrip(this.activeTrip, i);
                } else {
                    this.addTrip(i);
                }
            })
            this.tripPointButtons.appendChild(button);
        }
        jamWrapper.appendChild(this.tripPointButtons);

        // Create the trip viewer
        this.tripViewer = document.createElement("div");
        this.tripViewer.setAttribute("class", "tripViewer");
        this.renderElement();
        jamWrapper.appendChild(this.tripViewer);

        // Apply the CSS
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(`
            .label {
                text-align: center;
                font-size: 9pt;
                font-style: italic;
                font-weight: lighter;
            }
            .inputButtons {
                text-align: center;
                display: block;
                margin-bottom: 10px;
            }
            .inputButtons button {
                width: 30px;
                height: 20px;
                margin-left: 3mm;
                margin-right: 3mm;
            }
            #initialButtons button {
                width: 60px;
            }
            .inputButtons button:nth-last-child(1) {
                width: 40px;
                height: 30px;
            }

            .tripViewer {
                text-align: left;
                white-space: nowrap;
                overflow-x: scroll;
            }
            .tripViewer .activeTrip {
                background-color: red;
            }
        `);
        shadow.adoptedStyleSheets.push(sheet);


        shadow.appendChild(jamWrapper);
    }
}

customElements.define("jam-score", JamElement);
