document.querySelectorAll('.block-btn, .unblock-btn').forEach(button => {
    button.addEventListener('click', async function() {
        const userId = button.getAttribute('data-user-id');
        const action = button.classList.contains('block-btn') ? 'block' : 'unblock';

        try {
            const response = await fetch(`/users/${action}/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            console.log(`User ${action}ed successfully`);
            $('#main-content').load("/view-Users"); // Reload the entire page after action
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            // Handle error gracefully
        }
    });
});
