// Function to show error messages using SweetAlert
function showError(message) {
    Swal.fire({
        title: 'Error',
        text: message,
        icon: 'error',
        confirmButtonText: 'OK'
    });
}

// Event listener for updating the email
document.getElementById('update-email-btn').addEventListener('click', async function () {
    const newEmail = document.getElementById('new-email').value;

    try {
        // Send OTP to the new email
        const response = await fetch('/user/send-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: newEmail }),
        });

        const result = await response.json();

        if (result.success) {
            Swal.fire('OTP sent!', 'Please check your inbox for the OTP.', 'success');
            // Show the OTP input and verify button
            document.getElementById('otp').style.display = 'block';
            document.getElementById('verify-otp-btn').style.display = 'block';
            document.getElementById('update-email-form').style.display = 'none'; // Hide update email form
        } else {
            showError(result.message);
        }
    } catch (error) {
        console.error('Error sending OTP:', error);
        showError('An error occurred while trying to send the OTP. Please try again.');
    }
});

// Event listener for verifying the OTP
document.getElementById('verify-otp-btn').addEventListener('click', async function () {
    const otp = document.getElementById('otp').value;
    const newEmail = document.getElementById('new-email').value;

    try {
        const response = await fetch('/user/verify-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: newEmail, otp: otp }),
        });

        const result = await response.json();

        if (result.success) {
            // Send the verification email now
            const emailResponse = await fetch('/user/send-verification-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: newEmail }),
            });

            const emailResult = await emailResponse.json();

            if (emailResult.success) {
                Swal.fire('Verification email sent!', 'Please check your inbox for the verification email.', 'success');
                
                // Hide OTP input and button
                document.getElementById('otp').style.display = 'none';
                document.getElementById('verify-otp-btn').style.display = 'none';
                
                // Optionally, reset the new email field or notify the user
                document.getElementById('new-email').value = ''; // Clear the input field
            } else {
                showError(emailResult.message);
            }
        } else {
            showError(result.message);
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
        showError('An error occurred while verifying the OTP. Please try again.');
    }
});
