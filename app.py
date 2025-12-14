from flask import Flask, request, jsonify, render_template, session, redirect, url_for
from flask_cors import CORS
from datetime import datetime
import sqlite3
import os

app = Flask(__name__)
app.secret_key = 'javaterra-secret-key-2025'  # Change this to something random
CORS(app)

# Database file location
DATABASE = 'javaterra.db'

# ============================================
# DATABASE FUNCTIONS
# ============================================

def get_db_connection():
    """Connect to SQLite database"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row  # Return rows as dictionaries
    return conn
1
def init_db():
    """Initialize database with tables"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create bookings table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            booking_id TEXT UNIQUE NOT NULL,
            departure TEXT NOT NULL,
            destination TEXT NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            bus_type TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            total_price TEXT NOT NULL,
            username TEXT NOT NULL,
            birth_date TEXT NOT NULL,
            email TEXT NOT NULL,
            address TEXT NOT NULL,
            phone TEXT NOT NULL,
            payment_status TEXT DEFAULT 'not_paid',
            booking_status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()
    print("✅ Database initialized successfully!")

# Initialize database on startup
init_db()

# ============================================
# API ENDPOINTS FOR FRONTEND
# ============================================

@app.route('/api/create-booking', methods=['POST'])
def create_booking():
    """Create new booking - Called from Step 5"""
    try:
        data = request.get_json()
        
        # Generate unique booking ID
        booking_id = 'JVT' + str(int(datetime.now().timestamp()))[-8:]
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO bookings (
                booking_id, departure, destination, date, time, 
                bus_type, quantity, total_price, username, birth_date, 
                email, address, phone, payment_status, booking_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            booking_id,
            data.get('departure'),
            data.get('destination'),
            data.get('date'),
            data.get('time'),
            data.get('busType'),
            data.get('quantity'),
            data.get('totalPrice'),
            data.get('username'),
            data.get('birth'),
            data.get('email'),
            data.get('address'),
            data.get('phone'),
            'not_paid',
            'pending'
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'booking_id': booking_id,
            'message': 'Booking created successfully'
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/search-bookings', methods=['POST'])
def search_bookings():
    """Search bookings by name - For history page"""
    try:
        data = request.get_json()
        search_name = data.get('name', '').strip()
        
        if not search_name:
            return jsonify({
                'success': False,
                'error': 'Name is required'
            }), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Search by name (case-insensitive)
        cursor.execute('''
            SELECT * FROM bookings 
            WHERE LOWER(username) LIKE LOWER(?)
            ORDER BY created_at DESC
        ''', (f'%{search_name}%',))
        
        bookings = cursor.fetchall()
        conn.close()
        
        # Convert to list of dictionaries
        results = []
        for booking in bookings:
            results.append({
                'id': booking['id'],
                'booking_id': booking['booking_id'],
                'departure': booking['departure'],
                'destination': booking['destination'],
                'date': booking['date'],
                'time': booking['time'],
                'bus_type': booking['bus_type'],
                'quantity': booking['quantity'],
                'total_price': booking['total_price'],
                'username': booking['username'],
                'phone': booking['phone'],
                'email': booking['email'],
                'payment_status': booking['payment_status'],
                'booking_status': booking['booking_status'],
                'created_at': booking['created_at']
            })
        
        return jsonify({
            'success': True,
            'count': len(results),
            'bookings': results
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/booking/<booking_id>', methods=['GET'])
def get_booking(booking_id):
    """Get single booking by ID"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM bookings WHERE booking_id = ?', (booking_id,))
        booking = cursor.fetchone()
        conn.close()
        
        if not booking:
            return jsonify({
                'success': False,
                'error': 'Booking not found'
            }), 404
        
        return jsonify({
            'success': True,
            'booking': dict(booking)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

# ============================================
# ADMIN PANEL
# ============================================

@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    """Admin login page"""
    if request.method == 'POST':
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        # Simple authentication
        if username == 'alip' and password == 'alip25':
            session['admin_logged_in'] = True
            return jsonify({'success': True}), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Invalid credentials'
            }), 401
    
    return render_template('admin_login.html')

@app.route('/admin/logout')
def admin_logout():
    """Admin logout"""
    session.pop('admin_logged_in', None)
    return redirect(url_for('admin_login'))

@app.route('/admin/dashboard')
def admin_dashboard():
    """Admin dashboard - View all bookings"""
    if not session.get('admin_logged_in'):
        return redirect(url_for('admin_login'))
    
    return render_template('admin.html')

@app.route('/admin/api/bookings', methods=['GET'])
def admin_get_bookings():
    """API: Get all bookings for admin"""
    if not session.get('admin_logged_in'):
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get filter parameters
        status_filter = request.args.get('status', 'all')
        payment_filter = request.args.get('payment', 'all')
        
        query = 'SELECT * FROM bookings WHERE 1=1'
        params = []
        
        if status_filter != 'all':
            query += ' AND booking_status = ?'
            params.append(status_filter)
        
        if payment_filter != 'all':
            query += ' AND payment_status = ?'
            params.append(payment_filter)
        
        query += ' ORDER BY created_at DESC'
        
        cursor.execute(query, params)
        bookings = cursor.fetchall()
        conn.close()
        
        results = [dict(booking) for booking in bookings]
        
        return jsonify({
            'success': True,
            'count': len(results),
            'bookings': results
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/admin/api/booking/<int:booking_id>/status', methods=['PUT'])
def admin_update_status(booking_id):
    """API: Update booking status"""
    if not session.get('admin_logged_in'):
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        data = request.get_json()
        booking_status = data.get('booking_status')
        payment_status = data.get('payment_status')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if booking_status:
            cursor.execute('''
                UPDATE bookings 
                SET booking_status = ? 
                WHERE id = ?
            ''', (booking_status, booking_id))
        
        if payment_status:
            cursor.execute('''
                UPDATE bookings 
                SET payment_status = ? 
                WHERE id = ?
            ''', (payment_status, booking_id))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Status updated successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/admin/api/booking/<int:booking_id>', methods=['DELETE'])
def admin_delete_booking(booking_id):
    """API: Delete booking"""
    if not session.get('admin_logged_in'):
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM bookings WHERE id = ?', (booking_id,))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Booking deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

# ============================================
# SERVE STATIC FILES (Your HTML/CSS/JS)
# ============================================

@app.route('/')
def index():
    """Serve index.html"""
    with open('static/index.html', 'r', encoding='utf-8') as f:
        return f.read()

@app.route('/booking')
def booking():
    """Serve booking.html"""
    with open('static/booking.html', 'r', encoding='utf-8') as f:
        return f.read()

@app.route('/history')
def history():
    """Serve history.html"""
    with open('static/history.html', 'r', encoding='utf-8') as f:
        return f.read()

# ============================================
# RUN APPLICATION
# ============================================

if __name__ == '__main__':
    # Create templates folder if doesn't exist
    if not os.path.exists('templates'):
        os.makedirs('templates')
    
    print("🚀 Javaterra Backend Server Starting...")
    print("📍 Local URL: http://127.0.0.1:5000")
    print("🔐 Admin Panel: http://127.0.0.1:5000/admin/login")
    print("   Username: alip")
    print("   Password: alip25")
    
    app.run(debug=True, host='0.0.0.0', port=5000)