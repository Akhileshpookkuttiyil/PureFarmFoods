document.addEventListener('DOMContentLoaded', function() {
    const sidebarLinks = document.querySelectorAll('.sidebar a');
    const sections = document.querySelectorAll('section');

    function showSection(sectionId) {
        sections.forEach(section => {
            section.classList.toggle('active', section.id === sectionId);
        });

        sidebarLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-section') === sectionId);
        });
    }

    function handleHashChange() {
        const hash = window.location.hash.substring(1); // Remove the '#'
        if (hash) {
            showSection(hash);
        } else {
            showSection('welcome');
        }
    }

    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const targetSection = link.getAttribute('data-section');
            window.location.hash = targetSection; // Set the URL hash
        });
    });

    window.addEventListener('hashchange', handleHashChange);

    // Initialize the correct section on page load
    handleHashChange();

    // Handle block/unblock actions
    document.querySelector('.main-content').addEventListener('click', async function(event) {
        const button = event.target.closest('button');
        if (!button) return;

        if (button.classList.contains('block-btn')) {
            const userId = button.getAttribute('data-user-id');
            try {
                const response = await fetch(`/block/${userId}`);
                if (response.ok) {
                    // Remove the blocked user from the UI
                    button.closest('tr').remove();
                    // Update the URL hash to keep the users section active
                    window.location.hash = 'users';
                    handleHashChange();
                    location.reload()
                } else {
                    alert('Error blocking user');
                }
            } catch (error) {
                console.error(error);
                alert('Error blocking user');
            }
        } else if (button.classList.contains('unblock-btn')) {
            const userId = button.getAttribute('data-user-id');
            try {
                const response = await fetch(`/unblock/${userId}`);
                if (response.ok) {
                    button.closest('tr').remove();
                    // alert('User unblocked successfully');
                    // Optionally update the UI if needed
                    window.location.hash = 'users';
                    handleHashChange();
                    location.reload()
                } else {
                    alert('Error unblocking user');
                }
            } catch (error) {
                console.error(error);
                alert('Error unblocking user');
            }
        }
    });
});

