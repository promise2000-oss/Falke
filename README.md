# Aurikrex Frontend

A modern React-based learning platform featuring AI-powered tutoring, personalized lessons, and comprehensive library management. Built with TypeScript, Vite, and Tailwind CSS.

## 🚀 Features

- **AI-Powered Learning**: FalkeAI Tutor for instant explanations and smart lessons
- **Authentication**: Email/password, Google OAuth, and phone OTP verification
- **Dashboard**: Analytics, progress tracking, and quick actions
- **Library**: Upload and manage learning materials
- **Responsive Design**: Mobile-first with dark/light theme support
- **Real-time Updates**: Live progress and activity tracking

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, ShadCN UI components
- **Animations**: Framer Motion
- **Authentication**: Custom backend with JWT tokens
- **State Management**: React Context
- **Routing**: React Router
- **Icons**: Lucide React
- **Notifications**: Sonner (toast library)

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Backend API server running

## 🏗️ Installation

1. **Clone the repository**:
```bash
git clone <repository-url>
cd aurikrex-frontend/Falke
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment**:
   - Copy `.env.example` to `.env.local`
   - Set your backend API URL:
```env
VITE_API_URL=https://your-backend-api.com
```

4. **Run development server**:
```bash
npm run dev
```

5. **Build for production**:
```bash
npm run build
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard widgets
│   ├── library/        # Library components
│   └── ui/             # ShadCN UI components
├── context/            # React Context providers
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── pages/              # Page components
├── services/           # API service functions
├── types/              # TypeScript type definitions
└── utils/              # Helper utilities
```

## 🔐 Authentication

The app supports multiple authentication methods:

- **Email/Password**: Traditional signup with password validation
- **Google OAuth**: One-click sign-in with Google accounts
- **Phone OTP**: SMS verification for mobile users

User sessions are managed with JWT tokens stored in localStorage.

## 🎨 UI Components

Built with ShadCN UI and Tailwind CSS for consistent, accessible design:

- Form components with validation
- Modal dialogs and drawers
- Charts and data visualization
- Responsive navigation and layouts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add some feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Korede Omotosho** - Founder & Developer

## 🙏 Acknowledgments

- Built with love for education and AI innovation
- Powered by FalkeAI and Aurikrex vision
      // other options...
    },
  },
])
```
