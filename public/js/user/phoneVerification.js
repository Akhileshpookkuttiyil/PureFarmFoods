document.addEventListener('DOMContentLoaded', function () {
    const sendVerificationBtn = document.getElementById('send-verification-code');
    const verifyCodeBtn = document.getElementById('verify-code-btn');
    const phoneInput = document.getElementById('phone');
    const codeInput = document.getElementById('verification-code');

    sendVerificationBtn.addEventListener('click', async function (event) {
        event.preventDefault();

        const phoneNumber = phoneInput.value;

        try {
            const response = await fetch('/send-verification', {  // Updated URL
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ phoneNumber })
            });

            const result = await response.json();
            if (result.success) {
                Swal.fire({
                    title: 'Code Sent!',
                    text: 'A verification code has been sent to your phone number.',
                    icon: 'success',
                    confirmButtonText: 'OK'
                });
                codeInput.style.display = 'inline-block';
                verifyCodeBtn.style.display = 'inline-block';
            } else {
                Swal.fire({
                    title: 'Error',
                    text: result.message,
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                title: 'Error',
                text: 'An error occurred while sending the verification code. Please try again later.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    });

    verifyCodeBtn.addEventListener('click', async function (event) {
        event.preventDefault();

        const code = codeInput.value;
        const phoneNumber = phoneInput.value;

        try {
            const response = await fetch('/verify-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ phoneNumber, code })
            });

            const result = await response.json();
            if (result.success) {
                Swal.fire({
                    title: 'Verified!',
                    text: 'Your phone number has been verified successfully.',
                    icon: 'success',
                    confirmButtonText: 'OK'
                });
                codeInput.value = ''; // Clear the code input
            } else {
                Swal.fire({
                    title: 'Error',
                    text: result.message,
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        } catch (error) {
            console.error('Error verifying code:', error);
            Swal.fire({
                title: 'Error',
                text: 'An error occurred while verifying the code. Please try again later.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    });
});
