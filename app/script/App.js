'use strict';
async function foo() {
    let response = await fetch('http://localhost:3001/user');
    if (!response.ok) throw new Error('data not valid');
    response = await response.json();
    console.log(await response);
};


foo();

const user = {
    id: 3,
    name: 'Vovchik',
    age: 'so old',
}

async function bar(obj) {
    let response = await fetch('http://localhost:3001/user', {
        method: 'POST',
        body: JSON.stringify(obj),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    response = await response.json();
    return response;

}
bar(user);
bar(user);