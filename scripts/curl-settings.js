async function testFetch() {
  try {
    const res = await fetch('http://localhost:3005/api/admin/settings', {
      headers: {
        'Authorization': 'Bearer 123456'
      }
    });
    console.log('Status:', res.status);
    const body = await res.text();
    console.log('Body:', body);
  } catch (err) {
    console.error('Error fetching settings:', err);
  }
}

testFetch();
