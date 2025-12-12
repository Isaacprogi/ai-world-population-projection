# 🌍 AI World Population Projection

**Live Demo** → Deploy yours instantly: 
https://vercel.com/new/clone?repo-url=https://github.com/your-username/ai-world-population-projection

<img src="https://github.com/isaacprogi/ai-world-population-projection/raw/main/public/screenshot.png" alt="AI World Population Projection screenshot" />

A beautiful, lightning-fast web app that instantly shows **UN-based world population projections** for any year with accurate male/female breakdown and interactive charts.

Powered by **Groq** + **Llama 3.3 70B** + **React + Tailwind + Recharts**

## ✨ Features

- Enter any year (1950–2150) → instant AI-powered UN projection  
- Precise **male & female** population split  
- Interactive **bar chart** (gender in target year)  
- Smooth **line chart** (1950 → 2100 trend)  
- Mobile-responsive dark UI  
- Zero lag thanks to Groq inference  

## 🚀 Tech Stack

- React + TypeScript + Vite  
- Tailwind CSS  
- Recharts  
- Groq API (`llama-3.3-70b-versatile`)  
- Lucide React icons  
- React-Markdown  

## 🛠 Run Locally

```bash
git clone https://github.com/your-username/ai-world-population-projection.git
cd ai-world-population-projection
npm install
```

Create .env file:

```bash
VITE_GROQ_API_KEY=your_groq_key_here
```
Get your free key

```bash
 https://console.groq.com
 ```

Then run:
```bash
npm run dev
```

Open 

```bash
http://localhost:5173
```


## Data Accuracy
Projections follow the [United Nations World Population Prospects 2024](https://population.un.org/wpp/) (medium-fertility variant).  
We use **"projection"** — not "prediction" — because that’s the correct demographic science term.

## Contributing
Pull requests are very welcome! Ideas include:

- Add country/region projections  
- Show age pyramid  
- Display fertility rate trends  
- Add export to PNG/PDF  

## Support
Star the repository if you like it!  

Made with ❤️ in 2025  
Deployed in seconds · Powered by the fastest AI inference on Earth
