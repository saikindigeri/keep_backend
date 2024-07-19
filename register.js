document.getElementById('registerForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    let username = document.getElementById('username').value;
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
 
    try {
        const response = await fetch('http://localhost:5001/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });
 
        if (!response.ok) {
            throw new Error('Registration failed.');
        }
 
        alert('Registration successful! Please login.');
        window.location.href = '/login.html'; // Redirect to login page
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed. Please try again.');
    }
 });
 