class JamElement extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const shadow = this.attachShadow({mode : "open"});

        // Create the main span that will wrap the element
        const jamWrapper = document.createElement("span");
        jamWrapper.setAttribute("class", "jamWrapper");
        
        // Create the label for the jam score
        const jamScoreHeader = document.createElement("div");
        jamScoreHeader.appendChild(document.createTextNode("Jam Score"));
        jamWrapper.appendChild(jamScoreHeader);

        // Create the element to display the jam score
        const jamScoreValue = document.createElement("div");
        jamScoreValue.appendChild(document.createTextNode("88"));
        jamWrapper.appendChild(jamScoreValue);
        
        // Create the label for the trip point buttons
        const tripPointButtonHeader = document.createElement("div");
        tripPointButtonHeader.appendChild(document.createTextNode("Trip Points"));
        jamWrapper.appendChild(tripPointButtonHeader);

        // Create the trip points
        const tripPointButtons = document.createElement("div");
        let maxPoints = 4;
        if (this.hasAttribute("max-points")) {
            let maxPointsAttribute = this.getAttribute("max-points");
            if (!isNaN(maxPointsAttribute)) {
                maxPoints = parseInt(maxPointsAttribute);
            }
        }
        // Trip points can be a custom number depending on the game rules
        for (let i = 0; i <= maxPoints; i++) {
            let button = document.createElement("button");
            button.setAttribute("id", "button" + i);
            button.appendChild(document.createTextNode(i.toString()));
            tripPointButtons.appendChild(button);
        }
        jamWrapper.appendChild(tripPointButtons);

        // Create the trip viewer
        const tripViewer = document.createElement("div");
        // Create example data for the trip viewer for debug purposes
        for (let i = 1; i < 11; i++) {
            let tripView = document.createElement("button");
            tripView.appendChild(document.createTextNode("Trip " + i.toString()));
            tripView.appendChild(document.createElement("br"));
            tripView.appendChild(document.createTextNode("0"))
            tripViewer.appendChild(tripView);
        }
        jamWrapper.appendChild(tripViewer);

        



        shadow.appendChild(jamWrapper);
    }
}

customElements.define("jam-score", JamElement);
