/* src/components/FactSheet/fact-sheet-script.js */

document.addEventListener("DOMContentLoaded", async function () {
  const schoolDataDiv = document.getElementById("school-data");
  const schoolForm = document.getElementById("school-form");
  const errorMessageDiv = document.getElementById("error-message"); // For displaying errors
  const loadingSpinner = document.getElementById("loading-spinner"); // Loading spinner

  let isAdmin = false;

  // Fetch isAdmin status from the server
  try {
    const response = await fetch("/api/get-user-role", {
      method: "GET",
      credentials: "include", // Include cookies for authentication
    });

    if (!response.ok) {
      if (response.status === 401) {
        // User is not authenticated, redirect to login page
        window.location.href = "/login";
        return;
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }

    const data = await response.json();
    isAdmin = data.isAdmin || false;

    // Proceed with your script now that isAdmin is set
    initializeFactSheetScript(isAdmin);
  } catch (error) {
    console.error("Error fetching isAdmin status:", error);
    alert("An error occurred while verifying your access. Please try again.");
  }

  function initializeFactSheetScript(isAdmin) {
    // Function to calculate totals dynamically
    function calculateTotals() {
      const prekAge4 =
        parseFloat(document.getElementById("prek-age4").value) || 0;
      const halfdayK =
        parseFloat(document.getElementById("halfday-k").value) || 0;
      const fulldayK =
        parseFloat(document.getElementById("fullday-k").value) || 0;
      const grade1_7 =
        parseFloat(document.getElementById("grade-1-7").value) || 0;
      const grade8 = parseFloat(document.getElementById("grade-8").value) || 0;
      const grade9 = parseFloat(document.getElementById("grade-9").value) || 0;
      const grade10 =
        parseFloat(document.getElementById("grade-10").value) || 0;
      const grade11 =
        parseFloat(document.getElementById("grade-11").value) || 0;
      const grade12 =
        parseFloat(document.getElementById("grade-12").value) || 0;

      // Calculate totals
      const totalK7 = prekAge4 + halfdayK + fulldayK + grade1_7;
      const total8_12 = grade8 + grade9 + grade10 + grade11 + grade12;
      const totalK12 = totalK7 + total8_12;

      // Set the calculated values in the respective input fields
      document.getElementById("total-k-7").value = totalK7;
      document.getElementById("total-8-12").value = total8_12;
      document.getElementById("total-k-12").value = totalK12;
    }

    // Function to populate the form with fetched data
    function populateForm(data, schoolNum) {
      document.getElementById("school-number").value = schoolNum;
      document.getElementById("founded").value = data.FOUNDED;
      document.getElementById("school").value = data.SCHOOL;
      document.getElementById("authority").value = data.AUTHORITY;
      document.getElementById("address").value = data.ADDRESS;
      document.getElementById("saddress").value = data.SADDRESS;
      document.getElementById("city").value = data.CITY;
      document.getElementById("postal").value = data.POSTAL;
      document.getElementById("phone").value = data.PHONE;
      document.getElementById("fax").value = data.FAX;
      document.getElementById("website").value = data.Website;
      document.getElementById("email").value = data.Email;
      document.getElementById("first-name").value = data.FIRST;
      document.getElementById("last-name").value = data.LAST;
      document.getElementById("degree").value = data.DEGREE;

      // Populate enrollment fields
      document.getElementById("prek-age4").value = data.PrekAge4;
      document.getElementById("halfday-k").value = data.Halfday_k;
      document.getElementById("fullday-k").value = data.Fullday_k;
      document.getElementById("grade-1-7").value = data["1_7"];
      document.getElementById("ungraded-elem").value = data.UNE;
      document.getElementById("grade-8").value = data["8"];
      document.getElementById("grade-9").value = data["9"];
      document.getElementById("grade-10").value = data["10"];
      document.getElementById("grade-11").value = data["11"];
      document.getElementById("grade-12").value = data["12"];
      document.getElementById("ungraded-sec").value = data.UNS;

      // Populate school type fields
      document.getElementById("funding").value = data.FUNDING;
      document.getElementById("specialty").value = data.SPECIALTY;

      // Populate relationship fields
      document.getElementById("fisa").value =
        data.FISA === "True" ? "True" : "False";
      document.getElementById("assoc").value = data.ASSOC;
      document.getElementById("sdnum").value = data.SDNUM;
      document.getElementById("sd").value = data.SD;
      document.getElementById("electoral").value = data.ElectoralNew;

      // Call calculateTotals to update totals
      calculateTotals();

      // Unhide the form for editing
      schoolDataDiv.classList.remove("hidden");
    }

    // Function to display error messages
    function showError(message) {
      if (errorMessageDiv) {
        errorMessageDiv.textContent = message;
        errorMessageDiv.classList.remove("hidden");
      } else {
        alert(message);
      }
    }

    function hideError() {
      if (errorMessageDiv) {
        errorMessageDiv.textContent = "";
        errorMessageDiv.classList.add("hidden");
      }
    }

    // Function to toggle loading spinner
    function showLoading() {
      if (loadingSpinner) {
        loadingSpinner.classList.remove("hidden");
      }
    }

    function hideLoading() {
      if (loadingSpinner) {
        loadingSpinner.classList.add("hidden");
      }
    }

    // Function to fetch and populate data based on school number
    async function fetchAndPopulate(schoolNum) {
      if (schoolNum) {
        try {
          hideError(); // Hide any previous errors
          showLoading(); // Show loading spinner
          console.log(`Fetching data for schoolNum: ${schoolNum}`); // Debug log

          // Fetch data from the API
          const response = await fetch(
            `/api/fact-sheet/?schoolNum=${encodeURIComponent(schoolNum)}`
          );

          if (!response.ok) {
            if (response.status === 404) {
              throw new Error("School not found.");
            } else {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
          }

          const data = await response.json();

          // Check if the API returned an error
          if (data.error) {
            console.error("API Error:", data.error);
            showError(`Error: ${data.error}`);
            return;
          }

          // Populate the form with fetched data
          populateForm(data, schoolNum);
        } catch (error) {
          console.error("Error fetching school data:", error);
          showError(
            error.message ||
              "Failed to fetch school data. Please try again later."
          );
        } finally {
          hideLoading(); // Hide loading spinner
        }
      }
    }

    // Recalculate totals when enrollment fields change
    const enrollmentFields = [
      "prek-age4",
      "halfday-k",
      "fullday-k",
      "grade-1-7",
      "grade-8",
      "grade-9",
      "grade-10",
      "grade-11",
      "grade-12",
    ];

    enrollmentFields.forEach((fieldId) => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.addEventListener("input", calculateTotals);
      }
    });

    // Event listener for the school form submission
    schoolForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      hideError(); // Hide any previous errors
      showLoading(); // Show loading spinner

      // Collect form data
      const formData = {
        schoolNum: document.getElementById("school-number").value,
        founded: document.getElementById("founded").value,
        school: document.getElementById("school").value,
        authority: document.getElementById("authority").value,
        address: document.getElementById("address").value,
        saddress: document.getElementById("saddress").value,
        city: document.getElementById("city").value,
        postal: document.getElementById("postal").value,
        phone: document.getElementById("phone").value,
        fax: document.getElementById("fax").value,
        website: document.getElementById("website").value,
        email: document.getElementById("email").value,
        firstName: document.getElementById("first-name").value,
        lastName: document.getElementById("last-name").value,
        degree: document.getElementById("degree").value,
        prekAge4: document.getElementById("prek-age4").value,
        halfdayK: document.getElementById("halfday-k").value,
        fulldayK: document.getElementById("fullday-k").value,
        grade1_7: document.getElementById("grade-1-7").value,
        ungradedElem: document.getElementById("ungraded-elem").value,
        grade8: document.getElementById("grade-8").value,
        grade9: document.getElementById("grade-9").value,
        grade10: document.getElementById("grade-10").value,
        grade11: document.getElementById("grade-11").value,
        grade12: document.getElementById("grade-12").value,
        ungradedSec: document.getElementById("ungraded-sec").value,
        funding: document.getElementById("funding").value,
        specialty: document.getElementById("specialty").value,
        assoc: document.getElementById("assoc").value,
        sdnum: document.getElementById("sdnum").value,
        sd: document.getElementById("sd").value,
        electoral: document.getElementById("electoral").value,
        fisa: document.getElementById("fisa").value, // This will be either "True" or "False"
      };

      // Optional: Validate form data here

      try {
        let response;
        if (isAdmin) {
          // If admin, update the main database directly
          response = await fetch(`/api/update-school`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          });
        } else {
          // If user, submit proposed changes
          response = await fetch(`/api/client-update-school`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          });
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        alert(result.message);
      } catch (error) {
        console.error("Error submitting data:", error);
        showError(
          error.message ||
            "An error occurred while submitting your changes. Please try again."
        );
      } finally {
        hideLoading(); // Hide loading spinner
      }
    });

    // Add event listener for the search button
    const searchButton = document.getElementById("search-button");
    const searchInput = document.getElementById("search-input");

    if (searchButton && searchInput) {
      searchButton.addEventListener("click", function (event) {
        event.preventDefault();
        const schoolNum = searchInput.value.trim();
        if (schoolNum) {
          fetchAndPopulate(schoolNum);
        } else {
          showError("Please enter a school number to search.");
        }
      });
    }

    // Optionally, you can fetch data immediately if schoolNum is in URL
    const initialSchoolNum = new URLSearchParams(window.location.search).get(
      "schoolNum"
    );
    if (initialSchoolNum) {
      fetchAndPopulate(initialSchoolNum);
    }
  }
});
