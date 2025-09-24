# Patient Dashboard (FED Skills Test)

A responsive, single-page **Patient Dashboard** built with **vanilla HTML, CSS, and JavaScript**.  
Displays patient data such as demographics, diagnosis history, vitals, blood pressure charts, diagnostics list, and lab results.

---

## ✨ Features

- **Patients Rail (Left Sidebar)**
  - Search bar with debounced filtering
  - Scrollable list of patients with avatar, name, gender, and age
  - Click to view details (defaults to Jessica Taylor)

- **Center Panel**
  - **Blood Pressure Chart** with systolic/diastolic lines
  - Shaded bands showing normal/elevated ranges
  - **Vitals Tiles** (Heart Rate, Respiratory Rate, Temperature)
    - Each tile shows latest value and a tiny sparkline (last 6 months)
  - **Diagnostic List Table** with problem, description, and status

- **Right Panel (Profile)**
  - Patient avatar, name, and demographics
  - Key info: DOB, Gender, Contact, Emergency, Insurance
  - Scrollable **Lab Results** section
  - “Show All Information” button placeholder

- **Responsive Layout**
  - Collapses to two-column on smaller screens
  - Tiles and stats stack for mobile view

- **Visual Styling**
  - Clean light theme, rounded cards
  - Soft pastel highlights for tiles
  - Chart.js used for charts & sparklines

- **Footer**
  - Credit line: `Done by Sai Lohith`

---

## 🛠️ Tech Stack

- **HTML5** — semantic structure  
- **CSS3** — grid/flexbox, custom tokens, responsive design  
- **JavaScript (ES6)** — fetch API, DOM manipulation, debouncing  
- **Chart.js v4** — charts and sparklines  
- **Google Fonts (Inter)** — clean typography  

---

## 🚀 Getting Started

### 1. Clone / Download

```bash
git clone https://github.com/Sai-Lohith-Panthangi/patient-dashboard
cd patient-dashboard
```

Or simply download the project ZIP.

### 2. Open in Browser

No build tools required. Just open `index.html` in your browser.

### 3. Run with VS Code (optional)

If you want live reload:

- Install **Live Server** VSCode extension  
- Right-click `index.html` → "Open with Live Server"

---

## 📂 Project Structure

```
patient-dashboard/
│
├── index.html       # Main HTML layout
├── style.css        # Stylesheet (cards, grid, responsiveness)
├── script.js        # JS logic (fetch, render, charts)
└── README.md        # This file
```

---

## 📊 Data Source

Data is fetched from:

```
https://fedskillstest.coalitiontechnologies.workers.dev
```

- Uses **Basic Auth** (credentials are embedded in script.js)  
- API returns patient records including diagnosis history, vitals, and labs  


## 👨‍💻 Author

Built from scratch and completed by **Sai Lohith**  
For the **FED Skills Test** project.

---
