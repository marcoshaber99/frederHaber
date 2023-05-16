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
  
    if (requestBody.registration_number && requestBody.registration_number !== '') {
        if (!/^\d{5}$/.test(requestBody.registration_number)) {
          errors.registration_number = 'Registration number should be a 5 digit numeric value';
        }
    }
    
      
  
    if (!requestBody.phone_number || !/^\d+$/.test(requestBody.phone_number)) {
      errors.phone_number = 'Phone number is required and should only contain numbers';
    }
  
    if (!requestBody.course_title || requestBody.course_title.length > 55) {
      errors.course_title = 'Course title is required and should not be more than 55 characters';
    }
  
    if (!requestBody.academic_year || ![1, 2, 3, 4].includes(Number(requestBody.academic_year))) {
      errors.academic_year = 'Academic year is required and should be a number between 1-4';
    }
  
    if (!requestBody.education_level || requestBody.education_level === 'Select education level') {
      errors.education_level = 'Education level is required and cannot be left as the default';
    }
  
    if (!requestBody.city || requestBody.city === 'Select city') {
      errors.city = 'City is required and cannot be left as the default';
    }
    
    return errors;
  };
  