document.addEventListener("DOMContentLoaded", function () {
  const searchForm = document.getElementById("search-form");
  const schoolDataDiv = document.getElementById("school-data");
  const schoolForm = document.getElementById("school-form");

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

      // Unhide the form for editing
      schoolDataDiv.classList.remove("hidden");
    } catch (error) {
      console.error("Error fetching school data:", error);
    }
  });
});
