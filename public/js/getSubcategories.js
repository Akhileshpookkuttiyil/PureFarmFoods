async function fetchSubcategories() {
    const categoryId = document.getElementById('parent-category-select').value;
    const subcategorySelect = document.getElementById('Subcategory-select');
    console.log(categoryId);

    if (!categoryId) {
        subcategorySelect.innerHTML = '<option value="">Select Subcategory</option>';
        return;
    }

    try {
        const response = await fetch(`/seller/get-subcategories/${categoryId}`);
        const subcategories = await response.json();
        console.log(subcategories);

        subcategorySelect.innerHTML = '<option value="">Select Subcategory</option>';
        subcategories.forEach(subcategory => {
            const option = document.createElement('option');
            option.value = subcategory._id;
            option.textContent = subcategory.name;
            subcategorySelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching subcategories:', error);
    }
}