# ☕ Coffee Shop Management System - Backend API

សួស្តី Frontend Team! 👋 
នេះគឺជាឯកសារ (Documentation) សម្រាប់ Backend នៃគម្រោងប្រព័ន្ធគ្រប់គ្រងហាងកាហ្វេរបស់យើង។ Backend នេះត្រូវបានសរសេរឡើងដោយប្រើប្រាស់ **Python FastAPI** និងប្រើប្រាស់ស្ថាបត្យកម្ម **Clean Architecture** ដើម្បីងាយស្រួលក្នុងការអភិវឌ្ឍ និងថែរក្សា។

---

## 🛠️ Tech Stack របស់យើង
* **Backend Framework:** FastAPI
* **Database:** MySQL
* **ORM:** SQLAlchemy
* **Authentication:** JWT (JSON Web Tokens) & Passlib (Bcrypt)
* **PDF Generation:** ReportLab
* **Frontend (Target):** React + Vite + Tailwind CSS + Axios

---

## 🚀 របៀបដំឡើង និងដំណើរការ (Local Setup)
សូមអនុវត្តតាមជំហានខាងក្រោមដើម្បីដំណើរការ API នេះនៅលើកុំព្យូទ័ររបស់អ្នកសម្រាប់ការអភិវឌ្ឍ Frontend៖

### 1. ទាញយកកូដ (Clone Repository)
```bash
git clone <link_github_repository_របស់យើង>
cd Coffee_shop_management_system/Backend
```

### 2. បង្កើត Virtual Environment និងដំឡើង Library

```bash
# បង្កើត Virtual Environment
python -m venv venv

# បើក Virtual Environment (សម្រាប់ Windows)
venv\Scripts\activate

# ដំឡើង Package ទាំងអស់ដែលចាំបាច់
pip install -r requirements.txt
```

### 3. រៀបចំ Database

* បើកកម្មវិធី MySQL (XAMPP/WAMP/MySQL Workbench) របស់អ្នក។
* បង្កើត Database ថ្មីមួយឈ្មោះថា `coffee_shop_db`។
```sql
CREATE DATABASE coffee_shop_db;
```



### 4. បង្កើតឯកសារ Environment Variables (.env)

នៅក្នុង Folder `Backend` សូមបង្កើត File មួយឈ្មោះថា `.env` រួចចម្លងទិន្នន័យនេះចូល (ដូរ Password តាមកុំព្យូទ័ររបស់អ្នកបើមាន)៖

```env
PROJECT_NAME="Coffee Shop Management System"
DATABASE_URL="mysql+pymysql://root:@localhost:3306/coffee_shop_db"
SECRET_KEY="my_super_secret_key_change_this_later"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30
GEMINI_API_KEY="your_google_gemini_api_key_here"
```

### 5. ដំណើរការ Server

```bash
uvicorn main:app --reload
```

🎉 **Server នឹងដំណើរការនៅលើ:** `http://127.0.0.1:8000`

---

## 📖 របៀបមើល API Documentation (សុំកុំរំលងចំណុចនេះ)

អ្នកមិនចាំបាច់សួរខ្ញុំថា "តើ API នេះផ្ញើទិន្នន័យអ្វីខ្លះ?" នោះទេ!
FastAPI បានបង្កើតផ្ទាំងអាន API យ៉ាងស្រស់ស្អាតដោយស្វ័យប្រវត្តិ។ នៅពេល Server កំពុងដើរ សូមចូលទៅកាន់៖
👉 **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)** (Swagger UI)

នៅទីនោះអ្នកអាចមើលឃើញ Endpoints ទាំងអស់, ទម្រង់ JSON ដែលត្រូវបញ្ជូន និងអាចចុច **"Try it out"** ដើម្បីធ្វើតេស្ត API ផ្ទាល់ៗបានទៀតផង។

---

## 🔐 ការភ្ជាប់ Authentication (សម្រាប់ Axios)

គ្រប់ API ស្ទើរតែទាំងអស់តម្រូវឱ្យមាន Login។ នេះជារបៀបដែល Frontend ត្រូវធ្វើ៖

1. **Login:** បញ្ជូន POST request ទៅកាន់ `/auth/login` ជាទម្រង់ `x-www-form-urlencoded` (មាន `username` និង `password`)។
2. **ទទួល Token:** API នឹងបញ្ជូនមកវិញនូវ `access_token`។ សូមរក្សាទុកវា (ឧ. ក្នុង `localStorage` ឬ `Zustand/Redux`)។
3. **បញ្ជូន Token (Authorization):** រាល់ពេលហៅ API ផ្សេងៗ សូមភ្ជាប់ Token នេះនៅក្នុង Axios Headers:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});

// Axios Interceptor ដើម្បីភ្ជាប់ Token គ្រប់ Request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

*(ចំណាំ៖ Token នេះមានសុពលភាពតែ ៣០ នាទីប៉ុណ្ណោះ។ បើ Expired នឹងលោត Error 401)*។

---

## 🖼️ ការទាញយករូបភាព និង PDF

* **រូបភាព (Images):** នៅពេលអ្នកទាញយកទិន្នន័យ Menu, `image` នឹងមានរាងជា `/uploads/images/menu_1.jpg`។ ដើម្បីបង្ហាញលើ UI សូមភ្ជាប់វាជាមួយ Base URL:
`<img src="http://127.0.0.1:8000/uploads/images/menu_1.jpg" />`
* **វិក្កយបត្រ (Receipt PDF):** Frontend អាចហៅ GET ទៅកាន់ `/receipts/{order_id}/download` វានឹងបញ្ជូន File PDF មកឲ្យ Download ដោយផ្ទាល់។

---

## 🗂️ ម៉ូឌុលសំខាន់ៗដែលមានក្នុងប្រព័ន្ធ

* **Auth:** សម្រាប់ចុះឈ្មោះ និងចូលប្រើប្រាស់។
* **Categories & Menus:** គ្រប់គ្រងមុខម្ហូប និងរូបភាព។
* **AI Features:** បង្កើតឈ្មោះផលិតផលថ្មីៗដោយស្វ័យប្រវត្តិជាមួយ Google Gemini AI និងបង្កើតរូបភាពដោយស្វ័យប្រវត្តិ។
* **Tables:** គ្រប់គ្រងតុ និងស្ថានភាព (Available, Occupied, Reserved)។
* **Customers:** គ្រប់គ្រងអតិថិជន និងរាប់ចំនួនដងនៃការទិញ (Visits)។
* **Orders:** បង្កើតបញ្ជាទិញ (គណនាតម្លៃសរុបដោយស្វ័យប្រវត្តិ)។
* **Payments:** ទូទាត់ប្រាក់ (ប្តូរប្រាក់ USD/KHR ដោយស្វ័យប្រវត្តិ)។
* **Receipts:** ទាញយកវិក្កយបត្រជា PDF។
* **Dashboard:** ទាញយកទិន្នន័យសង្ខេបប្រចាំថ្ងៃ។
* **Expenses:** គ្រប់គ្រងការចំណាយ។
* **Reports:** ទាញយករបាយការណ៍ចំណេញ/ខាត ជា PDF និង Excel (CSV) តាមកាលបរិច្ឆេទ។

---

## 🧪 របៀបដំណើរការការធ្វើតេស្ត (Running Tests)
គម្រោងនេះមានភ្ជាប់មកជាមួយនូវ Automated Tests ដើម្បីធានាគុណភាពកូដ។ ដើម្បីដំណើរការការធ្វើតេស្ត សូមវាយពាក្យបញ្ជា៖

```bash
pytest -v
```

ប្រសិនបើមានចម្ងល់ត្រង់ API ណាមួយ អាចឆាតសួរខ្ញុំបាន! Happy Coding! 💻🚀
