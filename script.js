document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const checkbox = document.getElementById("no-acr");
  const submitBtn = document.getElementById("submit-btn");
  const successMessage = document.getElementById("form-success");

  const honeypot = document.getElementById("company");
  const emailField = document.getElementById("email");
  const messageField = document.getElementById("message");

  // Initial state: disable submit button until acknowledgment is checked
  if (checkbox && submitBtn) {
    submitBtn.disabled = !checkbox.checked;

    checkbox.addEventListener("change", () => {
      submitBtn.disabled = !checkbox.checked;
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Email format validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailField && !emailPattern.test(emailField.value)) {
      alert("Please enter a valid email address.");
      return;
    }

    // Message length validation
    if (messageField && messageField.value.trim().length < 10) {
      alert("Please include a brief message describing your inquiry.");
      return;
    }

    // Turnstile Token validation
    const turnstileResponse = document.querySelector('[name="cf-turnstile-response"]')?.value;
    if (!turnstileResponse) {
        alert("Please complete the security check.");
        return;
    }

    // Update UI to show sending state
    const originalBtnText = submitBtn.innerText;
    submitBtn.innerText = "Sending...";
    submitBtn.disabled = true;

    // Construct the exact JSON payload the Lambda expects
    const payload = {
      name: document.getElementById("name").value,
      email: emailField.value,
      topic: document.getElementById("topic").value,
      message: messageField.value,
      company: honeypot ? honeypot.value : "", // Passes the honeypot data silently
      no_acr_acknowledgment: checkbox.checked ? checkbox.value : null,
      turnstileToken: turnstileResponse
    };

    try {
      // REPLACE THIS STRING WITH YOUR AWS LAMBDA FUNCTION URL
      const response = await fetch("https://w2ksk7xmusho5dnn5b55ftfnom0trkjs.lambda-url.us-east-1.on.aws/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Network error");
      }

      // Success UI
      form.style.display = "none";
      if (successMessage) successMessage.style.display = "block";

    } catch (err) {
      alert(`Error: ${err.message}. Please try again or email us directly.`);
      // Reset button so they can try again
      submitBtn.innerText = originalBtnText;
      submitBtn.disabled = false;
    }
  });
});