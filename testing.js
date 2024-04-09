const csrf = require('csurf');

// Use csurf middleware
const csrfProtection = csrf({ cookie: true });

// ...

// Serve the CSRF token
app.get('/csrf-token', csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
  });

// Add the csrfProtection middleware to the route
app.get('/admin/visitors', authenticateAdmin, csrfProtection, async (req, res) => {
  try {
    const allVisits = await readVisitsData(client);
    res.status(200).json(allVisits);  // Set the status code explicitly
  } catch (error) {
    console.error('Error during /admin/visits:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ...

// Fetch CSRF token
fetch('/csrf-token')
  .then(response => response.json())
  .then(data => {
    const csrfToken = data.csrfToken;

    // Make a request to /admin/visitors with the CSRF token in the headers
    fetch('/admin/visitors', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': csrfToken,  // Include the CSRF token in the headers
        // Include other necessary headers
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Request failed with status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        // Handle the successful response data
        console.log('Success:', data);
      })
      .catch(error => {
        // Handle errors during the /admin/visitors request
        console.error('Error during /admin/visitors request:', error);
      });
  })
  .catch(error => {
    // Handle errors during the CSRF token request
    console.error('Error fetching CSRF token:', error);
  });



