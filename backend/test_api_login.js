const testLogin = async () => {
    try {
        const response = await fetch('https://mygrocery-bcw8.onrender.com/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@example.com',
                password: '123456'
            })
        });

        const data = await response.json();

        console.log('Login API Status:', response.status);
        if (response.ok) {
            console.log('Token received:', data.token ? 'Yes' : 'No');
            console.log('User Role:', data.role);
        } else {
            console.log('Error Message:', data.message);
        }
    } catch (error) {
        console.error('Login API Error:', error.message);
    }
};

testLogin();
