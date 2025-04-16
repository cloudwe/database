// Wait for DOM and Supabase to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Supabase
    const supabaseUrl = 'https://czthfoqzotfgqeazbnjm.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6dGhmb3F6b3RmZ3FlYXpibmptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwNDM5MzIsImV4cCI6MjA1OTYxOTkzMn0._e8PMx6NZEGY8dSPQWfrzXpXnOeHPchz463pFt0bTeA';
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
  


// PEOPLE SEARCH 
document.getElementById('people-search-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const messageEl = document.getElementById('message');
  const resultsEl = document.getElementById('results');
  messageEl.textContent = '';
  messageEl.style.color = '';
  resultsEl.innerHTML = '';

  try {
      // Get search values (trim whitespace)
      const name = document.getElementById('name').value.trim();
      const license = document.getElementById('license').value.trim();
      
      // Validate input
      if (!name && !license) {
          messageEl.textContent = 'Error: Please fill at least one field';
          messageEl.style.color = 'red';
          return;
      }
      
      if (name && license) {
          messageEl.textContent = 'Error: Please use only one field';
          messageEl.style.color = 'red';
          return;
      }

      let query = supabase.from('People').select(`
          PersonID, Name, Address, DOB, LicenseNumber, ExpiryDate
      `);

      if (name) query = query.ilike('Name', `%${name}%`);
      if (license) query = query.eq('LicenseNumber', license);

      const { data, error } = await query;

      if (error) throw error;

      // Display results
      if (data.length > 0) {
          messageEl.textContent = 'Search successful';
          messageEl.style.color = 'green';
          
          data.forEach(person => {
              resultsEl.innerHTML += `
                  <div class="result">
                      <p><strong>Person ID:</strong> ${person.PersonID}</p>
                      <p><strong>Name:</strong> ${person.Name}</p>
                      <p><strong>Address:</strong> ${person.Address}</p>
                      <p><strong>DOB:</strong> ${person.DOB}</p>
                      <p><strong>License Number:</strong> ${person.LicenseNumber}</p>
                      <p><strong>Expiry Date:</strong> ${person.ExpiryDate}</p>
                  </div>
              `;
          });
      } else {
          messageEl.textContent = 'No result found';
          messageEl.style.color = 'blue';
      }

  } catch (err) {
      messageEl.textContent = 'Error: ' + err.message;
      messageEl.style.color = 'red';
      console.error("Search error:", err);
  }
});
})