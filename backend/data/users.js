const bcrypt = require('bcryptjs');

const users = [
    {
        name: 'Admin User',
        email: 'admin@example.com',
        password: bcrypt.hashSync('123456', 10),
        role: 'admin',
        address: 'Admin HQ',
        phone: '0000000000'
    },
    {
        name: 'John Doe',
        email: 'buyer@example.com',
        password: bcrypt.hashSync('123456', 10),
        role: 'buyer',
        address: '123 Buyer St',
        phone: '1234567890'
    },
    {
        name: 'Jane Vendor',
        email: 'vendor@example.com',
        password: bcrypt.hashSync('123456', 10),
        role: 'vendor',
        address: '456 Vendor Ave',
        phone: '0987654321'
    }
];

module.exports = users;
