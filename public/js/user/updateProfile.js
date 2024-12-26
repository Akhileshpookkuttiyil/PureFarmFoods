let originalPhone = null; // Allow reassignment
const phoneEditIcon = document.getElementById("phone-edit-icon");

document.addEventListener("DOMContentLoaded", function () {
  let isPhoneUpdated = false; // Track if the phone number has changed

  async function fetchAndUpdateUserProfile() {
    try {
      const userResponse = await fetch("/user/profile-data");

      if (!userResponse.ok) {
        const errorText = await userResponse.text();
        console.error("Error fetching user profile data:", errorText);
        return;
      }

      const userData = await userResponse.json();

      if (userData.success) {
        document.getElementById("first-name").value = userData.firstName;
        document.getElementById("last-name").value = userData.lastName;
        document.getElementById("gender").value = userData.gender;
        document.getElementById("email").value = userData.email;
        document.getElementById("phone").value = userData.phone;

        originalPhone = userData.phone;

        document.querySelector("strong").innerText = userData.email;
      } else {
        console.error("Failed to fetch user profile data:", userData.message);
      }
    } catch (error) {
      console.error("Error fetching user profile data:", error);
    }
  }

  // Fetch user profile data on page load
  fetchAndUpdateUserProfile();

  const profileForm = document.getElementById("public-profile-form");
  const phoneInput = document.getElementById("phone");

  // Save the original phone number when the page loads
  phoneInput.addEventListener("focus", () => {
    originalPhone = phoneInput.value;
  });

  // Check if phone number has changed
  phoneInput.addEventListener("input", () => {
    isPhoneUpdated = phoneInput.value !== originalPhone;
  });

  profileForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(profileForm);

    if (isPhoneUpdated) {
      const phoneNumber = phoneInput.value;
      try {
        const sendOtpResponse = await fetch("/send-verification", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ phoneNumber }),
        });

        const otpResult = await sendOtpResponse.json();

        if (sendOtpResponse.ok) {
          const swalHtml = `
            <form id="otp-form">
              <div class="d-flex justify-content-center gap-2 mb-3">
                ${Array.from(
                  { length: 6 },
                  (_, i) =>
                    `<input type="text" id="otp-${
                      i + 1
                    }" class="otp-input" maxlength="1">`
                ).join("")}
              </div>
              <div id="otp-status-message" class="text-success text-center mb-2"></div>
              <div class="d-flex justify-content-between">
                <button type="button" id="resend-otp" class="btn btn-secondary">Resend OTP</button>
                <button type="submit" id="verify-otp" class="btn btn-primary">Verify</button>
              </div>
            </form>
          `;

          await Swal.fire({
            title: "Enter OTP",
            html: swalHtml,
            showCloseButton: true,
            showConfirmButton: false,
            didOpen: () => {
              const inputs = document.querySelectorAll(".otp-input");
              inputs.forEach((input, index) => {
                input.addEventListener("input", () => {
                  if (input.value && index < inputs.length - 1) {
                    inputs[index + 1].focus();
                  }
                });
              });

              const resendBtn = document.getElementById("resend-otp");
              resendBtn.addEventListener("click", async () => {
                const statusMessage =
                  document.getElementById("otp-status-message");
                statusMessage.textContent = "Sending new OTP...";
                await sendOTP(phoneNumber);
                statusMessage.textContent = "A new OTP has been sent.";
              });

              const otpForm = document.getElementById("otp-form");
              otpForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                const otp = Array.from(
                  { length: 6 },
                  (_, i) => document.getElementById(`otp-${i + 1}`).value
                ).join("");
                if (otp.length !== 6 || isNaN(otp)) {
                  const statusMessage =
                    document.getElementById("otp-status-message");
                  statusMessage.textContent =
                    "Please enter a valid 6-digit OTP.";
                  statusMessage.classList.add("text-danger");
                  return;
                }
                await verifyOTP(phoneNumber, otp);
              });
            },
          });
        } else {
          Swal.fire({
            title: "Error",
            text: otpResult.message || "Failed to send OTP.",
            icon: "error",
            confirmButtonText: "OK",
          });
        }
      } catch (error) {
        console.error("Error sending OTP:", error);
        Swal.fire({
          title: "Error",
          text: "An error occurred while sending the OTP. Please try again.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } else {
      await updateUserProfile(formData);
    }
  });

  async function updateUserProfile(formData) {
    try {
      const response = await fetch("/user/update-profile", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        Swal.fire({
          title: "Success!",
          text: result.message,
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          fetchAndUpdateUserProfile();
        });
      } else {
        Swal.fire({
          title: "Error",
          text: result.message,
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Swal.fire({
        title: "Error",
        text: "An error occurred while updating your profile. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  }

  // Assuming sendOTP and verifyOTP functions are already defined
  async function sendOTP(phoneNumber) {
    try {
      const sendOtpResponse = await fetch("/send-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const otpResult = await sendOtpResponse.json();

      if (sendOtpResponse.ok) {
        return otpResult;
      } else {
        throw new Error(otpResult.message || "Failed to send OTP.");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      Swal.fire({
        title: "Error",
        text: "An error occurred while sending the OTP. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  }

  async function verifyOTP(phoneNumber, otp) {
    try {
      const verifyOtpResponse = await fetch("/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber,
          code: otp,
        }),
      });

      const verificationResult = await verifyOtpResponse.json();

      if (verifyOtpResponse.ok) {
        await updateUserProfile(new FormData(profileForm));
        localStorage.setItem("phoneVerified", "true");
        phoneEditIcon.innerHTML =
          '<i class="fas fa-check-circle" style="color: rgb(55, 247, 55);"></i>';
        phoneEditIcon.onclick = null;
      } else {
        Swal.fire({
          title: "Error",
          text: "OTP verification failed. Please try again.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      Swal.fire({
        title: "Error",
        text: "An error occurred while verifying the OTP. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  }
});
