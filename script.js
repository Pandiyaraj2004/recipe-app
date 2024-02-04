const searchInput = document.querySelector('#searchInput');
const resultsList = document.querySelector('#results');
const searchButton = document.querySelector("#searchButton");

searchButton.addEventListener('click', (e) => {
    e.preventDefault();
    searchRecipes();
});

async function searchRecipes() {
    const searchValue = searchInput.value.trim();
    const response = await fetch(`https://api.edamam.com/search?q=${searchValue}&app_id=7aa516a5&app_key=dc836a223fb788b11ae390504d9e97ce&from=0&to=10`);
    const data = await response.json();
    displayRecipes(data.hits);
}

function displayRecipes(recipes) {
    let html = '';
    recipes.forEach((recipe) => {
        html += `
        <li class="recipe-item">
            <div>
                <img src="${recipe.recipe.image}" alt="${recipe.recipe.label}">
                <h3>${recipe.recipe.label}</h3>
            </div>
            <div class="recipe-link">
                <a href="${recipe.recipe.url}" target="_blank">View Recipe</a>
            </div>
        </li>
        `;
    });
    resultsList.innerHTML = html;
}

function uploadFile() {
    // Get the selected file from the input element
    const fileInput = document.getElementById('file-upload');
    const file = fileInput.files[0];

    // Create a new FileReader to read the file as a URL
    const reader = new FileReader();

    // Define the callback function that will run when the FileReader finishes reading the file
    reader.onload = function (event) {
        // The FileReader has finished reading the file. The content of the file is now available as a data URL (event.target.result).

        // Create an image element to display the uploaded image
        const img = document.createElement('img');
        img.src = event.target.result;

        // Append the image element to the image-preview div
        document.getElementById('image-preview').appendChild(img);
    };

    // Start reading the file as a URL
    reader.readAsDataURL(file);
}

document.querySelector('input[name="file"]').addEventListener('change', function (event) {
    const preview = document.getElementById('predicted-image');
    preview.src = URL.createObjectURL(event.target.files[0]);
});

function uploadImage() {
    const input = document.getElementById('file-upload');
    const outputDiv = document.getElementById('predicted-image-link');
    const recipieResults = document.querySelector('.recipe-result');

    if (input.files.length > 0) {
        const file = input.files[0];
        const formData = new FormData();
        formData.append('image', file);

        fetch('https://api.imgbb.com/1/upload?key=9ccc9e3f849fc3139b038160fb578d04', {
            method: 'POST',
            body: formData,
        })
            .then(response => response.json())
            .then(async data => {
                if (data.data && data.data.url) {
                    const imageUrl = data.data.url;
                    outputDiv.innerHTML = `<p>Image uploaded successfully!</p>`;
                    
                    //Getting the Results from server
                    const results = await predictFood(imageUrl);
                    //If results are there then appending to the UI
                    if(results.length) {
                        let ulEle = '';
                        for (let i = 0; i < results.length; i++) {
                            ulEle += ` <ul>${results[i]}</ul>`
                        }
                        recipieResults.innerHTML = ulEle;
                    }
                } else {
                    outputDiv.innerHTML = '<p>Error uploading image. Please try again.</p>';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                outputDiv.innerHTML = '<p>An unexpected error occurred. Please try again.</p>';
            });
    } else {
        outputDiv.innerHTML = '<p>Please select an image to upload.</p>';
    }
}

async function predictFood(url) {
    // Headers
    let results = [];
    const headers = new Headers({
        'Content-Type': 'application/json'
    });

    // Request options
    const requestOptions = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ imageUrl: url })
    };

    //Getting the results from server by making API call
    await fetch('http://localhost:3000/predict', requestOptions).then(res => {
        return res.json();
    }).then(res => {
        results = res.results;
    });
    return results
}


