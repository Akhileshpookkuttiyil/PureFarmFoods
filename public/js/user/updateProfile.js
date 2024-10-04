//updateProfile.js

const originalPhone=null;
const phoneEditIcon = document.getElementById('phone-edit-icon');
document.addEventListener('DOMContentLoaded', function () {
    let isPhoneUpdated = false; // Track if the phone number has changed

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

                originalPhone=userData.phone;

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

    const profileForm = document.getElementById('public-profile-form');
    const phoneInput = document.getElementById('phone');
 // Store original phone number

    // Save the original phone number when the page loads
    phoneInput.addEventListener('focus', () => {
        originalPhone = phoneInput.value;
    });

    // Check if phone number has changed
    phoneInput.addEventListener('input', () => {
        if (phoneInput.value !== originalPhone) {
            isPhoneUpdated = true; // Mark phone as updated
        } else {
            isPhoneUpdated = false;
        }
    });

    // Update Profile Form Submission
    profileForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const formData = new FormData(profileForm);

        // If the phone number has been updated, send OTP
        if (isPhoneUpdated) {
            const phoneNumber = phoneInput.value;
            try {
                const sendOtpResponse = await fetch('/send-verification', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ phoneNumber })
                });

                const otpResult = await sendOtpResponse.json();

                if (sendOtpResponse.ok) {
                    // Show OTP prompt (using Swal for simplicity)
                    const { value: otpCode } = await Swal.fire({
                        title: 'Enter OTP',
                        input: 'text',
                        inputLabel: 'A verification code has been sent to your phone',
                        inputPlaceholder: 'Enter the OTP code',
                        showCancelButton: true,
                    });

                    if (otpCode) {
                        // Verify OTP
                        const verifyOtpResponse = await fetch('/verify-code', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                phoneNumber,
                                code: otpCode
                            })
                        });

                        const verificationResult = await verifyOtpResponse.json();

                        if (verifyOtpResponse.ok) {
                            // OTP is valid, proceed with profile update
                            await updateUserProfile(formData);
                            const isPhoneVerified = localStorage.getItem('phoneVerified');
                            localStorage.setItem('phoneVerified', 'true');
                            phoneEditIcon.innerHTML = '<i class="fas fa-check-circle" style="color: rgb(55, 247, 55);"></i>';
                            phoneEditIcon.onclick = null; // Disable further editing after verification
                        } else {
                            Swal.fire({
                                title: 'Error',
                                text: 'OTP verification failed. Please try again.',
                                icon: 'error',
                                confirmButtonText: 'OK'
                            });
                        }
                    }
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: otpResult.message || 'Failed to send OTP.',
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                }
            } catch (error) {
                console.error('Error sending OTP:', error);
                Swal.fire({
                    title: 'Error',
                    text: 'An error occurred while sending the OTP. Please try again.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        } else {
            // No phone number update, proceed directly with profile update
            await updateUserProfile(formData);
        }
    });

    // Function to update user profile
    async function updateUserProfile(formData) {
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
    }
});
