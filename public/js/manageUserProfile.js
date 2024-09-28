document.addEventListener('DOMContentLoaded', function () {
    const links = document.querySelectorAll('.side-nav a');
    const contents = document.querySelectorAll('.main-contents > div');

    links.forEach(link => {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            showContent(this.id.replace('-link', '-content'), this);
        });
    });

    document.getElementById('change-email-link').addEventListener('click', function (event) {
        event.preventDefault();
        document.getElementById('update-email-form').style.display = 'block';
    });

    document.getElementById('delete-account-link').addEventListener('click', async function (event) {
        event.preventDefault();
        Swal.fire({
            title: 'Are you sure?',
            text: "Deleting your account will remove all associated content and cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch('/user/delete-Account', {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    const result = await response.json();
                    if (result.success) {
                        Swal.fire(
                            'Deleted!',
                            'Your account has been deleted.',
                            'success'
                        ).then(() => {
                            window.location.href = '/'; // Redirect to home page or login page after deletion
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
                    console.error('Error deleting account:', error);
                    Swal.fire({
                        title: 'Error',
                        text: 'An error occurred while trying to delete your account. Please try again later.',
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                }
            }
        });
    });
     // Handle password update form submission
     const passwordForm = document.getElementById('update-password-form');
     passwordForm.addEventListener('submit', async function (event) {
         event.preventDefault(); // Prevent default form submission

         const newPassword = document.getElementById('new-password').value;
         const oldPassword = document.getElementById('current-password').value;

         try {
             const response = await fetch('/user/change-password', {
                 method: 'POST',
                 headers: {
                     'Content-Type': 'application/json'
                 },
                 body: JSON.stringify({ newPassword, oldPassword })
             });

             const result = await response.json();

             if (result.success) {
                 Swal.fire({
                     title: 'Success!',
                     text: 'Your password has been changed successfully.',
                     icon: 'success',
                     confirmButtonText: 'OK'
                 });
                 passwordForm.reset()
             } else {
                 Swal.fire({
                     title: 'Error',
                     text: result.message,
                     icon: 'error',
                     confirmButtonText: 'OK'
                 });
                 passwordForm.reset()
             }
         } catch (error) {
             console.error('Error changing password:', error);
             Swal.fire({
                 title: 'Error',
                 text: 'An error occurred while changing your password. Please try again.',
                 icon: 'error',
                 confirmButtonText: 'OK'
             });
         }
     });
 });