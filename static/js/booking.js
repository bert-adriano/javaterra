// ============================================
// JAVATERRA BOOKING SYSTEM - Frontend
// ============================================

// Current step tracker
let currentStep = 1;
const totalSteps = 5;

let isSubmitting = false;
let bookingCompleted = false;

// ============================================
// INITIALIZATION - Runs when page loads
// ============================================
document.addEventListener("DOMContentLoaded", function () {
    initializeDatePicker();
    setupEventListeners();
    showStep(1);
    checkSavedData();
});

// ============================================
// DATE PICKER SETUP
// ============================================
function initializeDatePicker() {
    const today = new Date();
    const bookingDateInput = document.getElementById("bookingDate");
    
    if (bookingDateInput) {
        bookingDateInput.min = today.toISOString().split("T")[0];
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        bookingDateInput.value = tomorrow.toISOString().split("T")[0];
    }
}

// ============================================
// EVENT LISTENERS SETUP
// ============================================
function setupEventListeners() {
    // Step 1 listeners (Booking)
    document.getElementById('destination')?.addEventListener('change', calculateTotal);
    document.getElementById('busType')?.addEventListener('change', calculateTotal);
    document.getElementById('departure')?.addEventListener('change', calculateTotal);
    document.getElementById('bookingDate')?.addEventListener('change', validateForm);
    document.getElementById('departureTime')?.addEventListener('change', validateForm);

    // Step 2 listeners (Biodata)
    document.getElementById('username')?.addEventListener('input', validateStep2);
    document.getElementById('kelahiran')?.addEventListener('input', validateStep2);
    document.getElementById('email')?.addEventListener('input', validateStep2);
    document.getElementById('alamat')?.addEventListener('input', validateStep2);
    document.getElementById('phone')?.addEventListener('input', validateStep2);

    // Navigation buttons
    document.querySelector('.btn-next')?.addEventListener('click', handleNextButton);
    document.querySelector('.btn-back')?.addEventListener('click', handleBackButton);
}

// ============================================
// NAVIGATION FUNCTIONS
// ============================================
function showStep(stepNumber) {
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
    });
    
    const targetStep = document.querySelector(`.step-${stepNumber}`);
    if (targetStep) {
        targetStep.classList.add('active');
    }
    
    updateSidebar(stepNumber);
    updateNavigationButtons(stepNumber);
    currentStep = stepNumber;
}

function updateSidebar(stepNumber) {
    document.querySelectorAll('.sidebar-item').forEach((item, index) => {
        item.classList.remove('active', 'completed');
        
        if (index + 1 < stepNumber) {
            item.classList.add('completed');
        } else if (index + 1 === stepNumber) {
            item.classList.add('active');
        }
    });
}

function updateNavigationButtons(stepNumber) {
    const backBtn = document.querySelector('.btn-back');
    const nextBtn = document.querySelector('.btn-next');
    
    if (!backBtn || !nextBtn) return;
    
    // Step 5: Hide BOTH buttons (we'll add custom buttons in HTML)
    if (stepNumber === 5) {
        backBtn.style.display = 'none';
        nextBtn.style.display = 'none';
        return;
    }
    
    // Back button - hide only on Step 1
    if (stepNumber === 1) {
        backBtn.style.display = 'none';
    } else {
        backBtn.style.display = 'block';
    }
    
    // Next button - always show except Step 5
    nextBtn.style.display = 'block';
    
    // Update next button text
    if (stepNumber === 4) {
        nextBtn.textContent = 'Selesai';
    } else {
        nextBtn.textContent = 'Next';
    }
}

function handleNextButton() {
    if (currentStep === 1) {
        saveAndNext();
    } else if (currentStep === 2) {
        saveStep2AndNext();
    } else if (currentStep === 3) {
        goToStep4();
    } else if (currentStep === 4) {
        goToStep5();
    }
}

function handleBackButton() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
    }
}

// ============================================
// STEP 1: BOOKING - Quantity Controls
// ============================================
function increaseQty() {
    const input = document.getElementById('ticketQty');
    input.value = parseInt(input.value) + 1;
    calculateTotal();
}

function decreaseQty() {
    const input = document.getElementById('ticketQty');
    if (parseInt(input.value) > 1) {
        input.value = parseInt(input.value) - 1;
        calculateTotal();
    }
}

// ============================================
// STEP 1: BOOKING - Price Calculation
// ============================================
function calculateTotal() {
    const destination = document.getElementById('destination');
    const departure = document.getElementById('departure');
    const busType = document.getElementById('busType');
    const quantity = parseInt(document.getElementById('ticketQty').value);

    if (!destination || !departure || !busType) return;

    const selectedDestination = destination.options[destination.selectedIndex];
    const basePrice = parseInt(selectedDestination.getAttribute('data-price')) || 0;

    const selectedDeparture = departure.options[departure.selectedIndex];
    const priceDeparture = parseInt(selectedDeparture.getAttribute('data-departure')) || 0;

    const selectedBusType = busType.options[busType.selectedIndex];
    const multiplier = parseInt(selectedBusType.getAttribute('data-bus')) || 0;

    const total = basePrice * quantity + (quantity * multiplier) + (priceDeparture * quantity);

    const totalElement = document.getElementById('totalPrice');
    if (totalElement) {
        if (total > 0) {
            totalElement.textContent = 'Rp' + total.toLocaleString('id-ID');
            totalElement.style.color = '#4CAF50';
        } else {
            totalElement.textContent = 'Rp0';
            totalElement.style.color = '#e63946';
        }
    }

    displayPriceInfo('busPriceInfo', multiplier, selectedBusType.value, 'Tambah');
    displayPriceInfo('departurePriceInfo', priceDeparture, true, 'Tambah');
    displayPriceInfo('destinationPriceInfo', basePrice, true, 'Harga destinasi');

    validateForm();
}

function displayPriceInfo(elementId, price, condition, label) {
    const element = document.getElementById(elementId);
    if (!element) return;

    if (price > 0 && condition) {
        element.textContent = `${label}: Rp${price.toLocaleString('id-ID')}/org`;
    } else {
        element.textContent = '';
    }
}

// ============================================
// STEP 1: BOOKING - Validation
// ============================================
function validateForm() {
    const fields = [
        document.getElementById('departure'),
        document.getElementById('destination'),
        document.getElementById('bookingDate'),
        document.getElementById('departureTime'),
        document.getElementById('busType')
    ];
    
    const nextBtn = document.querySelector('.btn-next');
    let isValid = true;

    fields.forEach(field => {
        if (!field || !field.value) {
            field?.classList.add('error');
            field?.classList.remove('success');
            isValid = false;
        } else {
            field.classList.remove('error');
            field.classList.add('success');
        }
    });

    if (nextBtn && currentStep === 1) {
        nextBtn.disabled = !isValid;
        nextBtn.style.opacity = isValid ? '1' : '0.5';
        nextBtn.style.cursor = isValid ? 'pointer' : 'not-allowed';
    }

    return isValid;
}

// ============================================
// STEP 1: BOOKING - Save and Next
// ============================================
function saveAndNext() {
    if (!validateForm()) {
        alert('Mohon lengkapi semua field!');
        return;
    }

    calculateTotal();

    const bookingData = {
        departure: document.getElementById('departure').value,
        destination: document.getElementById('destination').value,
        date: document.getElementById('bookingDate').value,
        time: document.getElementById('departureTime').value,
        busType: document.getElementById('busType').value,
        quantity: document.getElementById('ticketQty').value,
        totalPrice: document.getElementById('totalPrice').textContent
    };

    if (bookingData.totalPrice === 'Rp0') {
        alert('Total harga tidak valid! Pastikan semua field terisi.');
        return;
    }

    localStorage.setItem('bookingData', JSON.stringify(bookingData));
    showStep(2);
}

// ============================================
// STEP 2: BIODATA - Validation
// ============================================
function validateStep2() {
    const username = document.getElementById("username");
    const birth = document.getElementById("kelahiran");
    const email = document.getElementById("email");
    const address = document.getElementById("alamat");
    const phone = document.getElementById("phone");

    const fields = [username, birth, email, address, phone];
    let isValid = true;
    let errorMessages = [];

    fields.forEach(field => {
        if (!field) return;
        
        if (!field.value.trim()) {
            field.classList.add("error");
            field.classList.remove("success");
            isValid = false;
        } else {
            field.classList.remove("error");
            field.classList.add("success");
        }
    });

    if (email && email.value) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email.value)) {
            email.classList.add("error");
            email.classList.remove("success");
            isValid = false;
            errorMessages.push('Format email tidak valid! Contoh: nama@gmail.com');
        }
    }

    if (phone && phone.value) {
        if (phone.value.length < 9 || phone.value.length > 13) {
            phone.classList.add("error");
            phone.classList.remove("success");
            isValid = false;
            errorMessages.push('Nomor telepon harus 9-13 digit!');
        }
    }

    window.step2ErrorMessage = errorMessages.join('\n');

    const nextBtn = document.querySelector('.btn-next');
    if (nextBtn && currentStep === 2) {
        nextBtn.disabled = !isValid;
        nextBtn.style.opacity = isValid ? "1" : "0.5";
        nextBtn.style.cursor = isValid ? "pointer" : "not-allowed";
    }

    return isValid;
}

// ============================================
// STEP 2: BIODATA - Save and Next
// ============================================
function saveStep2AndNext() {
    if (!validateStep2()) {
        alert(window.step2ErrorMessage || 'Mohon lengkapi semua data dengan benar!');
        return;
    }

    const biodataData = {
        username: document.getElementById('username').value,
        birth: document.getElementById('kelahiran').value,
        email: document.getElementById('email').value,
        address: document.getElementById('alamat').value,
        phone: document.getElementById('phone').value
    };

    localStorage.setItem('biodataData', JSON.stringify(biodataData));
    showStep(3);
    loadStep3Summary();
}

// ============================================
// STEP 3: KONFIRMASI - Load Summary
// ============================================
function loadStep3Summary() {
    const bookingData = JSON.parse(localStorage.getItem('bookingData'));
    const biodataData = JSON.parse(localStorage.getItem('biodataData'));

    if (!bookingData || !biodataData) {
        alert('Data tidak lengkap! Kembali ke awal.');
        showStep(1);
        return;
    }

    const step3 = document.querySelector('.step-3');
    if (!step3) return;

    const departureField = step3.querySelector('#departure');
    const destinationField = step3.querySelector('#destination');
    const dateField = step3.querySelector('#bookingDate');
    const timeField = step3.querySelector('#departureTime');
    const busTypeField = step3.querySelector('#busType');
    const qtyField = step3.querySelector('#ticketQty');
    const totalField = step3.querySelector('#totalPrice');

    if (departureField) departureField.value = bookingData.departure;
    if (destinationField) destinationField.value = bookingData.destination;
    if (dateField) dateField.value = bookingData.date;
    if (timeField) timeField.value = bookingData.time;
    if (busTypeField) busTypeField.value = bookingData.busType;
    if (qtyField) qtyField.value = bookingData.quantity;
    
    if (totalField) {
        totalField.textContent = bookingData.totalPrice;
        totalField.style.color = '#4CAF50';
    }

    const usernameField = step3.querySelector('#username');
    const birthField = step3.querySelector('#kelahiran');
    const emailField = step3.querySelector('#email');
    const addressField = step3.querySelector('#alamat');
    const phoneFields = step3.querySelectorAll('input[placeholder="08xxx"]');

    if (usernameField) usernameField.value = biodataData.username;
    if (birthField) birthField.value = biodataData.birth;
    if (emailField) emailField.value = biodataData.email;
    if (addressField) addressField.value = biodataData.address;
    if (phoneFields[0]) phoneFields[0].value = biodataData.phone;

    step3.querySelectorAll('input, select').forEach(field => {
        field.setAttribute('disabled', 'true');
        field.classList.add('success');
        field.style.color = '#000';
    });
}

function goToStep4() {
    showStep(4);
}

// ============================================
// STEP 4: PEMBAYARAN - Go to Step 5
// ============================================
function goToStep5() {
    // Prevent if already submitted
    if (bookingCompleted) {
        alert('Booking sudah selesai! Silakan refresh halaman untuk booking baru.');
        return;
    }
    
    // Prevent double submission
    if (isSubmitting) {
        alert('Sedang memproses booking... Mohon tunggu.');
        return;
    }
    
    showStep(5);
    saveToBackend();
}

// ============================================
// STEP 5: STATUS - Save to Backend & Display
// ============================================

function displayFinalBooking(bookingID, bookingData, biodataData) {
    // Update with new IDs from Step 5 HTML
    const step5BookingID = document.getElementById('step5BookingID');
    const step5Departure = document.getElementById('step5Departure');
    const step5Destination = document.getElementById('step5Destination');
    const step5Date = document.getElementById('step5Date');
    const step5Time = document.getElementById('step5Time');
    const step5Quantity = document.getElementById('step5Quantity');
    const step5Username = document.getElementById('step5Username');
    const step5Phone = document.getElementById('step5Phone');
    const step5Total = document.getElementById('step5Total');

    if (step5BookingID) step5BookingID.textContent = bookingID;
    if (step5Departure) step5Departure.textContent = bookingData.departure;
    if (step5Destination) step5Destination.textContent = bookingData.destination;
    if (step5Date) step5Date.textContent = bookingData.date;
    if (step5Time) step5Time.textContent = bookingData.time;
    if (step5Quantity) step5Quantity.textContent = bookingData.quantity;
    if (step5Username) step5Username.textContent = biodataData.username;
    if (step5Phone) step5Phone.textContent = biodataData.phone;
    if (step5Total) step5Total.textContent = bookingData.totalPrice;
}

async function saveToBackend() {
    // Prevent multiple submissions
    if (isSubmitting) {
        return;
    }
    
    if (bookingCompleted) {
        alert('Booking sudah selesai!');
        return;
    }
    
    const bookingData = localStorage.getItem('bookingData');
    const biodataData = localStorage.getItem('biodataData');

    if (!bookingData || !biodataData) {
        alert('Data tidak lengkap! Silakan mulai dari awal.');
        // Clear bad data and restart
        localStorage.clear();
        window.location.reload();
        return;
    }

    const bookingDataObj = JSON.parse(bookingData);
    const biodataDataObj = JSON.parse(biodataData);

    const completeData = {
        departure: bookingDataObj.departure,
        destination: bookingDataObj.destination,
        date: bookingDataObj.date,
        time: bookingDataObj.time,
        busType: bookingDataObj.busType,
        quantity: bookingDataObj.quantity,
        totalPrice: bookingDataObj.totalPrice,
        username: biodataDataObj.username,
        birth: biodataDataObj.birth,
        email: biodataDataObj.email,
        address: biodataDataObj.address,
        phone: biodataDataObj.phone
    };

    // Set flag to prevent double submission
    isSubmitting = true;
    
    // Disable the "Selesai" button if user goes back
    const nextBtn = document.querySelector('.btn-next');
    if (nextBtn) {
        nextBtn.disabled = true;
        nextBtn.textContent = 'Memproses...';
    }

    try {
        const response = await fetch('/api/create-booking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(completeData)
        });

        const result = await response.json();

        if (result.success) {
            // Mark as completed
            bookingCompleted = true;
            
            // Save booking ID
            localStorage.setItem('lastBookingID', result.booking_id);
            
            // CLEAR the in-progress data
            localStorage.removeItem('bookingData');
            localStorage.removeItem('biodataData');
            
            // Display booking details
            displayFinalBooking(result.booking_id, bookingDataObj, biodataDataObj);
        } else {
            alert('Error: ' + result.error);
            console.error('Backend error:', result);
            
            // Reset flags on error
            isSubmitting = false;
            if (nextBtn) {
                nextBtn.disabled = false;
                nextBtn.textContent = 'Selesai';
            }
        }
    } catch (error) {
        console.error('Error saving booking:', error);
        alert('Gagal menyimpan booking. Silakan coba lagi.');
        
        // Reset flags on error
        isSubmitting = false;
        if (nextBtn) {
            nextBtn.disabled = false;
            nextBtn.textContent = 'Selesai';
        }
    }

}

function handleBackButton() {
    // Prevent going back from Step 5
    if (currentStep === 5) {
        alert('Booking sudah selesai! Gunakan tombol "Ke Beranda" atau "Booking Baru".');
        return;
    }
    
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
    }
}
// ============================================
// UTILITY: Check for saved data on page load
// ============================================
function checkSavedData() {
    const savedBooking = localStorage.getItem('bookingData');
    const savedBiodata = localStorage.getItem('biodataData');
    const lastBookingID = localStorage.getItem('lastBookingID');
    
    // If just completed booking, don't prompt
    if (lastBookingID && !savedBooking && !savedBiodata) {
        return;
    }
    
    // Incomplete booking (Step 1 only)
    if (savedBooking && !savedBiodata) {
        const resume = confirm('Anda memiliki booking yang belum selesai. Lanjutkan?');
        if (resume) {
            loadSavedBookingData();
            showStep(1);
        } else {
            localStorage.removeItem('bookingData');
        }
        return;
    }
    
    // Mid-process (has both)
    if (savedBooking && savedBiodata) {
        const resume = confirm('Anda sedang di tengah proses booking. Lanjutkan ke biodata?');
        if (resume) {
            loadSavedBookingData();
            loadSavedBiodataData();
            showStep(2);
        } else {
            localStorage.removeItem('bookingData');
            localStorage.removeItem('biodataData');
        }
    }
}

// Load saved booking data into Step 1 form
function loadSavedBookingData() {
    const savedBooking = localStorage.getItem('bookingData');
    if (!savedBooking) return;
    
    const bookingData = JSON.parse(savedBooking);
    
    document.getElementById('departure').value = bookingData.departure || '';
    document.getElementById('destination').value = bookingData.destination || '';
    document.getElementById('bookingDate').value = bookingData.date || '';
    document.getElementById('departureTime').value = bookingData.time || '';
    document.getElementById('busType').value = bookingData.busType || '';
    document.getElementById('ticketQty').value = bookingData.quantity || '1';
    
    calculateTotal();
}

// Load saved biodata into Step 2 form
function loadSavedBiodataData() {
    const savedBiodata = localStorage.getItem('biodataData');
    if (!savedBiodata) return;
    
    const biodataData = JSON.parse(savedBiodata);
    
    document.getElementById('username').value = biodataData.username || '';
    document.getElementById('kelahiran').value = biodataData.birth || '';
    document.getElementById('email').value = biodataData.email || '';
    document.getElementById('alamat').value = biodataData.address || '';
    document.getElementById('phone').value = biodataData.phone || '';
}

// Start completely new booking
function startNewBooking() {
    if (confirm('Mulai booking baru? Data saat ini akan dihapus.')) {
        localStorage.clear();
        window.location.reload();
    }
}
// ============================================
// UTILITY: Clear all booking data
// ============================================
function clearAllData() {
    if (confirm('Yakin ingin menghapus semua data?')) {
        localStorage.clear();
        showStep(1);
        location.reload();
    }
}

// ============================================
// UTILITY: Start fresh booking
// ============================================
function startNewBooking() {
    // Clear all localStorage
    localStorage.removeItem('bookingData');
    localStorage.removeItem('biodataData');
    localStorage.removeItem('lastBookingID');
    
    // Reload page to start fresh
    window.location.reload();
}

// ============================================
// NAVIGATION HELPERS
// ============================================
function goToHomePage() {
    window.location.href = '/';
}

function startNewBooking() {
    if (confirm('Mulai booking baru?')) {
        // Clear all data
        localStorage.clear();
        
        // Reset flags
        isSubmitting = false;
        bookingCompleted = false;
        
        // Reload page
        window.location.reload();
    }
}