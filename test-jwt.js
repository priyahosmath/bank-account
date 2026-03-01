const http = require('http');

async function runTests() {
    console.log('Starting JWT DB Storage Tests...');

    const baseUrl = 'http://localhost:3000/api';
    let cookieHeader = '';

    // 1. Register a test user (might fail if already exists, which is fine, we just need the login)
    try {
        await fetch(`${baseUrl}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Test User', email: 'testjwt@example.com', password: 'password123' })
        });
    } catch (e) { }

    // 2. Login
    console.log('--- Logging in ---');
    const loginRes = await fetch(`${baseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'testjwt@example.com', password: 'password123' })
    });

    const loginData = await loginRes.json();
    console.log('Login Response:', loginRes.status, loginData);

    if (!loginRes.ok) {
        console.error('Login failed, cannot continue test');
        return;
    }

    cookieHeader = loginRes.headers.get('set-cookie');
    console.log('Received Cookie:', cookieHeader ? 'Yes' : 'No');

    // 3. Verify Balance (Token valid in DB)
    console.log('--- Checking Balance (Should Succeed) ---');
    const balanceRes1 = await fetch(`${baseUrl}/balance`, {
        headers: { 'Cookie': cookieHeader }
    });
    console.log('Balance Response 1:', balanceRes1.status, await balanceRes1.json());

    // 4. Logout (Should delete token from DB)
    console.log('--- Logging out ---');
    const logoutRes = await fetch(`${baseUrl}/logout`, {
        method: 'POST',
        headers: { 'Cookie': cookieHeader }
    });
    console.log('Logout Response:', logoutRes.status, await logoutRes.json());

    // 5. Verify Balance again (Should fail because token deleted from DB)
    console.log('--- Checking Balance (Should Fail since token is deleted from DB) ---');
    const balanceRes2 = await fetch(`${baseUrl}/balance`, {
        headers: { 'Cookie': cookieHeader }
    });
    console.log('Balance Response 2:', balanceRes2.status, await balanceRes2.json());
}

runTests();
