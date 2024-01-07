const bcrypt = require('bcrypt');
const saltRounds = 10;

async function encryptPassword(password) {
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
}

// Usage
async function generateHashAndPrint() {
    try {
        const hash = await encryptPassword('abc234');
        console.log('Hash:', hash);
    } catch (error) {
        console.error('Error generating hash:', error);
    }
}

// Call the function
generateHashAndPrint();
