exports.validateProfile = (req, res, next) => {
    const { name, address1, city, state, zipcode, skills, availabilityDates } = req.body;
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
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
        errors.push("At least one skill must be selected.");
    }
    if (availabilityDates && !Array.isArray(availabilityDates)) {
        errors.push("Availability must be an array of dates.");
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }
    next();
};

exports.handleProfileSubmission = (req, res) => {
    res.status(200).json({ message: "Profile submitted successfully!" });
};