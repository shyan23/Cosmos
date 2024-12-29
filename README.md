# 🌌 Cosmos: An Astronomical Database

Cosmos is your gateway to the universe! This project is an astronomical database with a custom schema that enables exciting visualizations of celestial data. From exploring planetary coordinates to analyzing stellar distributions, CosmoVault makes cosmic exploration intuitive and interactive.

## 🚀 Features

- **Custom Schema**: A meticulously designed schema for organizing astronomical data.
- **Visualizations**: Stunning plots and charts, including:
  - Coordinate Plots
  - Planetary Systems
  - Stellar Distributions
  - Telescope Discoveries Over Time
- **Interactive Frontend**: A sleek, user-friendly interface for celestial exploration.
- **REST API**: Powered by FastAPI for seamless backend functionality.

## 🛠️ Getting Started

Follow these steps to set up and run the project on your local machine.

### Backend Setup

1. **Navigate to the Backend Directory**:
   ```bash
   cd Backend/Analysis
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the Backend Server**:
   ```bash
   uvicorn main:app --reload
   ```

   The backend server will start at `http://127.0.0.1:8000/`.

### Frontend Setup

1. **Navigate to the Frontend Directory**:
   ```bash
   cd databasefrontend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run the Frontend Server**:
   ```bash
   npm run dev
   ```

   The frontend will be accessible at `http://localhost:3000/`.

## 📊 Visualizations

### Coordinate Plot
- Displays the celestial coordinates (RA and DEC) of planets in a selected star system.
- Accessible via the frontend dropdown for star system selection.

### Planetary Systems
- Visualizes the structure and components of planetary systems.

### Stellar Distribution
- Offers insights into the distribution of stars in the database.

### Telescope Discoveries
- Tracks the number of telescope discoveries over time.

## 📂 Project Structure

```
CosmoVault
├── Backend
│   ├── Analysis
│   │   ├── main.py
│   │   ├── Coordinate_plot.py
│   │   └── ...
│   └── image
├── databasefrontend
│   ├── pages
│   ├── components
│   └── ...
├── requirements.txt
└── README.md
```

## 🤝 Contributing

We welcome contributions! Feel free to fork the repository and submit pull requests.


## 🌠 Acknowledgments

Special thanks to:
- The developers of FastAPI and Next.js for providing powerful frameworks.
- The astronomy community for inspiring this project.

---

Embark on your cosmic journey with **Cosmos** today! 🚀
