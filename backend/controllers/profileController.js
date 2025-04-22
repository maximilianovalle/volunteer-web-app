const db_con = require("../db");

exports.validateProfile = (req, res, next) => {
    console.log("Validating profile data:", req.body);
    
    const { name, address1, address2, city, state, zipcode, skills, preferences, availabilityDates } = req.body;
    let errors = [];

    if (!name || name.length > 50) {
        errors.push("Name is required and should be at most 50 characters.");
    }
    if (!address1 || address1.length > 100) {
        errors.push("Address 1 is required and should be at most 100 characters.");
    }
    if (!city || city.length > 100) {
        errors.push("City is required and should be at most 100 characters.");
    }
    if (!state) {
        errors.push("State selection is required.");
    }
    if (!zipcode || !/^[0-9]{5}(-[0-9]{4})?$/.test(zipcode)) {
        errors.push("Zip Code is required and must be 5 or 9 digits.");
    }
    if (!skills || skills.length === 0) {
        errors.push("At least one skill must be selected.");
    }
    if (!availabilityDates || availabilityDates.length === 0) {
        errors.push("At least one availability date must be selected.");
    }

    if (errors.length > 0) {
        console.log("Validation errors:", errors);
        return res.status(400).json({ errors });
    }
    console.log("Validation successful");
    next();
};

exports.handleProfileSubmission = async (req, res) => {
    const { name, address1, address2, city, state, zipcode, skills, preferences, availabilityDates } = req.body;
    console.log("Processing profile submission:", { name, address1, city, state, zipcode });

    const userId = 1;

    const skillsString = Array.isArray(skills) ? skills.join(',') : skills;
    const availabilityString = Array.isArray(availabilityDates) ? availabilityDates.join(',') : availabilityDates;

    const sqlQuery = `
        INSERT INTO profile_user (
            UserID, Full_Name, Street_Address, Street_Address_2, 
            City, State_Code, Zip_Code, Skills, Preferences, Availability
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
            Full_Name = VALUES(Full_Name),
            Street_Address = VALUES(Street_Address),
            Street_Address_2 = VALUES(Street_Address_2),
            City = VALUES(City),
            State_Code = VALUES(State_Code),
            Zip_Code = VALUES(Zip_Code),
            Skills = VALUES(Skills),
            Preferences = VALUES(Preferences),
            Availability = VALUES(Availability)
    `;

    const params = [
        userId,
        name,
        address1,
        address2 || null,
        city,
        state,
        zipcode,
        skillsString,
        preferences || null,
        availabilityString
    ];

    console.log("Executing SQL with params:", params);

    try {
        const [result] = await db_con.query(sqlQuery, params);
        console.log("Profile saved successfully:", result);
        return res.status(200).json({ 
            message: "Profile submitted successfully!",
            profileId: result.insertId
        });
    } catch (err) {
        console.error("Error saving profile:", err);
        return res.status(500).json({ 
            error: "Failed to save profile information", 
            details: err.message 
        });
    }
};
