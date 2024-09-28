document.addEventListener('DOMContentLoaded', function () {
    async function fetchAndUpdateUserProfile() {
        try {
            const userResponse = await fetch('/user/profile-data');

            if (!userResponse.ok) {
                const errorText = await userResponse.text();
                console.error('Error fetching user profile data:', errorText);
                return;
            }

            const userData = await userResponse.json();

            if (userData.success) {
                document.getElementById('first-name').value = userData.firstName;
                document.getElementById('last-name').value = userData.lastName;
                document.getElementById('gender').value = userData.gender;
                document.getElementById('email').value = userData.email;
                document.getElementById('phone').value = userData.phone;

                // Optionally update other parts of the UI with new data
                document.querySelector('strong').innerText = userData.email;
            } else {
                console.error('Failed to fetch user profile data:', userData.message);
            }
        } catch (error) {
            console.error('Error fetching user profile data:', error);
        }
    }

    // Fetch user profile data on page load
    fetchAndUpdateUserProfile();

    // Update Profile Form Submission
    const profileForm = document.getElementById('public-profile-form');

    profileForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const formData = new FormData(profileForm);

        try {
            const response = await fetch('/user/update-profile', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                Swal.fire({
                    title: 'Success!',
                    text: result.message,
                    icon: 'success',
                    confirmButtonText: 'OK'
                }).then(() => {
                    fetchAndUpdateUserProfile(); // Fetch and update the user profile data
                });
            } else {
                Swal.fire({
                    title: 'Error',
                    text: result.message,
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            Swal.fire({
                title: 'Error',
                text: 'An error occurred while updating your profile. Please try again.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    });
});
