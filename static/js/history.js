// ============================================
// JAVATERRA - HISTORY/SEARCH PAGE
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    setupSearchForm();
});

function setupSearchForm() {
    const searchForm = document.getElementById('searchForm');
    const searchButton = document.getElementById('searchButton');
    const nameInput = document.getElementById('searchName');

    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            searchBookings();
        });
    }

    if (searchButton) {
        searchButton.addEventListener('click', searchBookings);
    }

    if (nameInput) {
        nameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchBookings();
            }
        });
    }
}

async function searchBookings() {
    const nameInput = document.getElementById('searchName');
    const resultsContainer = document.getElementById('searchResults');
    const name = nameInput?.value.trim();

    if (!name) {
        alert('Masukkan nama untuk mencari booking');
        return;
    }

    // Show loading
    if (resultsContainer) {
        resultsContainer.innerHTML = '<div class="loading">Mencari booking...</div>';
    }

    try {
        const response = await fetch('/api/search-bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: name })
        });

        const data = await response.json();

        if (data.success) {
            displaySearchResults(data.bookings, data.count);
        } else {
            if (resultsContainer) {
                resultsContainer.innerHTML = `
                    <div class="error-message">
                        <p>❌ Error: ${data.error}</p>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Search error:', error);
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="error-message">
                    <p>❌ Gagal mencari booking. Silakan coba lagi.</p>
                </div>
            `;
        }
    }
}

function displaySearchResults(bookings, count) {
    const resultsContainer = document.getElementById('searchResults');
    
    if (!resultsContainer) return;

    if (count === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <h3>❌ Booking tidak ditemukan</h3>
                <a href="https://wa.me/628811313737">Salah memasukan nama pemesan? hubungin kami di +62 881-1313-737</a>
            </div>
        `;
        return;
    }

    let html = `
        <div class="results-header">
            <h3>✅ ${count} booking ditemukan</h3>
        </div>
        <div class="bookings-list">
    `;

    bookings.forEach((booking, index) => {
        const paymentStatusClass = booking.payment_status === 'paid' ? 'status-paid' : 'status-not-paid';
        const paymentStatusText = booking.payment_status === 'paid' ? 'LUNAS' : 'BELUM LUNAS';
        
        const bookingStatusClass = `status-${booking.booking_status}`;
        const bookingStatusText = booking.booking_status.toUpperCase();

        html += `
            <div class="booking-card">
                <div class="booking-header">
                    <h4>Booking #${index + 1}</h4>
                    <span class="booking-id">${booking.booking_id}</span>
                </div>
                <div class="booking-details">
                    <div class="detail-row">
                        <span class="label">Nama:</span>
                        <span class="value">${booking.username}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Rute:</span>
                        <span class="value">${booking.departure} → ${booking.destination}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Tanggal:</span>
                        <span class="value">${booking.date} - ${booking.time}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Tipe Bus:</span>
                        <span class="value">${booking.bus_type}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Jumlah Tiket:</span>
                        <span class="value">${booking.quantity} tiket</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Total:</span>
                        <span class="value price">${booking.total_price}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Status Booking:</span>
                        <span class="badge ${bookingStatusClass}">${bookingStatusText}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Status Pembayaran:</span>
                        <span class="badge ${paymentStatusClass}">${paymentStatusText}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Email:</span>
                        <span class="value">${booking.email}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Telepon:</span>
                        <span class="value">${booking.phone}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Dibuat:</span>
                        <span class="value">${new Date(booking.created_at).toLocaleString('id-ID')}</span>
                    </div>
                </div>
            </div>
        `;
    });

    html += '</div>';
    resultsContainer.innerHTML = html;
}