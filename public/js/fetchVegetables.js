async function loadVegetables() {
    try {
        const response = await fetch('/get-All-vegetables');
        const vegetables = await response.json();
        
        const carousel = document.getElementById('vegetable-carousel');
        carousel.innerHTML = ''; // Clear existing content

        vegetables.forEach(vegetable => {
            const item = document.createElement('div');
            item.className = 'card border border-success rounded position-relative mx-2 vegetable-item';
            item.style.width = '250px';
            
            item.innerHTML = `
                <div class="vegetable-img">
                    <img src="images/${vegetable.images[0]}" class="img-fluid w-100 rounded-top" alt="${vegetable.name}">
                </div>
                <div class="text-white bg-success px-3 py-1 rounded position-absolute" style="top: 10px; right: 10px;">Vegetable</div>
                <div class="p-4 rounded-bottom">
                    <h4>${vegetable.name}</h4>
                    <p>${vegetable.description}</p>
                    <div class="d-flex justify-content-between">
                        <p class="text-dark fs-5 fw-bold mb-0">$${vegetable.price} / kg</p>
                        <a href="#" class="btn border border-secondary rounded-pill px-3 text-success">
                            <i class="fa fa-shopping-bag me-2 text-success"></i> Add to cart
                        </a>
                    </div>
                </div>
            `;
            carousel.appendChild(item);
        });
        
    } catch (error) {
        console.error('Error loading vegetables:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadVegetables);
