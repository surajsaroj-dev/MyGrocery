const testRegister = async () => {
    try {
        const response = await fetch('https://mygrocery-bcw8.onrender.com/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'Test User',
                email: 'test@example.com',
                password: '123456',
                role: 'buyer',
                phone: '1234567890',
                address: 'Test Address'
            })
        });

        const data = await response.json();

        console.log('Register API Status:', response.status);
        if (response.ok) {
            console.log('Registration successful!');
            console.log('User data:', data);
        } else {
            console.log('Registration failed!');
            console.log('Error:', data);
        }
    } catch (error) {
        console.error('Register API Error:', error.message);
    }
};

testRegister();
