/**
 * Calculates the priority score for a patient based on age and condition.
 * Base Score: 1
 * Elderly (+5): Age >= 60
 * High Risk (+10): Disabled or Pregnant
 */
const calculatePriority = (dob, specialNeeds) => {
    let score = 1; // The basic sign a normal patient receives

    // 1. Age calculation
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    // 2. Priority given to those over 60 years of age
    if (age >= 60) {
        score += 5;
    }

    // 3.Giving priority to special needs
    if (specialNeeds === 'Disabled' || specialNeeds === 'Pregnant') {
        score += 10;
    }

    return score;
};

module.exports = calculatePriority;