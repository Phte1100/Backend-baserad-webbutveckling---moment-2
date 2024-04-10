"use strict";
// Definiera bas-URL för API-anrop
let url = "https://backend-baserad-webbutveckling-server-2.onrender.com/api/cv";

async function fetchCVData() {
    try {
        const response = await fetch(url); // Använder 'url' som redan är definierad
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        displayCVData(data); // Visar data med displayCVData funktionen
    } catch (error) {
        console.error("Could not fetch CV data: ", error);
    }
}

// Funktion för att skapa nytt inlägg
async function createInput(companyname, jobtitle, location, startdate, enddate, description) {
    let input = {
        companyname,
        jobtitle,
        location,
        startdate,
        enddate,
        description
    };

    try {
        const response = await fetch(url, {
            method: "POST", // POST-metoden för att skapa ett nytt inlägg
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(input)
        });

        if (!response.ok) throw new Error('Något gick fel vid publiceringen.');

        const data = await response.json();
        console.log(data);

        // Visa bekräftelsemeddelande
        document.getElementById('formFeedback').innerHTML = "<p>Data har publicerats framgångsrikt!</p>";
        document.getElementById('formFeedback').style.color = "green";

        // Rensa formuläret här om allt gick bra
        document.getElementById('experienceForm').reset();
    } catch (error) {
        console.error("Could not post data: ", error);

        // Visa felmeddelande
        document.getElementById('formFeedback').innerHTML = "<p>Kunde inte publicera data. Vänligen försök igen.</p>";
        document.getElementById('formFeedback').style.color = "red";
    }
}

// Initiera när dokumentet laddas
document.addEventListener('DOMContentLoaded', (event) => {
    const form = document.getElementById('experienceForm');
    if(form) {
        form.addEventListener('submit', async function(event) {
            event.preventDefault();

            // Samla in värden från formuläret
            const companyname = document.getElementById('companyname').value;
            const jobtitle = document.getElementById('jobtitle').value;
            const location = document.getElementById('location').value;
            const startdate = document.getElementById('startdate').value;
            const enddate = document.getElementById('enddate').value;
            const description = document.getElementById('description').value;

            // Kontrollera formulär för fel
            let errors = [];
            if (companyname === "") {
                errors.push("Företagsnamn får inte vara tomt.");
            }
            if (jobtitle === "") {
                errors.push("Jobbtitel får inte vara tom.");
            }
            if (location === "") {
                errors.push("Plats får inte vara tom.");
            }
            if (startdate === "") {
                errors.push("Startdatum får inte vara tomt.");
            }
            if (enddate === "") {
                errors.push("Slutdatum får inte vara tomt.");
            }
            if (description === "") {
                errors.push("Beskrivning får inte vara tom.");
            }

            // Rensa tidigare input
            document.getElementById('formFeedback').innerHTML = "";

            if (errors.length === 0) {
                createInput(companyname, jobtitle, location, startdate, enddate, description);
            }
            // Om fel, visa felmeddelanden
            else {
                const errorsHtml = errors.map(error => `<li>${error}</li>`).join('');
                document.getElementById('formFeedback').innerHTML = `<p>Följande fel uppstod:</p><ul>${errorsHtml}</ul>`;
                document.getElementById('formFeedback').style.color = "red";
            }
        });
    }
});

function displayCVData(data) {
    const container = document.getElementById('cvData');
    if (!container) return;

    // Visa 'cvData' endast om det finns data
    container.style.display = data.length > 0 ? 'block' : 'none';

    // Sortera data baserat på 'enddate' i fallande ordning
    data.sort((a, b) => {
        let dateA = new Date(a.enddate);
        let dateB = new Date(b.enddate);
        return dateB - dateA;
    });

    const list = data.map(item => {
        const startdate = item.startdate.split('T')[0];
        const enddate = item.enddate.split('T')[0];

        return `
            <article class="cv-item">
                <h2>${item.companyname}</h2>
                <ul class="list">
                    <li><b>Titel:</b> ${item.jobtitle}</li>
                    <li><b>Ort:</b> ${item.location}</li>
                    <li><b>Startdatum:</b> ${startdate}</li>
                    <li><b>Slutdatum:</b> ${enddate}</li>
                    <li><b>Beskrivning:</b> ${item.description}</li>
                </ul>
                <button type="button" class="btn delete-btn" data-cvid="${item.id}">Ta bort ur listan</button>
            </article>
        `;
    }).join('');

    container.innerHTML = list;

    attachDeleteEventListeners();
}

function attachDeleteEventListeners() {
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            const cvId = this.getAttribute('data-cvid');
            fetch(`https://backend-baserad-webbutveckling-server-2.onrender.com/api/cv/${cvId}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(data => {
                if(data.success) {
                    console.log('Post raderad framgångsrikt');
                    fetchCVData(); // Återhämta och visa uppdaterad data
                } else {
                    alert('Något gick fel när posten skulle tas bort.');
                }
            })
            .catch(error => console.error('Error:', error));
        });
    });
}

document.addEventListener('DOMContentLoaded', fetchCVData);
