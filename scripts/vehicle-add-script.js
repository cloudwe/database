document.addEventListener('DOMContentLoaded', () => {
    // initialise Supabase
    const supabaseUrl = 'https://czthfoqzotfgqeazbnjm.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6dGhmb3F6b3RmZ3FlYXpibmptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwNDM5MzIsImV4cCI6MjA1OTYxOTkzMn0._e8PMx6NZEGY8dSPQWfrzXpXnOeHPchz463pFt0bTeA';
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    // form elements
    const addVehicleForm = document.getElementById('add-vehicle-form');
    const newOwnerForm = document.getElementById('new-owner-form');
    const checkOwnerBtn = document.getElementById('check-owner-btn');
    const newOwnerBtn = document.getElementById('new-owner-btn');
    const addOwnerBtn = document.getElementById('add-owner-btn');
    const ownerResults = document.getElementById('owner-results');
    const messageOwner = document.getElementById('message-owner');
    const messageVehicle = document.getElementById('message-vehicle');
    
    let selectedOwnerId = null;

    // enable Check Owner button when owner field has content
    document.getElementById('owner').addEventListener('input', function() {
        checkOwnerBtn.disabled = this.value.trim() === '';
        newOwnerBtn.disabled = true;// Reset new owner button state
    });

    // check Owner button click handler
    checkOwnerBtn.addEventListener('click', async () => {
        const ownerName = document.getElementById('owner').value.trim();
        clearOwnerResults();
        selectedOwnerId = null;
        newOwnerBtn.disabled = false;

        try {
            const { data, error } = await supabase
                .from('People')
                .select('*')
                .ilike('Name', `%${ownerName}%`);
            
            if (error) throw error;
            
            if (data.length > 0) {
                displayOwnerResults(data);
            } else {
                showNoOwnersFound();
                newOwnerForm.style.display = 'block';
                document.getElementById('name').value = ownerName;
                messageOwner.className = 'form-message info';
            }
        } catch (err) {
            showOwnerSearchError(err);
        }
    });

    // helper functions
    function clearOwnerResults() {
        ownerResults.innerHTML = '';
        messageOwner.textContent = '';
        messageOwner.className = 'form-message';
    }

    function displayOwnerResults(owners) {
        const template = document.getElementById('owner-card-template');
        
        owners.forEach(person => {
            const clone = template.content.cloneNode(true);
            clone.querySelector('.person-id').textContent = person.PersonID;
            clone.querySelector('.owner-name').textContent = person.Name;
            clone.querySelector('.owner-address').textContent = person.Address;
            clone.querySelector('.owner-dob').textContent = person.DOB;
            clone.querySelector('.owner-license').textContent = person.LicenseNumber;
            clone.querySelector('.owner-expiry').textContent = person.ExpiryDate;
            
            const selectBtn = clone.querySelector('.select-owner');
            selectBtn.dataset.id = person.PersonID;
            selectBtn.addEventListener('click', handleOwnerSelection);
            
            ownerResults.appendChild(clone);
        });
    }

    function handleOwnerSelection() {
        selectedOwnerId = this.dataset.id;
        messageOwner.textContent = 'Owner selected';
        messageOwner.className = 'form-message success';
        newOwnerBtn.disabled = true;
    }

    function showNoOwnersFound() {
        const noResults = document.createElement('p');
        noResults.textContent = 'No matching owners found';
        ownerResults.appendChild(noResults);
    }

    function showOwnerSearchError(err) {
        messageOwner.textContent = 'Error searching owners';
        messageOwner.className = 'form-message error';
        console.error('Owner search error:', err);
    }

    // new owner button click handler
    newOwnerBtn.addEventListener('click', () => {
        newOwnerForm.style.display = 'block';
        document.getElementById('name').value = document.getElementById('owner').value;
    });

    // add owner button click handler
    addOwnerBtn.addEventListener('click', async () => {
        const name = document.getElementById('name').value.trim();
        const address = document.getElementById('address').value.trim();
        const dob = document.getElementById('dob').value.trim();
        const license = document.getElementById('license').value.trim();
        const expire = document.getElementById('expire').value.trim();
        
        // validate required fields
        if (!name || !address || !dob || !license || !expire) {
          messageOwner.textContent = 'Error: All fields are required';
          messageOwner.className = 'form-message error';
          return;
        }
      
        try {
          // check for duplicate owner
          const { data: existing, error } = await supabase
            .from('People')
            .select('*')
            .eq('Name', name)
            .eq('Address', address)
            .eq('DOB', dob)
            .eq('LicenseNumber', license)
            .eq('ExpiryDate', expire);
          
          if (error) throw error;
          
          if (existing.length > 0) {
            messageOwner.textContent = 'Error: Owner with identical details already exists';
            messageOwner.className = 'form-message error';
            return;
          }
      
          // add new owner, we let supabase auto-generate personID
          const { data, error: insertError } = await supabase
            .from('People')
            .insert([{ 
              Name: name,
              Address: address,
              DOB: dob,
              LicenseNumber: license,
              ExpiryDate: expire
            }])
            .select();
          
          if (insertError) throw insertError;
          
          selectedOwnerId = data[0].PersonID;
          document.getElementById('owner').value = data[0].Name;
          messageOwner.textContent = 'Owner added successfully';
          messageOwner.className = 'form-message success';
        
        } catch (err) {
          messageOwner.textContent = 'Error adding owner: ' + err.message;
          messageOwner.className = 'form-message error';
          console.error('Owner addition error:', err);
        }
      });
      
    // add Vehicle form submission
    addVehicleForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        messageVehicle.textContent = '';
        
        const rego = document.getElementById('rego').value.trim().toUpperCase(); //made sure its uppercase
        const make = document.getElementById('make').value.trim();
        const model = document.getElementById('model').value.trim();
        const colour = document.getElementById('colour').value.trim();
        const ownerName = document.getElementById('owner').value.trim();
    
        // validate vehicle fields
        if (!rego || !make || !model || !colour|| !ownerName) {
            messageVehicle.textContent = 'Error: All vehicle fields are required';
            messageVehicle.className = 'form-message error';
            return;
        }

        // check if vehicle registration already exists (case-insensitive)
        try {
            const { data: existingVehicles, error: checkError } = await supabase
                .from('Vehicles')
                .select('VehicleID')
                .ilike('VehicleID', rego); // Case-insensitive search

            if (checkError) throw checkError;
            
            if (existingVehicles.length > 0) {
                messageVehicle.textContent = 'Error: This registration already exists';
                messageVehicle.className = 'form-message error';
                return; // Stop if duplicate exists
            }
        } catch (err) {
            messageVehicle.textContent = 'Error checking vehicle registration';
            messageVehicle.className = 'form-message error';
            return;
        }


    
        // if owner name exists but no owner selected
        if (ownerName && !selectedOwnerId) {
            try {
                clearOwnerResults();
                const { data, error } = await supabase
                    .from('People')
                    .select('*')
                    .ilike('Name', `%${ownerName}%`);
                
                if (error) throw error;
                
                if (data.length > 0) {
                    displayOwnerResults(data);
                    return;
                } else {
                    newOwnerForm.style.display = 'block';
                    document.getElementById('name').value = ownerName;
                    return;
                }
            } catch (err) {
                messageVehicle.textContent = 'Error searching for owner';
                messageVehicle.className = 'form-message error';
                return;
            }
        }
    
        // if no owner name entered
        if (!ownerName) {
            messageVehicle.textContent = 'Error: Please enter owner name';
            messageVehicle.className = 'form-message error';
            return;
        }
    
        // submit vehicle
        try {
            const { error } = await supabase
                .from('Vehicles')
                .insert([{
                    VehicleID: rego,
                    Make: make,
                    Model: model,
                    Colour: colour,
                    OwnerID: selectedOwnerId
                }]);
    
            if (error) throw error;
            
            // SUCCESS - show message
            messageVehicle.textContent = 'Vehicle added successfully';
            messageVehicle.className = 'form-message success';
   

        } catch (err) {
            messageVehicle.textContent = 'Error adding vehicle: ' + err.message;
            messageVehicle.className = 'form-message error';
        }
    });
})