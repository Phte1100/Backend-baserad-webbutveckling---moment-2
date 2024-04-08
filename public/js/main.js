"use strict";

let url = "http://127.0.0.1:3000/api/cv";

async function getData() {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.table(data);
    } catch (error) {
        console.error("Could not fetch data: ", error);
    }
}

async function createInput(companyname, jobtitle, location, startdate, enddate, description) {
    let input = {
        companyname: companyname,
        jobtitle: jobtitle,
        location: location,
        startdate: startdate,
        enddate: enddate,
        description: description
    };
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(input)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error("Could not post data: ", error);
    }
}

document.addEventListener('DOMContentLoaded', (event) => {
    const form = document.getElementById('experienceForm');
    if(form) { // Kontrollerar om form elementet existerar
        form.addEventListener('submit', function(event) {
            event.preventDefault(); // Förhindrar standardbeteendet för formulärskick
            const formData = {
                companyname: document.getElementById('companyname').value,
                jobtitle: document.getElementById('jobtitle').value,
                location: document.getElementById('location').value,
                startdate: document.getElementById('startdate').value,
                enddate: document.getElementById('enddate').value,
                description: document.getElementById('description').value
            };
            
            createInput(formData.companyname, formData.jobtitle, formData.location, formData.startdate, formData.enddate, formData.description);
        });
    }
});

function displayCVData(data) {
    const container = document.getElementById('cvData');
    if (!container) return;

    // Sortera data baserat på 'enddate' i fallande ordning
    data.sort((a, b) => {
        let dateA = new Date(a.enddate);
        let dateB = new Date(b.enddate);
        return dateB - dateA; // Byt till `dateA - dateB` för stigande ordning
    });

    const list = data.map(item => {
        const startdate = item.startdate.split('T')[0];
        const enddate = item.enddate.split('T')[0];

        return `
            <div class="cv-item">
                <h2>${item.companyname}</h2>
                <ul class="list">
                    <li><b>Titel:</b> ${item.jobtitle}</li>
                    <li><b>Ort:</b> ${item.location}</li>
                    <li><b>Startdatum:</b> ${startdate}</li>
                    <li><b>Slutdatum:</b> ${enddate}</li>
                    <li><b>Beskrivning:</b> ${item.description}</li>
                </ul>
                <button type="button" class="btn delete-btn" data-cvid="${item.id}">Ta bort ur listan</button>
            </div>
        `;
    }).join('');
    
    container.innerHTML = list;

    attachDeleteEventListeners();
}

function attachDeleteEventListeners() {
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            const cvId = this.getAttribute('data-cvid');
            fetch(`http://127.0.0.1:3000/api/cv/${cvId}`, { method: 'DELETE' })
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

document.addEventListener('DOMContentLoaded', fetchCVData);