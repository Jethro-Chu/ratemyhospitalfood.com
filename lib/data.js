// lib/data.js

// Initial mock data
const initialHospitals = [
    {
        id: '1',
        name: 'City of Hope',
        location: 'Duarte, CA',
        rating: 0,
        numRatings: 0,
        tags: [],
        reviews: []
    },
    {
        id: '2',
        name: 'Cedars-Sinai Medical Center',
        location: 'Los Angeles, CA',
        rating: 0,
        numRatings: 0,
        tags: [],
        reviews: []
    },
    {
        id: '3',
        name: "Children's Hospital Los Angeles (CHLA)",
        location: 'Los Angeles, CA',
        rating: 0,
        numRatings: 0,
        tags: [],
        reviews: []
    },
    {
        id: '4',
        name: 'Huntington Hospital',
        location: 'Pasadena, CA',
        rating: 0,
        numRatings: 0,
        tags: [],
        reviews: []
    }
];

export const getHospitals = () => {
    // In a real app, this would fetch from an API/DB
    // For now, we'll try to read from localStorage if on client, otherwise return static
    try {
        const stored = localStorage.getItem('hospitals');
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        // ignore
    }
    return initialHospitals;
};

export const saveHospital = (hospital) => {
    try {
        const current = getHospitals();
        const newHospital = { ...hospital, id: Date.now().toString(), rating: 0, numRatings: 0 };
        const updated = [...current, newHospital];
        localStorage.setItem('hospitals', JSON.stringify(updated));
        return newHospital;
    } catch (e) {
        console.error("Failed to save", e);
        return null;
    }
};

export const getHospitalById = (id) => {
    const hospitals = getHospitals();
    return hospitals.find(h => h.id === id);
};

export const saveRating = (hospitalId, rating, comment, name, imageUrl) => {
    try {
        const hospitals = getHospitals();
        const hospitalIndex = hospitals.findIndex(h => h.id === hospitalId);

        if (hospitalIndex === -1) return false;

        const hospital = hospitals[hospitalIndex];

        // Calculate new average
        const newNumRatings = (hospital.numRatings || 0) + 1;
        const currentTotal = (hospital.rating || 0) * (hospital.numRatings || 0);
        const newRating = (currentTotal + rating) / newNumRatings;

        // Add review (mocking a review structure)
        const newReview = {
            id: Date.now().toString(),
            rating,
            comment,
            name,
            image_url: imageUrl || null,
            date: new Date().toLocaleDateString()
        };

        const updatedHospital = {
            ...hospital,
            rating: newRating,
            numRatings: newNumRatings,
            reviews: [newReview, ...(hospital.reviews || [])]
        };

        hospitals[hospitalIndex] = updatedHospital;
        localStorage.setItem('hospitals', JSON.stringify(hospitals));
        return updatedHospital;
    } catch (e) {
        console.error("Failed to save rating", e);
        return false;
    }
};
