import Database from "better-sqlite3";

// Helper function to log changes to the change log
function logChange(
  db,
  schoolNum,
  fieldChanged,
  oldValue,
  newValue,
  updatedBy,
  activeTable
) {
  // Ensure values are strings or null before binding
  const sanitizedOldValue =
    oldValue === undefined || oldValue === null ? null : String(oldValue);
  const sanitizedNewValue =
    newValue === undefined || newValue === null ? null : String(newValue);
  const sanitizedUpdatedBy =
    updatedBy === undefined || updatedBy === null
      ? "unknown"
      : String(updatedBy);
  const sanitizedActiveTable =
    activeTable === undefined || activeTable === null
      ? "unknown"
      : String(activeTable);

  const insertLog = db.prepare(`
    INSERT INTO school_change_log (school_num, field_changed, old_value, new_value, updated_by, active_table_at_change) 
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertLog.run(
    String(schoolNum), // Ensure schoolNum is a string
    String(fieldChanged), // Ensure fieldChanged is a string
    sanitizedOldValue, // Convert oldValue to a string or null
    sanitizedNewValue, // Convert newValue to a string or null
    sanitizedUpdatedBy, // Ensure updatedBy is a string
    sanitizedActiveTable // Ensure activeTable is a string
  );
}



export async function POST({ request }) {
  // Parse the request body
  const bodyText = await request.text();
  const formData = JSON.parse(bodyText); // Convert the request body to JSON

  const schoolNum = formData.schoolNum;
  const updatedBy = "admin"; // Placeholder; replace with actual user

  // Open the SQLite database
  const db = new Database("./data/FISA.db");

  // Fetch the existing data for comparison
  const existingDataQuery = `
    SELECT 
      FOUNDED, AUTHORITY, ADDRESS, SADDRESS, CITY, POSTAL, PHONE, FAX, Website, Email, FIRST, LAST, DEGREE,
      PrekAge4, Halfday_k, Fullday_k, "1_7", UNE, "8", "9", "10", "11", "12", UNS,
      FUNDING, SPECIALTY, ASSOC, SDNUM, SD, ElectoralNew, FISA
    FROM "all_schools_2024-2025" 
    WHERE SCHOOL_NUM = ?
  `;
  const existingData = db.prepare(existingDataQuery).get(schoolNum);

  // Prepare the query for updating the database
  const updateQuery = `
    UPDATE "all_schools_2024-2025"
    SET 
      FOUNDED = ?, AUTHORITY = ?, ADDRESS = ?, SADDRESS = ?, CITY = ?, POSTAL = ?, PHONE = ?, FAX = ?, Website = ?, Email = ?, FIRST = ?, LAST = ?, DEGREE = ?,
      PrekAge4 = ?, Halfday_k = ?, Fullday_k = ?, "1_7" = ?, UNE = ?, "8" = ?, "9" = ?, "10" = ?, "11" = ?, "12" = ?, UNS = ?,
      FUNDING = ?, SPECIALTY = ?, ASSOC = ?, SDNUM = ?, SD = ?, ElectoralNew = ?, FISA = ?
    WHERE SCHOOL_NUM = ?
  `;

  

  // Extract form values and sanitize them
  const newValues = [
    sanitizeValue(formData.founded),
    sanitizeValue(formData.authority),
    sanitizeValue(formData.address),
    sanitizeValue(formData.saddress),
    sanitizeValue(formData.city),
    sanitizeValue(formData.postal),
    sanitizeValue(formData.phone),
    sanitizeValue(formData.fax),
    sanitizeValue(formData.website),
    sanitizeValue(formData.email),
    sanitizeValue(formData.firstName),
    sanitizeValue(formData.lastName),
    sanitizeValue(formData.degree),
    sanitizeValue(formData.prekAge4),
    sanitizeValue(formData.halfdayK),
    sanitizeValue(formData.fulldayK),
    sanitizeValue(formData.grade1_7),
    sanitizeValue(formData.ungradedElem),
    sanitizeValue(formData.grade8),
    sanitizeValue(formData.grade9),
    sanitizeValue(formData.grade10),
    sanitizeValue(formData.grade11),
    sanitizeValue(formData.grade12),
    sanitizeValue(formData.ungradedSec),
    sanitizeValue(formData.funding),
    sanitizeValue(formData.specialty),
    sanitizeValue(formData.assoc),
    sanitizeValue(formData.sdnum),
    sanitizeValue(formData.sd),
    sanitizeValue(formData.electoral),
    sanitizeValue(formData.fisa, true), // Explicitly mark fisa as a boolean field
    schoolNum,
  ];


  // Compare existing data with new data and log changes
  const fields = [
    "FOUNDED",
    "AUTHORITY",
    "ADDRESS",
    "SADDRESS",
    "CITY",
    "POSTAL",
    "PHONE",
    "FAX",
    "Website",
    "Email",
    "FIRST",
    "LAST",
    "DEGREE",
    "PrekAge4",
    "Halfday_k",
    "Fullday_k",
    "1_7",
    "UNE",
    "8",
    "9",
    "10",
    "11",
    "12",
    "UNS",
    "FUNDING",
    "SPECIALTY",
    "ASSOC",
    "SDNUM",
    "SD",
    "ElectoralNew",
    "FISA",
  ];

  fields.forEach((field, index) => {
    const oldValue = existingData[field];
    const newValue = newValues[index];
    if (oldValue !== newValue) {
      logChange(db, schoolNum, field, oldValue, newValue, updatedBy); // Calling logChange
    }
  });

  // Execute the update query
  const updateStmt = db.prepare(updateQuery);
  updateStmt.run(...newValues);

  // Close the database connection
  db.close();

  return new Response(
    JSON.stringify({ message: "Data updated successfully" }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

// Helper function to sanitize form values for SQLite
function sanitizeValue(value, isBoolean = false) {
  if (value === undefined || value === null) {
    return null; // SQLite accepts null
  }

  if (isBoolean) {
    // If it's a boolean field (like fisa), return "True" or "False"
    return value === "Yes" || value === true || value === "True" ? "True" : "False";
  }

  return String(value); // Convert everything else to a string
}
