# Testing the Health Appointment System

## 🧪 Complete Test Flow

### Step 1: Database Setup
1. Go to your Supabase dashboard
2. Open SQL Editor
3. Copy and paste the SQL from `DATABASE_SETUP_GUIDE.md`
4. Run the query to create all tables and sample data

### Step 2: Test Patient Flow
1. **Sign Up as Patient**:
   - Go to `http://localhost:3000/auth/sign-up`
   - Fill in: First Name: "John", Last Name: "Doe"
   - Select "Patient" as user type
   - Email: "patient@test.com"
   - Password: "password123"
   - Click "Create Account"

2. **Verify Email**:
   - Check your email inbox
   - Click the verification link
   - You'll be redirected to sign in

3. **Login as Patient**:
   - Go to `http://localhost:3000/auth/login`
   - Email: "patient@test.com"
   - Password: "password123"
   - Click "Sign In"

4. **Book Appointment**:
   - Click "Book Appointment" button
   - Select "Dr. Ananya Sharma — Cardiologist"
   - Choose tomorrow's date
   - Select time: "10:00"
   - Reason: "Regular checkup"
   - Click "Book Appointment"

5. **Check Dashboard**:
   - You should see your appointment listed
   - Status should be "Scheduled"
   - Click "Check In" to simulate arrival

### Step 3: Test Doctor Flow
1. **Sign Up as Doctor**:
   - Go to `http://localhost:3000/auth/sign-up`
   - Fill in: First Name: "Sarah", Last Name: "Wilson"
   - Select "Doctor" as user type
   - Email: "doctor@test.com"
   - Password: "password123"
   - Click "Create Account"

2. **Verify and Login**:
   - Verify email and login with doctor credentials

3. **View Patient Appointments**:
   - You should see the patient's appointment
   - Patient name should be visible
   - Click "Check Out & Complete" to finish appointment

### Step 4: Test Feedback System
1. **Login as Patient Again**:
   - The appointment should now show as "Completed"
   - You should see a feedback form
   - Rate 5 stars and write a review
   - Submit feedback

2. **Login as Doctor Again**:
   - Go to "Patient Feedback" section
   - You should see the 5-star rating and review

## ✅ Expected Results

After completing all tests, you should have:
- ✅ Working patient registration and login
- ✅ Working doctor registration and login
- ✅ Successful appointment booking
- ✅ Patient check-in functionality
- ✅ Doctor check-out functionality
- ✅ Feedback and rating system
- ✅ Real-time dashboard updates

## 🐛 Common Issues and Fixes

### "Profile not found" Error
- Run the database setup SQL again
- Make sure the trigger function is created

### "Doctor not found" Error
- Ensure sample doctors are inserted in the database
- Check that the doctors table exists

### Authentication Errors
- Verify email addresses in your email client
- Check Supabase Auth settings
- Ensure RLS policies are set up correctly

### Booking Errors
- Make sure you're logged in as a patient
- Check that the appointments table exists
- Verify the doctor_id is an integer

## 🎯 Success Criteria

The application is working correctly if:
1. Both patients and doctors can sign up and login
2. Patients can book appointments with doctors
3. Doctors can see patient information and appointments
4. Check-in/check-out flow works smoothly
5. Feedback system allows rating and reviews
6. Dashboards show correct statistics and data

If all tests pass, your Health Appointment System is fully functional!