exports.validateRequest = (requestBody) => {
  const errors = {};

  if (!requestBody.first_name) {
    errors.first_name = 'First name is required';
  }
  if (!requestBody.last_name) {
    errors.last_name = 'Last name is required';
  }
  if (!requestBody.sport) {
    errors.sport = 'Sport is required';
  }
  if (!requestBody.description || requestBody.description.length > 200) {
    errors.description = 'Description is required and should not be more than 200 characters';
  }
  if (!requestBody.government_id || !/^\d+$/.test(requestBody.government_id)) {
    errors.government_id = 'Government ID is required and should only contain numbers';
  }
  if (requestBody.registration_number !== undefined && requestBody.registration_number !== '' && !/^\d+$/.test(requestBody.registration_number)) {
    errors.registration_number = 'Registration number should be a numeric value';
  }
  if (!requestBody.phone_number || !/^\d+$/.test(requestBody.phone_number)) {
    errors.phone_number = 'Phone number is required and should only contain numbers';
  }
  if (!requestBody.course_title || requestBody.course_title.length > 55) {
    errors.course_title = 'Course title is required and should not be more than 55 characters';
  }
  if (!requestBody.year_of_admission || isNaN(requestBody.year_of_admission) || parseInt(requestBody.year_of_admission, 10) < 1950 || parseInt(requestBody.year_of_admission, 10) > new Date().getFullYear()) {
    errors.year_of_admission = 'Year of admission is required and should be a number between 1950 and the current year';
  }
  if (!requestBody.education_level || requestBody.education_level === 'Select education level') {
    errors.education_level = 'Education level is required and cannot be left as the default';
  }
  if (!requestBody.city || requestBody.city === 'Select city') {
    errors.city = 'City is required and cannot be left as the default';
  }
    
    return errors;
  };
  