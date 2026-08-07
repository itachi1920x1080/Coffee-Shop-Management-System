# ☕ Coffee Shop Management System - Frontend

This is the Frontend application for the Coffee Shop Management System. It provides a modern, responsive, and intuitive Point of Sale (POS) and management dashboard for coffee shop staff and managers.

## 🛠️ Tech Stack
- **Framework:** [React 19](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Routing:** [React Router](https://reactrouter.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **HTTP Client:** [Axios](https://axios-http.com/)
- **Payments:** `bakong-khqr` & `qrcode.react` (for Cambodian KHQR integration)

---

## 🚀 Local Setup & Installation

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (v18 or higher is recommended).
You also need the **Backend API** running locally. Refer to the `Backend/README.md` for instructions.

### 2. Install Dependencies
Open your terminal in the `Frontend` folder and install the required packages:

```bash
cd Frontend
npm install
```

### 3. Start the Development Server
Run the Vite development server:

```bash
npm run dev
```

The application will typically start at `http://localhost:5173`. 
*(Check your terminal output for the exact local link).*

---

## 🔌 Connecting to the Backend

By default, the frontend is configured to communicate with the FastAPI backend at `http://127.0.0.1:8000`. 
If your backend is running on a different port or host, you will need to update the `baseURL` in the Axios configuration file (e.g., `src/api/axios.js`).

### Authentication & Token Handling
The frontend uses JWT for authentication. When a user logs in, the `access_token` is stored in `localStorage`. 
Axios interceptors are set up to automatically attach this token as a `Bearer` token to the `Authorization` header of every subsequent API request.

### AI Features & Images
- **AI Menu Generation:** The frontend interacts with the `/ai/generate-menu` endpoint to automatically suggest products based on category names.
- **Images:** Uploaded and AI-generated images are served directly from the backend. The frontend prepends the backend base URL (e.g., `http://127.0.0.1:8000/uploads/...`) to display these images on the UI.

---

## 🧪 Testing

This project is configured with Vitest and React Testing Library for frontend unit testing.

To run the tests:
```bash
npm run test
```

Happy Coding! 💻☕
