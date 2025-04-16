document.addEventListener('DOMContentLoaded', () => {
    // Initialize Supabase
    const supabaseUrl = 'https://czthfoqzotfgqeazbnjm.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6dGhmb3F6b3RmZ3FlYXpibmptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwNDM5MzIsImV4cCI6MjA1OTYxOTkzMn0._e8PMx6NZEGY8dSPQWfrzXpXnOeHPchz463pFt0bTeA';
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
  
    // VEHICLE SEARCH 
    document.getElementById('vehicle-search-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const messageEl = document.getElementById('message');
        const resultsEl = document.getElementById('results');
        const template = document.getElementById('vehicle-result-template');
        
        messageEl.textContent = '';
        messageEl.style.color = '';
        resultsEl.innerHTML = '';

        try {
            const rego = document.getElementById('rego').value.trim();
            
            // validate input
            if (!rego) {
                messageEl.textContent = 'Error: Please enter a registration number';
                messageEl.style.color = 'red';
                return;
            }

            const { data, error } = await supabase
                .from('Vehicles')
                .select(`
                    VehicleID,
                    Make,
                    Model,
                    Colour,
                    People (Name, LicenseNumber)
                `)
                .eq('VehicleID', rego);

            if (error) throw error;

            if (data.length > 0) {
                messageEl.textContent = 'Search successful';
                messageEl.style.color = 'green';
                
                data.forEach(vehicle => {
                    const clone = template.content.cloneNode(true);
                    
                    // populate all fields
                    clone.querySelector('.vehicle-id').textContent = vehicle.VehicleID;
                    clone.querySelector('.make').textContent = vehicle.Make;
                    clone.querySelector('.model').textContent = vehicle.Model;
                    clone.querySelector('.colour').textContent = vehicle.Colour;
                    clone.querySelector('.owner-name').textContent = vehicle.People?.Name || 'None';
                    clone.querySelector('.owner-license').textContent = vehicle.People?.LicenseNumber || 'N/A';
                    
                    // append to results div
                    resultsEl.appendChild(clone);
                });
            } else {
                messageEl.textContent = 'No result found';
                messageEl.style.color = 'blue';
            }

        } catch (err) {
            messageEl.textContent = 'Error: ' + err.message;
            messageEl.style.color = 'red';
            console.error("Vehicle search error:", err);
        }
    });
});