document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;
 
    try {
        const response = await fetch('http://localhost:5001/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
 
        if (!response.ok) {
            throw new Error('Login failed.');
        }

        const data = await response.json();
                localStorage.setItem('username', data.username);
                alert('success')
                window.location.href = '/script.html';
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please check your credentials and try again.');
    }
 });
 