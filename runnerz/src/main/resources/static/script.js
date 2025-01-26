document.addEventListener('DOMContentLoaded', function() {
    fetchRuns();

    document.getElementById('createRunBtn').addEventListener('click', showCreateForm);
    document.getElementById('cancelBtn').addEventListener('click', hideForm);

    document.getElementById('runForm').addEventListener('submit', handleFormSubmit);
});

let currentRunId = null;

function fetchRuns() {
    const loadingElement = document.getElementById('loading');
    loadingElement.style.display = 'flex';

    fetch('http://localhost:8080/api/runs')
        .then(response => response.json())
        .then(runs => {
            const runsContainer = document.getElementById('runs');
            runsContainer.innerHTML = '';
            if (runs.length === 0) {
                runsContainer.innerHTML = '<p>No runs available.</p>';
                loadingElement.style.display = 'none';
                return;
            }

            runs.forEach(run => {
                const runElement = document.createElement('div');
                runElement.classList.add('run-item');

                runElement.innerHTML = `
                    <h2>${run.title}</h2>
                    <p><span class="label">Location:</span> <span class="value">${run.location}</span></p>
                    <p><span class="label">Duration:</span> <span class="value">${run.duration}</span></p>
                    <p><span class="label">Average Pace:</span> <span class="value">${run.avgPace} min/mile</span></p>
                    <p><span class="label">Started On:</span> <span class="value">${formatDate(run.startedOn)}</span></p>
                    <p><span class="label">Completed On:</span> <span class="value">${formatDate(run.completedOn)}</span></p>
                    <button class="delete-btn" data-id="${run.id}">Delete</button>
                `;

                runsContainer.appendChild(runElement);
            });

            // Add delete functionality
            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', deleteRun);
            });

            loadingElement.style.display = 'none';
        })
        .catch(error => {
            console.error('Error fetching runs:', error);
            const runsContainer = document.getElementById('runs');
            runsContainer.innerHTML = '<p>Error loading runs. Please try again later.</p>';
            loadingElement.style.display = 'none';
        });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

function showCreateForm() {
    document.getElementById('formContainer').style.display = 'block';
    document.getElementById('runForm').reset();
    document.getElementById('submitBtn').innerText = 'Create Run';
    currentRunId = null; // Clear any current run for editing
}

function hideForm() {
    document.getElementById('formContainer').style.display = 'none';
}

function handleFormSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const runData = Object.fromEntries(formData);

    const method = currentRunId ? 'PUT' : 'POST';
    const url = currentRunId ? `http://localhost:8080/api/runs/${currentRunId}` : 'http://localhost:8080/api/runs';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(runData),
    })
    .then(response => response.json())
    .then(() => {
        fetchRuns();
        hideForm();
    })
    .catch(error => {
        console.error('Error submitting form:', error);
    });
}

function deleteRun(event) {
    const runId = event.target.getAttribute('data-id');

    fetch(`http://localhost:8080/api/runs/${runId}`, {
        method: 'DELETE',
    })
    .then(() => {
        fetchRuns();
    })
    .catch(error => {
        console.error('Error deleting run:', error);
    });
}
