---
description: how to run the CineCircle application
---

To run the CineCircle application locally, follow these steps:

1. **Install Dependencies**
   Run the following command in the project root:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Ensure your `.env.local` file is properly configured. You need to set:
   - `MONGODB_URI`: Your MongoDB connection string.
   - `JWT_SECRET`: A secret key for JWT signing.
   - `NEXT_PUBLIC_TMDB_API_KEY`: Your TMDB API key.

3. // turbo
   **Run the Development Server**
   Start the application in development mode:
   ```bash
   npm run dev
   ```

4. **Access the App**
   Open [http://localhost:3000](http://localhost:3000) in your browser.
