from flask import Flask, render_template, url_for, request, redirect, session, flash, jsonify
from flask_wtf import CSRFProtect
from flask_wtf.csrf import generate_csrf
import os
import secrets
from werkzeug.security import generate_password_hash, check_password_hash
import json
from datetime import datetime, timedelta

# Initialize Flask app
app = Flask(__name__, static_url_path='/static', static_folder='static')

# Security configurations
app.config['SECRET_KEY'] = secrets.token_hex(16)  # Generate a secure random key
app.config['SESSION_COOKIE_SECURE'] = True  # Only send cookies over HTTPS
app.config['SESSION_COOKIE_HTTPONLY'] = True  # Prevent JavaScript access to cookies
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # CSRF protection
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=1)  # Session timeout

# Initialize CSRF protection
csrf = CSRFProtect(app)

# Mock database for bookings (in production, use a real database)
bookings = []

@app.route('/')
def home():
    return render_template('index.html')


@app.route('/booking')
def booking():
    return render_template('booking.html')


@app.route('/api/csrf-token')
def get_csrf_token():
    return jsonify({'csrf_token': generate_csrf()})

@app.route('/api/submit-booking', methods=['POST'])
def submit_booking():
    if request.method == 'POST':
        try:
            # Get form data
            data = request.get_json()
            
            # Validate required fields
            required_fields = ['fullName', 'passportNumber', 'nationality', 
                              'dateOfBirth', 'phone', 'email']
            
            for field in required_fields:
                if field not in data or not data[field]:
                    return jsonify({'success': False, 'error': f'Missing required field: {field}'}), 400
            
            # Validate email format (basic check)
            if '@' not in data['email'] or '.' not in data['email']:
                return jsonify({'success': False, 'error': 'Invalid email format'}), 400
            
            # Create booking record with timestamp and sanitized data
            booking = {
                'id': secrets.token_hex(8),
                'timestamp': datetime.now().isoformat(),
                'fullName': data['fullName'][:100],  # Limit string length
                'passportNumber': data['passportNumber'][:20],
                'nationality': data['nationality'][:50],
                'dateOfBirth': data['dateOfBirth'],
                'phone': data['phone'][:20],
                'email': data['email'][:100],
                'specialRequests': data.get('specialRequests', '')[:500],
                'paymentMethod': data.get('paymentMethod', 'unknown'),
                'status': 'pending'
            }
            
            # In production, save to database
            bookings.append(booking)
            
            # Return success response with booking ID
            return jsonify({
                'success': True, 
                'message': 'Booking submitted successfully',
                'bookingId': booking['id']
            })
            
        except Exception as e:
            # Log the error (in production)
            print(f"Error processing booking: {str(e)}")
            return jsonify({'success': False, 'error': 'Server error processing your booking'}), 500
    
    return jsonify({'success': False, 'error': 'Method not allowed'}), 405

@app.route('/api/payment-intent', methods=['POST'])
def create_payment_intent():
    # In production, integrate with Stripe API to create a payment intent
    # This is a mock implementation
    try:
        data = request.get_json()
        
        # Validate booking ID
        if 'bookingId' not in data:
            return jsonify({'success': False, 'error': 'Missing booking ID'}), 400
        
        # In production, verify booking exists in database
        
        # Mock payment intent creation
        payment_intent = {
            'id': secrets.token_hex(16),
            'amount': 10000,  # $100.00
            'currency': 'usd',
            'status': 'requires_payment_method'
        }
        
        return jsonify({
            'success': True,
            'clientSecret': f"pi_{payment_intent['id']}_secret_test",
            'amount': payment_intent['amount']
        })
        
    except Exception as e:
        print(f"Error creating payment intent: {str(e)}")
        return jsonify({'success': False, 'error': 'Server error processing payment'}), 500

@app.route('/contact', methods=['GET', 'POST'])
def contact():
    if request.method == 'POST':
        try:
            # Get form data
            name = request.form.get('name')
            email = request.form.get('email')
            message = request.form.get('message')
            
            # Validate required fields
            if not name or not email or not message:
                return jsonify({'success': False, 'error': 'All fields are required'}), 400
            
            # Validate email format (basic check)
            if '@' not in email or '.' not in email:
                return jsonify({'success': False, 'error': 'Invalid email format'}), 400
            
            # In production, you would send an email or store in database
            # For now, we'll just log it
            print(f"Contact form submission: {name} ({email}): {message}")
            
            # Return success response
            return jsonify({'success': True, 'message': 'Your message has been sent successfully'})
            
        except Exception as e:
            # Log the error (in production)
            print(f"Error processing contact form: {str(e)}")
            return jsonify({'success': False, 'error': 'Server error processing your message'}), 500
    
    # GET request - render the contact page
    return render_template('contact.html')

# Error handlers
@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def server_error(e):
    return render_template('500.html'), 500

# Security headers middleware
@app.after_request
def add_security_headers(response):
    response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self' https://cdn.tailwindcss.com https://js.stripe.com https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; img-src 'self' data:; font-src 'self' https://cdnjs.cloudflare.com; connect-src 'self'"
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'SAMEORIGIN'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    return response

@app.route('/privacy')
def privacy():
    return render_template('privacy.html')

if __name__ == '__main__':
    # In production, use a proper WSGI server and set debug=False
    app.run(debug=True)