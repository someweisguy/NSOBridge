class JamElement extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const shadow = this.attachShadow({mode : "open"});

        // Create the main span that will wrap the element
        const jamWrapper = document.createElement("span");
        jamWrapper.setAttribute("class", "jamWrapper");
        jamWrapper.style.display = "inline-block";
        if (this.hasAttribute("width")) {
            jamWrapper.style.width = this.getAttribute(width);
        } else {
            jamWrapper.style.width = "300px";
        }
        jamWrapper.style.textAlign = "center";
        
        // Create the label for the jam score
        const jamScoreHeader = document.createElement("div");
        jamScoreHeader.appendChild(document.createTextNode("Jam Score"));
        jamScoreHeader.setAttribute("class", "label");
        jamWrapper.appendChild(jamScoreHeader);

        // Create the element to display the jam score
        const jamScoreValue = document.createElement("div");
        jamScoreValue.appendChild(document.createTextNode("88"));
        jamScoreValue.style.fontSize = "24pt";
        jamWrapper.appendChild(jamScoreValue);
        
        // Create the label for the trip point buttons
        const tripPointButtonHeader = document.createElement("div");
        tripPointButtonHeader.appendChild(document.createTextNode("Trip Points"));
        tripPointButtonHeader.setAttribute("class", "label");
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
            button.setAttribute("id", "pointButton" + i);
            button.appendChild(document.createTextNode(i.toString()));
            button.style.width = "30px";
            button.style.height = "20px";
            button.style.marginLeft = "10px";
            button.style.marginRight = "10px";
            tripPointButtons.appendChild(button);
        }
        tripPointButtons.style.display = "block";
        tripPointButtons.style.marginBottom = "10px";
        jamWrapper.appendChild(tripPointButtons);

        // Create the trip viewer
        const tripViewer = document.createElement("div");
        // Create example data for the trip viewer for debug purposes
        for (let i = 1; i < 11; i++) {
            let tripView = document.createElement("button");
            tripView.setAttribute("id", "tripButton" + i);
            tripView.setAttribute("value", i);
            tripView.appendChild(document.createTextNode("Trip " + i));
            tripView.appendChild(document.createElement("br"));
            tripView.appendChild(document.createTextNode("0"))
            tripViewer.appendChild(tripView);
        }
        tripViewer.style.whiteSpace = "nowrap";
        tripViewer.style.overflowX = "scroll";
        jamWrapper.appendChild(tripViewer);


        shadow.appendChild(jamWrapper);
    }
}

customElements.define("jam-score", JamElement);
