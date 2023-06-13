exports.validateAdminRequest = (requestBody) => {
  const errors = {};
  
  if (!requestBody.percentage || isNaN(requestBody.percentage) || requestBody.percentage < 1 || requestBody.percentage > 100) {
    errors.percentage = 'Percentage is required and should be a numeric value between 1 and 100';
  }
  if (!requestBody.scholarshipCategory || requestBody.scholarshipCategory === 'Select category') {
    errors.scholarshipCategory = 'Scholarship Category is required';
  }
  if (!requestBody.otherScholarship || (requestBody.otherScholarship !== 'YES' && requestBody.otherScholarship !== 'NO')) {
    errors.otherScholarship = 'Field for other scholarship is required and should be either YES or NO';
  }
  if (requestBody.otherScholarship === 'YES' && (!requestBody.otherScholarshipPercentage || isNaN(requestBody.otherScholarshipPercentage) || requestBody.otherScholarshipPercentage < 1 || requestBody.otherScholarshipPercentage > 100)) {
    errors.otherScholarshipPercentage = 'If other scholarship is YES, percentage for other scholarship is required and should be a numeric value between 1 and 100';
  }
  if (!requestBody.adminFullName || requestBody.adminFullName.length > 100) {
    errors.adminFullName = 'Admin Full Name is required and should not be more than 100 characters';
  }
  if (!requestBody.date || isNaN(Date.parse(requestBody.date))) {
    errors.date = 'Date is required and should be a valid date';
  }
  if (!requestBody.comments || requestBody.comments.length > 500) {
    errors.comments = 'Comments are required and should not be more than 500 characters';
  }
  
  return errors;
};
