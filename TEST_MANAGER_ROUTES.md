# Testing Manager Dashboard Routes

## Quick Test Commands

### Test if Backend is Running
Open your browser or use curl to test:

1. **Test Logged-In Users Route:**
   ```
   http://localhost:5000/api/manager/users/logged-in
   ```
   Should return: `[]` (empty array) or array of users

2. **Test Bookings Route:**
   ```
   http://localhost:5000/api/manager/bookings
   ```
   Should return: `[]` (empty array) or array of bookings

3. **Test Stats Route:**
   ```
   http://localhost:5000/api/manager/stats
   ```
   Should return: JSON object with statistics

## If Routes Return 404

1. **Restart the backend server:**
   ```bash
   cd backend
   # Press Ctrl+C to stop
   npm start
   ```

2. **Check the backend terminal for errors**

3. **Verify the routes file is correct:**
   - Check `backend/routes/manager.js`
   - Make sure `/users/logged-in` route is defined BEFORE `/users` route

## If Routes Return Empty Arrays

This is **NORMAL** if:
- No users have logged in yet
- No bookings have been made yet

**To create test data:**

1. **Create a user and login:**
   - Go to `/signup` and create an account
   - Go to `/login` and login (this sets `lastLogin`)
   - Now check manager dashboard - you should see the user

2. **Create a booking:**
   - Login as a user
   - Go to `/book` and make a booking
   - Now check manager dashboard - you should see the booking

## Common Issues

### Issue: "Cannot GET /api/manager/users/logged-in"
**Solution:** Restart backend server

### Issue: Empty arrays but you know data exists
**Solution:** 
- Check database connection
- Verify data in MongoDB
- Check browser console for errors

### Issue: CORS errors
**Solution:** Make sure backend has `app.use(cors())` in server.js


