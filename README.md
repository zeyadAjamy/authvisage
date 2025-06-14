# AuthVisage Platform

> **Secure, modern face authentication platform built with Next.js**

AuthVisage Platform is a comprehensive web application that provides face-based authentication services. Users can register their biometric data, manage authentication projects, and integrate face authentication into their applications through our SDK.

## What is AuthVisage?

AuthVisage is a biometric authentication platform that replaces traditional passwords with secure facial recognition. Whether you're a developer building the next big app or a business looking to enhance security, AuthVisage makes face authentication simple and secure.

### Key Features

- 🎯 **Biometric Registration** - Capture and securely store facial biometric data
- 🚀 **Project Management** - Create and configure authentication projects
- 🔗 **Connected Apps** - Manage applications using AuthVisage authentication
- ⚙️ **Profile Settings** - Customize your account and preferences
- 🛡️ **Privacy-First** - End-to-end encryption with no third-party data sharing
- 📱 **Developer-Friendly** - Easy-to-use SDK for seamless integration

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd platform
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Configure your environment variables:

   ```env
   NEXT_PUBLIC_PLATFORM_URL=http://localhost:3000
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
   NEXT_PUBLIC_AUTHORIZED_REDIRECT_PATH=/connected-apps
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Built With

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **State Management**: [React Query](https://tanstack.com/query)
- **Biometrics**: MediaPipe for fram filtering
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React

## 📁 Project Structure

```
platform/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/       # Protected dashboard pages
│   │   ├── capture-biometric/
│   │   ├── connected-apps/
│   │   ├── profile-settings/
│   │   └── projects/
│   └── (public)/          # Public pages
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (shadcn/ui)
│   └── app-sidebar/      # Navigation components
├── features/             # Feature-specific code
│   ├── auth/            # Authentication logic
│   ├── projects/        # Project management
│   └── profile-settings/ # User settings
├── lib/                  # Utilities and configurations
└── types/               # TypeScript type definitions
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🔒 Security & Privacy

AuthVisage is built with privacy and security as core principles:

- **End-to-End Encryption**: All biometric data is encrypted during capture and storage
- **No Image Storage**: We store mathematical representations, never actual photos
- **GDPR & CCPA Compliant**: Meets global data protection standards
- **Zero Third-Party Sharing**: Your biometric data stays with you

## 🌐 Integration

Integrate AuthVisage into your applications using our SDK:

```typescript
import { AuthVisageClient } from "authvisage-sdk";

const authClient = new AuthVisageClient({
  platformUrl: "https://your-platform-url.com",
  backendUrl: "https://your-backend-url.com/api/v1",
  projectId: "your-project-id",
  redirectUrl: "https://yourapp.com/callback",
});

// Start face authentication
await authClient.faceLogin();
```

## 🤝 Contributing

We welcome contributions!

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- 📧 Email: zeyad.alajamy@gmail.com

**Ready to revolutionize authentication?** Get started with AuthVisage today! 🚀
