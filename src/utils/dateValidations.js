
function validateDob(dateOfBirth) {
    const currentDate = new Date();
    const minAgeDate = new Date(currentDate.getFullYear() - 100, currentDate.getMonth(), currentDate.getDate());
    const maxAgeDate = new Date(currentDate.getFullYear() - 16, currentDate.getMonth(), currentDate.getDate());
    const selectedDate = new Date(dateOfBirth);
    if (!isNaN(selectedDate) && selectedDate >= minAgeDate && selectedDate <= maxAgeDate) {
        return true
    } else {
        return false
    }
}

module.exports = {
    validateDob
}
