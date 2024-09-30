document.addEventListener("DOMContentLoaded", function () {
  const searchForm = document.getElementById("search-form");
  const schoolDataDiv = document.getElementById("school-data");
  const schoolForm = document.getElementById("school-form");

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
    const grade10 = parseFloat(document.getElementById("grade-10").value) || 0;
    const grade11 = parseFloat(document.getElementById("grade-11").value) || 0;
    const grade12 = parseFloat(document.getElementById("grade-12").value) || 0;

    // Calculate totals
    const totalK7 = prekAge4 + halfdayK + fulldayK + grade1_7;
    const total8_12 = grade8 + grade9 + grade10 + grade11 + grade12;
    const totalK12 = totalK7 + total8_12;

    // Set the calculated values in the respective input fields
    document.getElementById("total-k-7").value = totalK7;
    document.getElementById("total-8-12").value = total8_12;
    document.getElementById("total-k-12").value = totalK12;
  }

  searchForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    // Get the schoolNum value from the form input
    const schoolNum = document.getElementById("schoolNum").value;

    try {
      // Fetch data from the API
      const response = await fetch(
        `http://localhost:4321/api/fact-sheet/?schoolNum=${schoolNum}`
      );
      const data = await response.json();

      // Populate the form fields with fetched data
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
      document.getElementById("assoc").value = data.ASSOC;
      document.getElementById("sdnum").value = data.SDNUM;
      document.getElementById("sd").value = data.SD;
      document.getElementById("electoral").value = data.ElectoralNew;

      // Call calculateTotals to update totals
      calculateTotals();

      // Unhide the form for editing
      schoolDataDiv.classList.remove("hidden");
    } catch (error) {
      console.error("Error fetching school data:", error);
    }
  });

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
    document.getElementById(fieldId).addEventListener("input", calculateTotals);
  });
});
